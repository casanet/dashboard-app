import { MinionTimeline } from "../infrastructure/generated/api";
import { ApiFacade } from "../infrastructure/generated/proxies/api-proxies";
import { DataService } from "../infrastructure/data-service-base";

class TimelineService extends DataService<MinionTimeline[]> {

	fetchData(): Promise<MinionTimeline[]> {
		// Get the fetch data function (without activating it yet)
		return ApiFacade.MinionsApi.getMinionsTimeline();
	}
}

export const timelineService = new TimelineService();
