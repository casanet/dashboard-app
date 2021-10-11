import { LocalNetworkDevice } from "../infrastructure/generated/api";
import { ApiFacade } from "../infrastructure/generated/proxies/api-proxies";
import { DataService } from "../infrastructure/data-service-base";

class DevicesService extends DataService<LocalNetworkDevice[]> {

	fetchData(): Promise<LocalNetworkDevice[]> {
		// Get the fetch data function (without activating it yet)
		return ApiFacade.DevicesApi.getDevices();
	}
}

export const devicesService = new DevicesService();
