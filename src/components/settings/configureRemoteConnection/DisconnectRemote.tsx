import { CircularProgress, IconButton } from "@material-ui/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DEFAULT_FONT_RATION } from "../../../infrastructure/consts";
import { RemoteConnectionStatus } from "../../../infrastructure/generated/api";
import { ApiFacade } from "../../../infrastructure/generated/proxies/api-proxies";
import { handleServerRestError } from "../../../services/notifications.service";
import { livelinessCheck, livelinessFeed, livelinessFlag, remoteURLService } from "../../../services/settings.service";
import { AlertDialog } from "../../AlertDialog";
import { ThemeTooltip } from "../../global/ThemeTooltip";
import { TitleButtonContent } from "../../global/TitleButtonContent";
import DeleteIcon from '@mui/icons-material/Delete';

export function DisconnectRemote() {
	const { t } = useTranslation();
	const [remoteConnection, setRemoteConnection] = useState<RemoteConnectionStatus>(livelinessFlag.remoteConnection);

	const [disconnecting, setDisconnecting] = useState<boolean>();
	const [openDisconnectAlert, setOpenDisconnectAlert] = useState<boolean>(false);

	useEffect(() => {
		let livelinessDetacher: () => void;

		(async () => {
			// Subscribe to the liveliness feed
			livelinessDetacher = livelinessFeed.attach((livelinessData) => {
				setRemoteConnection(livelinessData.remoteConnection);
			});

		})();

		return () => {
			// unsubscribe the feed on component unmount
			livelinessDetacher && livelinessDetacher();
		};
	}, []);


	async function disconnectRemoteServer() {
		setDisconnecting(true);
		try {
			await ApiFacade.RemoteApi.removeRemoteSettings();
			// Once disconnected succeed, make it as not configured and empty remote URL, and force refresh the remote status 
			setRemoteConnection(RemoteConnectionStatus.NotConfigured);
			remoteURLService.postNewData('');
			await livelinessCheck();
		} catch (error) {
			await handleServerRestError(error);
		}
		setDisconnecting(false);
	}

	return <div style={{ width: '100%' }} >
		<AlertDialog
			open={openDisconnectAlert}
			cancelText={t('global.cancel')}
			submitText={t('dashboard.settings.connectivity.disconnect.remote.button')}
			title={t('dashboard.settings.connectivity.disconnect.remote.alert.title')}
			text={t('dashboard.settings.connectivity.disconnect.remote.alert.text')}
			onCancel={() => setOpenDisconnectAlert(false)}
			onSubmit={() => { setOpenDisconnectAlert(false); disconnectRemoteServer(); }}
			submitColor={'error'}
		/>
		<TitleButtonContent
			title={t('dashboard.settings.connectivity.disconnect.remote')}
			tip={t('dashboard.settings.connectivity.disconnect.remote.tip')}
			button={<ThemeTooltip title={<span>{t(`dashboard.settings.connectivity.disconnect.remote.button`)}</span>}>
				<IconButton
					// Allow ony if server configured, and use have permission for that
					disabled={remoteConnection === RemoteConnectionStatus.NotConfigured || disconnecting}
					onClick={() => setOpenDisconnectAlert(true)}
					color="inherit"
				>
					{!disconnecting && <DeleteIcon style={{ fontSize: DEFAULT_FONT_RATION }} />}
					{disconnecting && <CircularProgress size={DEFAULT_FONT_RATION * 0.8} thickness={10} />}
				</IconButton>
			</ThemeTooltip>}
		/>
		</div>;
}
