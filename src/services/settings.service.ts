
import { SyncEvent } from 'ts-events';
import { LIVELINESS_ACK_INTERVAL } from '../infrastructure/consts';
import { DataService } from '../infrastructure/data-service-base';
import { RemoteConnectionStatus, VersionInfo } from '../infrastructure/generated/api';
import { ApiFacade } from '../infrastructure/generated/proxies/api-proxies';
import { sessionManager } from '../infrastructure/session-manager';
import { sleep } from '../infrastructure/utils';

interface LivelinessInfo {
	online: boolean;
	remoteConnection: RemoteConnectionStatus;
}

export const livelinessFlag: LivelinessInfo = {
	online: true,
	remoteConnection: RemoteConnectionStatus.NotConfigured
}

export const livelinessFeed = new SyncEvent<LivelinessInfo>();

export async function livelinessCheck() {
	try {
		// Try send ack
		const remoteConnectionStatus = await ApiFacade.RemoteApi.getConnectionStatus();

		// If online mode changed, publish update
		if (!livelinessFlag.online) {
			livelinessFlag.online = true;
			livelinessFeed.post({
				online: true,
				remoteConnection: livelinessFlag.remoteConnection,
			});
		}

		// If remote connection has been updated, publish update
		if (remoteConnectionStatus !== livelinessFlag.remoteConnection) {
			livelinessFlag.remoteConnection = remoteConnectionStatus;
			livelinessFeed.post({
				online: livelinessFlag.online,
				remoteConnection: remoteConnectionStatus,
			});
		}


	} catch (error) {
		// If online mode changed, publish update
		if (livelinessFlag.online) {
			livelinessFlag.online = false;
			livelinessFeed.post({
				online: false,
				remoteConnection: livelinessFlag.remoteConnection,
			});
		}
	}
}

async function livelinessAck() {

	// Run forever
	while (true) {
		// Dont send ack while logged off
		if (sessionManager.isLoggedOn) {
			await livelinessCheck();
		}

		// Sleep the interval
		await sleep(LIVELINESS_ACK_INTERVAL);
	}
}

// Active ack
livelinessAck();


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
