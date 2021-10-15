import { Grid, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { SettingItem } from "../../pages/dashboard-pages/Settings";
import { livelinessFeed, livelinessFlag, remoteURLService } from "../../services/settings.service";
import { useEffect, useState } from "react";
import { RemoteConnectionStatus } from "../../infrastructure/generated/api";
import { remoteConnectionDisplayKey } from "../../logic/common/settingsUtils";
import Collapse from '@mui/material/Collapse';
import { sessionManager } from "../../infrastructure/session-manager";
import { EditRemoteConnection } from "./configureRemoteConnection/EditRemoteConnection";
import { DisconnectRemote } from "./configureRemoteConnection/DisconnectRemote";
import { ShowLocalMac } from "./configureRemoteConnection/ShowLocalMac";
import { ShowRegisteredUsers } from "./configureRemoteConnection/ShowRegisteredUsers";

export function ConnectivitySettings() {
	const { t } = useTranslation();
	const [remoteConnection, setRemoteConnection] = useState<RemoteConnectionStatus>(livelinessFlag.remoteConnection);
	const [remoteURL, setRemoteURL] = useState<string>('');

	useEffect(() => {
		let livelinessDetacher: () => void;
		let remoteURLDetacher: () => void;

		(async () => {
			try {
				// Subscribe to the liveliness feed
				livelinessDetacher = livelinessFeed.attach((livelinessData) => {
					setRemoteConnection(livelinessData.remoteConnection);
				});

				remoteURLDetacher = await remoteURLService.attachDataSubs((remoteURL) => {
					setRemoteURL(remoteURL);
				});
			} catch (error) {

			}
		})();

		return () => {
			// unsubscribe the feed on component unmount
			livelinessDetacher && livelinessDetacher();
			remoteURLDetacher && remoteURLDetacher();
		};
	}, []);

	return <Grid
		container
		direction="column"
		justifyContent="space-between"
		alignItems="stretch"
	>
		<SettingItem title={t('dashboard.settings.connectivity.remote.server.status')} >
			<Typography>
				{t(remoteConnectionDisplayKey[remoteConnection])}
			</Typography>

		</SettingItem>
		<Collapse in={!!remoteURL}>
			<SettingItem title={t('dashboard.settings.connectivity.remote.server.url')} >
				<Typography>
					{remoteURL}
				</Typography>
			</SettingItem>
		</Collapse>
		{sessionManager.isAdmin && <SettingItem title={t('dashboard.settings.connectivity.configure.remote.server')} >
			<Grid
				container
				direction="column"
				justifyContent="space-between"
				alignItems="stretch"
			>
				<EditRemoteConnection />
				<DisconnectRemote />
				<ShowLocalMac />
				<ShowRegisteredUsers />
			</Grid>
		</SettingItem>}
	</Grid >;
}
