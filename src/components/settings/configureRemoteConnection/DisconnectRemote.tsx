import { CircularProgress, IconButton } from "@material-ui/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DEFAULT_FONT_RATION } from "../../../infrastructure/consts";
import { RemoteConnectionStatus } from "../../../infrastructure/generated/api";
import { ApiFacade } from "../../../infrastructure/generated/proxies/api-proxies";
import { handleServerRestError } from "../../../services/notifications.service";
import { remoteURLService } from "../../../services/settings.service";
import { AlertDialog } from "../../AlertDialog";
import { ThemeTooltip } from "../../global/ThemeTooltip";
import { TitleButtonContent } from "../../layouts/TitleButtonContent";
import DeleteIcon from '@mui/icons-material/Delete';
import { useLiveliness } from "../../../hooks/useLiveliness";
import { livelinessCheck } from "../../../services/liveliness.service";

export function DisconnectRemote() {
	const { t } = useTranslation();

	const { remoteConnection } = useLiveliness();

	const [disconnecting, setDisconnecting] = useState<boolean>();
	const [openDisconnectAlert, setOpenDisconnectAlert] = useState<boolean>(false);

	async function disconnectRemoteServer() {
		setDisconnecting(true);
		try {
			await ApiFacade.RemoteApi.removeRemoteSettings();
			// Once disconnected succeed, reset remote URL and force refresh to the remote status 
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
