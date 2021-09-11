import { Grid, IconButton, PaletteType, Tooltip } from "@material-ui/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { livelinessFeed } from "../../services/settings.service";
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import CloudOffIcon from '@material-ui/icons/CloudOff';
import DarkIcon from '@material-ui/icons/Brightness4';
import LightIcon from '@material-ui/icons/BrightnessHigh';
import { RemoteConnectionStatus } from "../../infrastructure/generated/api";

interface ToolBarControlsProps {
	theme: PaletteType;
	setDarkMode: (paletteType: PaletteType) => void;
}

const remoteConnectionDisplayKey: { [key in RemoteConnectionStatus]: string } = {
	[RemoteConnectionStatus.ConnectionOK]: 'dashboard.toolbar.remote.connection.ok',
	[RemoteConnectionStatus.LocalServerDisconnected]: 'dashboard.toolbar.remote.connection.local.server.disconnected',
	[RemoteConnectionStatus.NotConfigured]: 'dashboard.toolbar.remote.connection.not.configured',
	[RemoteConnectionStatus.CantReachRemoteServer]: 'dashboard.toolbar.remote.connection.cant.access.remote.server',
	[RemoteConnectionStatus.AuthorizationFail]: 'dashboard.toolbar.remote.connection.auth.failed',
}

export function ToolBarControls(props: ToolBarControlsProps) {
	const { t } = useTranslation();

	const [online, setOnline] = useState<boolean>(true);
	const [remoteConnection, setRemoteConnection] = useState<RemoteConnectionStatus>(RemoteConnectionStatus.NotConfigured);

	useEffect(() => {
		let livelinessDetacher: () => void;

		(async () => {
			// Subscribe to the liveliness feed
			livelinessDetacher = livelinessFeed.attach((livelinessData) => {
				setOnline(livelinessData.online);
				setRemoteConnection(livelinessData.remoteConnection);
			});
		})();

		return () => {
			// unsubscribe the feed on component unmount
			livelinessDetacher && livelinessDetacher();
		};
	}, []);

	return <div>
		<Grid
			container
			direction="row"
			justifyContent="flex-end"
			alignItems="center"
		>
			<div>
				<Tooltip title={<span>{t(remoteConnectionDisplayKey[remoteConnection])}</span>} enterDelay={100}>
					<IconButton
						color="inherit">
						{remoteConnection === RemoteConnectionStatus.ConnectionOK ? <CloudDoneIcon fontSize="small" /> : <CloudOffIcon fontSize="small" />}
					</IconButton>
				</Tooltip>
			</div>
			<div>
				<Tooltip title={<span>{t(`dashboard.toolbar.connection.${online ? 'on' : 'off'}`)}</span>} enterDelay={100}>
					<IconButton
						color="inherit">
						{online ? <CheckCircleIcon fontSize="small" /> : <ErrorIcon fontSize="small" />}
					</IconButton>
				</Tooltip>
			</div>
			<div>
				<Tooltip title={<span>{t('dashboard.toolbar.theme.toggle')}</span>} enterDelay={100}>
					<IconButton
						onClick={() => props.setDarkMode(props.theme === 'dark' ? 'light' : 'dark')}
						color="inherit">
						{props.theme === 'dark' ? <LightIcon fontSize="small" /> : <DarkIcon fontSize="small" />}
					</IconButton>
				</Tooltip>
			</div>
		</Grid>
	</div>
}