import { envFacade } from "../infrastructure/env-facade";
import { sessionManager } from "../infrastructure/session-manager";
import { API_KEY_HEADER } from "../infrastructure/consts";
import { ApiFacade, Timing, TimingFeed } from "../infrastructure/generated/api/swagger/api";
import { DashboardService } from './base.service';

// Inherited from DataService
class TimingsService extends DashboardService<Timing[]> {

	// The timing SSE feed object
	timingsServerFeed: EventSource;

	constructor() {
		super([], {
			useDashboardCache: true,
			cacheKey: 'TimingsService',
		});
	}

	private onTimingsFeedUpdate(timingFeedEvent: MessageEvent) {
		// Ignore the init message
		if (timingFeedEvent.data === '"init"') {
			return;
		}

		// Handle the incoming message
		const timingFeed: TimingFeed = JSON.parse(timingFeedEvent.data);

		// TODO, show some popup about the timing that activated
		console.log(JSON.stringify(timingFeed));
	}

	public updateTiming(timing: Timing) {
		const timingIndex = this._data.findIndex(m => m.timingId === timing.timingId);
		if (timingIndex !== -1) {
			this._data[timingIndex] = timing;
		}
		// Publish the update
		this.postNewData(this._data);
	}

	public createTiming(timing: Timing) {
		this._data.push(timing);
		// Publish the update
		this.postNewData(this._data);
	}

	public deleteTiming(timing: Timing) {
		const timingIndex = this._data.findIndex(m => m.timingId === timing.timingId);

		if (timingIndex !== -1) {
			this._data.splice(timingIndex, 1);
		}
		// Publish the update
		this.postNewData(this._data);
	}

	fetchData(): Promise<Timing[]> {
		// Get the fetch data function (without activating it yet)
		const timingsFetchFunc = ApiFacade.TimingsApi.getTimings();

		try {
			// Restart SSE feed
			if (this.timingsServerFeed) {
				this.timingsServerFeed.close();
			}

			// Open SSE connection
			this.timingsServerFeed = new EventSource(`${envFacade.apiUrl}/feed/timings?${API_KEY_HEADER}=${sessionManager.getToken()}`, {
				withCredentials: true,
			});

			// Subscribe to updated
			this.timingsServerFeed.onmessage = (timingFeedEvent: MessageEvent) => {
				this.onTimingsFeedUpdate(timingFeedEvent);
			};
		} catch (error) {
			// TODO:LOG
		}	

		// TODO: on close/error?
		return timingsFetchFunc;
	}
}

export const timingsService = new TimingsService();