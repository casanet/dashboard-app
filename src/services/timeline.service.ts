import { DataService } from 'frontal-data-manager';
import { ApiFacade, MinionTimeline } from "../infrastructure/generated/api/swagger/api";

class TimelineService extends DataService<MinionTimeline[]> {

	constructor() {
		super([]);
	}

	fetchData(): Promise<MinionTimeline[]> {
		// Get the fetch data function (without activating it yet)
		return ApiFacade.MinionsApi.getMinionsTimeline();
	}
}

export const timelineService = new TimelineService();
