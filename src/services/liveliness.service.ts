
import { SyncEvent } from 'ts-events';
import { LIVELINESS_ACK_INTERVAL } from '../infrastructure/consts';
import { sessionManager } from '../infrastructure/session-manager';
import { sleep } from '../infrastructure/utils';
import { ApiFacade, RemoteConnectionStatus } from "../infrastructure/generated/api/swagger/api";

export interface LivelinessInfo {
	/** Whenever the communication with server is OK */
	online: boolean;
	/** The remote server connection status */
	remoteConnection: RemoteConnectionStatus;
}

/**
 * The current known liveliness status
 */
export const livelinessFlag: LivelinessInfo = {
	online: true,
	remoteConnection: RemoteConnectionStatus.NotConfigured
}

export const livelinessFeed = new SyncEvent<LivelinessInfo>();

export async function livelinessCheck() {
	// Dont send livelinessCheck request, while logoff.
	if (!sessionManager.isLoggedOn) {
		return;
	}
	try {
		// Try send ack
		const remoteConnectionStatus = await ApiFacade.RemoteApi.getConnectionStatus();

		// If online was false change it back to true and publish update
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

/** Liveliness status ack */
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
