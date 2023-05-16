import { ApiFacade, MinionTimeout } from "../infrastructure/generated/api/swagger/api";
import { DashboardService } from "./base.service";

class TimeOutService extends DashboardService<MinionTimeout[]> {

	constructor() {
		super([], {
			useDashboardCache: true,
		});
	}

	fetchData(): Promise<MinionTimeout[]> {
		return ApiFacade.MinionsApi.getMinionsTimeout();
	}
}

export const timeOutService = new TimeOutService();
