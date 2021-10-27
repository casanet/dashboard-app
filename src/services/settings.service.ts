
import { DataService } from '../infrastructure/data-service-base';
import { VersionInfo } from '../infrastructure/generated/api';
import { ApiFacade } from '../infrastructure/generated/proxies/api-proxies';
class RemoteURLService extends DataService<string> {
	fetchData(): Promise<string> {
		return ApiFacade.RemoteApi.getRemoteHost();
	}
}
export const remoteURLService = new RemoteURLService();


class VersionDataService extends DataService<VersionInfo> {
	fetchData(): Promise<VersionInfo> {
		return ApiFacade.VersionApi.getCurrentVersion();
	}
}
export const versionDataService = new VersionDataService();

class VersionLatestService extends DataService<string> {
	fetchData(): Promise<string> {
		return ApiFacade.VersionApi.isLatestVersion();
	}
}
export const versionLatestService = new VersionLatestService();
