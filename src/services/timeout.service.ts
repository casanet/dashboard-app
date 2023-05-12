import { DataService } from 'frontal-data-manager';
import { ApiFacade, MinionTimeout } from "../infrastructure/generated/api/swagger/api";

class TimeOutService extends DataService<MinionTimeout[]> {

	constructor() {
		super([]);
	}

	fetchData(): Promise<MinionTimeout[]> {
		return ApiFacade.MinionsApi.getMinionsTimeout();
	}
}

export const timeOutService = new TimeOutService();
