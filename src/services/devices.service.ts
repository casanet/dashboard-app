import { DataService } from "../hooks/data-service-base";
import { ApiFacade, LocalNetworkDevice } from "../infrastructure/generated/api/swagger/api";

class DevicesService extends DataService<LocalNetworkDevice[]> {

	constructor() {
		super([]);
	}

	fetchData(): Promise<LocalNetworkDevice[]> {
		// Get the fetch data function (without activating it yet)
		return ApiFacade.DevicesApi.getDevices();
	}
}

export const devicesService = new DevicesService();
