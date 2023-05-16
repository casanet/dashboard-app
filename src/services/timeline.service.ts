import { ApiFacade, MinionTimeline } from "../infrastructure/generated/api/swagger/api";
import { DashboardService } from "./base.service";

class TimelineService extends DashboardService<MinionTimeline[]> {

	constructor() {
		super([], {
			useDashboardCache: true,
		});
	}

	fetchData(): Promise<MinionTimeline[]> {
		// Get the fetch data function (without activating it yet)
		return ApiFacade.MinionsApi.getMinionsTimeline();
	}
}

export const timelineService = new TimelineService();
