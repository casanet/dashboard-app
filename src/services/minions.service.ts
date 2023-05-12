import { DataService } from 'frontal-data-manager';
import { envFacade } from "../infrastructure/env-facade";
import { sessionManager } from "../infrastructure/session-manager";
import { API_KEY_HEADER, PULL_MINION_ACTIVATION } from "../infrastructure/consts";
import { timelineService } from "./timeline.service";
import { ApiFacade, FeedEvent, Minion as ApiMinion, MinionFeed } from "../infrastructure/generated/api/swagger/api";
import { livelinessFlag } from "./liveliness.service";
import { timeOutService } from './timeout.service';

export interface Minion extends ApiMinion {
	readonly?: boolean;
} 

function sortMinionsFormula(a: Minion, b: Minion): number {
	return a.name?.toLowerCase() < b.name?.toLowerCase() ? -1 : 1;
}

// Inherited from DataService
class MinionsService extends DataService<Minion[]> {

	// The minion SSE feed object
	minionsServerFeed: EventSource;

	// Used to keep an O1 map to get minion by id
	private _minionsMap: { [key in string]: Minion } = {}; 

	constructor() {
		super([]);
		// Activate activation to pull miniona
		setInterval(this.pullMinionsActivation, PULL_MINION_ACTIVATION.Milliseconds);
	}

	private async pullMinionsActivation() {
		// Do nothing in case of not online / not logged on
		if (!livelinessFlag.online || !sessionManager.isLoggedOn) {
			return;
		}
		try {
			// Trigger minions update
			await minionsService.forceFetchData();
		} catch (error) {
			// TODO add logger
		}
	}

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
				// Fetch new timeline and timeout countdown info *after* update arrived from BE 
				timelineService.forceFetchData();
				timeOutService.forceFetchData();
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
			this._minionsMap[minion.minionId || ''] = minion;
		}
		// Publish the update
		this.postNewData(this._data);

		// On mock (only) mode, fetch timeline on every change
		if (envFacade.mockMode || envFacade.isDemoApiUrl) {
			timelineService.forceFetchData();
		}
	}

	public createMinion(minion: Minion) {
		this._data.push(minion);
		this._minionsMap[minion.minionId || ''] = minion;
		// Publish the update
		this.postNewData(this._data);
	}

	public deleteMinion(minion: Minion) {
		const minionIndex = this._data.findIndex(m => m.minionId === minion.minionId);

		if (minionIndex !== -1) {
			this._data.splice(minionIndex, 1);
			delete this._minionsMap[minion.minionId || ''];
		}
		// Publish the update
		this.postNewData(this._data);
	}

	/**
	 * Get minion by id, this method used to avoid N*N find, use it, instead of running on the minions collection to find one
	 * @param minionId 
	 * @returns The minion, or undefined if not exists
	 */
	public getMinion(minionId: string): Minion | undefined {
		return this._minionsMap[minionId];
	}

	async fetchData(): Promise<Minion[]> {

		// Before feting, init the SSE feed
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
		} catch (error: any) {
			console.error(`[MinionsService.fetchData] failed to open SSE feed, ${error?.message}`)
		}

		// Get the fetch data function (without activating it yet)
		const fetchedMinions = await ApiFacade.MinionsApi.getMinions();
		
		// Load the map
		for (const minion of fetchedMinions) {
			this._minionsMap[minion.minionId || ''] = minion;
		}

		const finalMinion = fetchedMinions.sort(sortMinionsFormula);

		return finalMinion;
	}
}

export const minionsService = new MinionsService();