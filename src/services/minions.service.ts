import { FeedEvent, Minion, MinionFeed } from "../infrastructure/generated/api";
import { ApiFacade } from "../infrastructure/generated/proxies/api-proxies";
import { DataService } from "../infrastructure/data-service-base";
import { envFacade } from "../infrastructure/env-facade";
import { sessionManager } from "../infrastructure/session-manager";
import { API_KEY_HEADER } from "../infrastructure/consts";
import { timelineService } from "./timeline.service";

// Inherited from DataService
class MinionsService extends DataService<Minion[]> {

	// The minion SSE feed object
	minionsServerFeed: EventSource;

	private onMinionFeedUpdate(minionFeedEvent: MessageEvent) {
		// Ignore the init message
		if (minionFeedEvent.data === '"init"') {
			return;
		}

		// Handle the incoming message
		const minionFeed: MinionFeed = JSON.parse(minionFeedEvent.data);

		// Update the minion collection with the change
		switch (minionFeed.event) {
			case FeedEvent.Update: {
				this.updateMinion(minionFeed.minion);
				// Fetch new timeline *after* update arrived from BE 
				timelineService.forceFetchData();
				break;
			}
			case FeedEvent.Created: {
				this.createMinion(minionFeed.minion);
				break;
			}
			case FeedEvent.Removed: {
				this.deleteMinion(minionFeed.minion);
				break;
			}
		}
	}

	public updateMinion(minion: Minion) {
		const minionIndex = this._data.findIndex(m => m.minionId === minion.minionId);
		if (minionIndex !== -1) {
			this._data[minionIndex] = minion;
		}
		// Publish the update
		this.postNewData(this._data);

		// On mock (only) mode, fetch timeline on every change
		if(envFacade.mockMode || envFacade.isDemoApiUrl){
			timelineService.forceFetchData();
		}
	}

	public createMinion(minion: Minion) {
		this._data.push(minion);
		// Publish the update
		this.postNewData(this._data);
	}

	public deleteMinion(minion: Minion) {
		const minionIndex = this._data.findIndex(m => m.minionId === minion.minionId);

		if (minionIndex !== -1) {
			this._data.splice(minionIndex, 1);
		}
		// Publish the update
		this.postNewData(this._data);
	}

	fetchData(): Promise<Minion[]> {
		// Get the fetch data function (without activating it yet)
		const minionsFetchFunc = ApiFacade.MinionsApi.getMinions();

		try {
			// Restart SSE feed
			if (this.minionsServerFeed) {
				this.minionsServerFeed.close();
			}

			// Open SSE connection
			this.minionsServerFeed = new EventSource(`${envFacade.apiUrl}/feed/minions?${API_KEY_HEADER}=${sessionManager.getToken()}`, {
				withCredentials: true,
			});

			// Subscribe to updated
			this.minionsServerFeed.onmessage = (minionFeedEvent: MessageEvent) => {
				this.onMinionFeedUpdate(minionFeedEvent);
			};
		} catch (error) {
			// TODO:LOG
		}	

		// TODO: on close/error?

		return minionsFetchFunc;
	}
}

export const minionsService = new MinionsService();