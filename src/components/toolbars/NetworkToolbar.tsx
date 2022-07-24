import { Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import RefreshIcon from '@mui/icons-material/Refresh';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import { PageToolbarButton, ToolbarDivider } from "../dashboard/PageToolbar";
import { handleServerRestError } from "../../services/notifications.service";
import { useState } from "react";
import { devicesService } from "../../services/devices.service";
import { ApiFacade } from "../../infrastructure/generated/api/swagger/api";

export function NetworkToolbar() {
	const { t } = useTranslation();

	const [refreshing, setRefreshing] = useState<boolean>(false);
	const [rescanning, setRescanning] = useState<boolean>(false);

	async function refresh(): Promise<boolean> {
		setRefreshing(true);
		let succeed = false;
		try {
			await devicesService.forceFetchData();
			succeed = true;
		} catch (error) {
			handleServerRestError(error);
		}
		setRefreshing(false);
		return succeed;
	}

	/** Scan local network */
	async function rescan(): Promise<boolean> {
		let succeed = false;
		setRescanning(true);
		try {
			await ApiFacade.DevicesApi.rescanDevices();
			// Once scan finished, fetch the new changes and update the service subscribers
			await devicesService.forceFetchData();
			succeed = true;
		} catch (error) {
			handleServerRestError(error);
		}
		setRescanning(false);
		return succeed;
	}

	return <Grid
		style={{ padding: 10 }}
		container
		direction="row"
		justifyContent="center"
		alignItems="center"
	>
		<PageToolbarButton
			loading={refreshing}
			disabled={refreshing}
			runAction={refresh}
			text={t('global.refresh')}
			Icon={RefreshIcon}
			tip={t('dashboard.toolbar.pages.network.refresh.tip')}
		/>
		<ToolbarDivider />
		<PageToolbarButton
			loading={rescanning}
			disabled={rescanning}
			runAction={rescan}
			text={t('dashboard.toolbar.pages.network.re.scan')}
			Icon={TrackChangesIcon}
			tip={t('dashboard.toolbar.pages.network.re.scan.tip')}
		/>
	</Grid>;
}
