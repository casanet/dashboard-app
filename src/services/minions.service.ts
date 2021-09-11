import { FeedEvent, Minion, MinionFeed } from "../infrastructure/generated/api";
import { ApiFacade } from "../infrastructure/generated/proxies/api-proxies";
import { DataService } from "../infrastructure/data-service-base";
import { envFacade } from "../infrastructure/env-facade";
import { sessionManager } from "../infrastructure/session-manager";
import { API_KEY_HEADER } from "../infrastructure/consts";

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
				const minionIndex = this.data.findIndex(m => m.minionId === minionFeed.minion.minionId);
				if (minionIndex !== -1) {
					this.data[minionIndex] = minionFeed.minion;
				}
				break;
			}
			case FeedEvent.Created: {
				this.data.push(minionFeed.minion);
				break;
			}
			case FeedEvent.Removed: {
				const minionIndex = this.data.findIndex(m => m.minionId === minionFeed.minion.minionId);

				if (minionIndex !== -1) {
					this.data.splice(minionIndex, 1);
				}
				break;
			}
		}
		// Publish the update
		this.postNewData(this.data);
	}

	fetchData(): Promise<Minion[]> {
		try {

			// Get the fetch data function (without activating it yet)
			const minionsFetchFunc = ApiFacade.MinionsApi.getMinions();

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

			return minionsFetchFunc;
		} catch (error) {
			// TODO:NOTIFICATION
			throw error;
		}
	}
}

export const minionsService = new MinionsService();