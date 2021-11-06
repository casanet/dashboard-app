import { Grid, IconButton } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { SettingItem } from "../../pages/dashboard-pages/Settings";
import { DEFAULT_FONT_RATION } from "../../infrastructure/consts";
import { TitleButtonContent } from "../layouts/TitleButtonContent";
import { ThemeTooltip } from "../global/ThemeTooltip";
import { sessionManager } from "../../infrastructure/session-manager";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { ApiFacade } from "../../infrastructure/generated/proxies/api-proxies";
import { handleServerRestError } from "../../services/notifications.service";
import { downloadBinaryFile } from "../../infrastructure/utils";
import { ServerVersion } from "./generalSettings/ServerVersion";
import { envFacade } from "../../infrastructure/env-facade";

export function GeneralSettings() {
	const { t } = useTranslation();

	async function downloadServerData() {
		try {
			const res = await ApiFacade.DefaultApi.getSettingsBackup();
			const name = `casanet_backup_${new Date().toLocaleDateString()}.zip`;
			const buffer = await res.arrayBuffer();
			downloadBinaryFile(buffer, name);
		} catch (error) {
			await handleServerRestError(error);
		}
	}

	async function downloadServerLogs() {
		try {
			const res = await ApiFacade.DefaultApi.getLastLogs();
			const name = `casanet_${new Date().toLocaleDateString()}.log`;
			const buffer = await res.arrayBuffer();
			downloadBinaryFile(buffer, name);
		} catch (error) {
			await handleServerRestError(error);
		}
	}

	return <Grid
		container
		direction="column"
		justifyContent="space-between"
		alignItems="stretch"
	>
		{/* Download files currently allowed only in the web version */}
		{!envFacade.isMobileApp && <SettingItem title={t('dashboard.settings.general.backup')} >
			<TitleButtonContent
				title={t('dashboard.settings.general.backup.server.data')}
				tip={t('dashboard.settings.general.backup.server.data.tip')}
				button={
					<ThemeTooltip title={<span>{t(`dashboard.settings.general.backup.server.download.data.tip`)}</span>}>
						<IconButton
							disabled={!sessionManager.isAdmin}
							onClick={downloadServerData}
							color="inherit"
						>
							<FileDownloadIcon style={{ fontSize: DEFAULT_FONT_RATION }} />
						</IconButton>
					</ThemeTooltip>
				}
			/>
		</SettingItem>}
		{/* Download files currently allowed only in the web version */}
		{!envFacade.isMobileApp && <SettingItem title={t('dashboard.settings.general.logs')} >
			<TitleButtonContent
				title={t('dashboard.settings.general.logs.download.server.logs')}
				tip={t('dashboard.settings.general.logs.download.server.logs.tip')}
				button={
					<ThemeTooltip title={<span>{t(`dashboard.settings.general.logs.download.server.logs.button.tip`)}</span>}>
						<IconButton
							disabled={!sessionManager.isAdmin}
							onClick={downloadServerLogs}
							color="inherit"
						>
							<FileDownloadIcon style={{ fontSize: DEFAULT_FONT_RATION }} />
						</IconButton>
					</ThemeTooltip>
				}
			/>
		</SettingItem>}
		<ServerVersion />
	</Grid>;
}
