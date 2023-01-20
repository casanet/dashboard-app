import { DataService } from 'frontal-data-manager';
import { ApiFacade, DeviceKind } from "../infrastructure/generated/api/swagger/api";

class MinionsKindsService extends DataService<DeviceKind[]> {

	fetchData(): Promise<DeviceKind[]> {
		// Get the fetch data function (without activating it yet)
		return ApiFacade.DevicesApi.getDevicesKinds();
	}
}

export const minionsKindsService = new MinionsKindsService();
