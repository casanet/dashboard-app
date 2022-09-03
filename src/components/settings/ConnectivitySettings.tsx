import { Grid, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { SettingItem } from "../../pages/dashboard-pages/Settings";
import { remoteURLService } from "../../services/settings.service";
import { remoteConnectionDisplayKey } from "../../logic/common/settingsUtils";
import Collapse from '@mui/material/Collapse';
import { sessionManager } from "../../infrastructure/session-manager";
import { EditRemoteConnection } from "./configureRemoteConnection/EditRemoteConnection";
import { DisconnectRemote } from "./configureRemoteConnection/DisconnectRemote";
import { ShowLocalMac } from "./configureRemoteConnection/ShowLocalMac";
import { ShowRegisteredUsers } from "./configureRemoteConnection/ShowRegisteredUsers";
import { useData } from "../../hooks/useData";
import { useLiveliness } from "../../hooks/useLiveliness";
import { envFacade } from "../../infrastructure/env-facade";

export function ConnectivitySettings() {
	const { t } = useTranslation();
	const [remoteURL] = useData(remoteURLService, { skipErrorToastOnFailure: true });
	const { remoteConnection } = useLiveliness();

	return <Grid
		container
		direction="column"
		justifyContent="space-between"
		alignItems="stretch"
	>
		<Collapse in={!!envFacade.apiNoneLocalServerBaseUrl}>
			<SettingItem title={t('dashboard.settings.connectivity.casanet.server.url')} >
				<Typography>
					{envFacade.apiNoneLocalServerBaseUrl}
				</Typography>
			</SettingItem>
		</Collapse>
		{envFacade.localIP && <SettingItem title={t('dashboard.settings.connectivity.casanet.local.server.ip')} >
				<Typography>
					{envFacade.localIP}
				</Typography>
			</SettingItem>}
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
