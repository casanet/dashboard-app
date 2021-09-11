
import { SyncEvent } from 'ts-events';
import { LIVELINESS_ACK_INTERVAL } from '../infrastructure/consts';
import { RemoteConnectionStatus } from '../infrastructure/generated/api';
import { ApiFacade } from '../infrastructure/generated/proxies/api-proxies';
import { sessionManager } from '../infrastructure/session-manager';
import { sleep } from '../infrastructure/utils';

interface LivelinessInfo {
	online: boolean;
	remoteConnection: RemoteConnectionStatus;
}

let onlineFlag: boolean = true;
let remoteConnectionStatusFlag: RemoteConnectionStatus = RemoteConnectionStatus.NotConfigured;

export const livelinessFeed = new SyncEvent<LivelinessInfo>();

async function livelinessAck() {

	// Run forever
	while (true) {
		// Sleep the interval
		await sleep(LIVELINESS_ACK_INTERVAL);

		// Dont send ack while logged off
		if (!sessionManager.isLoggedOn) {
			continue;
		}

		try {
			// Try send ack
			const remoteConnectionStatus = await ApiFacade.RemoteApi.getConnectionStatus();
			
			// If online mode changed, publish update
			if (!onlineFlag) {
				onlineFlag = true;
				livelinessFeed.post({
					online: true,
					remoteConnection: remoteConnectionStatusFlag,
				});
			}

			// If remote connection has been updated, publish update
			if (remoteConnectionStatus !== remoteConnectionStatusFlag) {
				remoteConnectionStatusFlag = remoteConnectionStatus;
				livelinessFeed.post({
					online: onlineFlag,
					remoteConnection: remoteConnectionStatus,
				});
			}


		} catch (error) {
			// If online mode changed, publish update
			if (onlineFlag) {
				onlineFlag = false;
				livelinessFeed.post({
					online: false,
					remoteConnection: remoteConnectionStatusFlag,
				});
			}
		}

	}
}

// Active ack
livelinessAck();
