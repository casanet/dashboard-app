import { ApiFacade, DeviceKind } from "../infrastructure/generated/api/swagger/api";
import { DashboardService } from './base.service';

class MinionsKindsService extends DashboardService<DeviceKind[]> {

	constructor() {
		super([], {
			useDashboardCache: true,
		});
	}

	fetchData(): Promise<DeviceKind[]> {
		// Get the fetch data function (without activating it yet)
		return ApiFacade.DevicesApi.getDevicesKinds();
	}
}

export const minionsKindsService = new MinionsKindsService();
