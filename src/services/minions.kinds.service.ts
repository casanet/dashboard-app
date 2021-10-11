import { DeviceKind } from "../infrastructure/generated/api";
import { ApiFacade } from "../infrastructure/generated/proxies/api-proxies";
import { DataService } from "../infrastructure/data-service-base";

class MinionsKindsService extends DataService<DeviceKind[]> {

	fetchData(): Promise<DeviceKind[]> {
		// Get the fetch data function (without activating it yet)
		return ApiFacade.DevicesApi.getDevicesKinds();
	}
}

export const minionsKindsService = new MinionsKindsService();
