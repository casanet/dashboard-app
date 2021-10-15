import { Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import FindReplaceIcon from '@mui/icons-material/FindReplace';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import { PageToolbarButton, ToolbarDivider } from "../dashboard/PageToolbar";
import { minionsService } from "../../services/minions.service";
import { handleServerRestError, postApiError } from "../../services/notifications.service";
import { useState } from "react";
import { ApiFacade } from "../../infrastructure/generated/proxies/api-proxies";
import { sleep } from "../../infrastructure/utils";
import { Duration } from "unitsnet-js";
import { ErrorResponse, ProgressStatus } from "../../infrastructure/generated/api";
import { useHistory } from "react-router-dom";
import { CREATE_MINION_PATH } from "../../infrastructure/consts";

export function MinionsToolbar() {
	const { t } = useTranslation();
	const history = useHistory();

	const [refreshing, setRefreshing] = useState<boolean>(false);
	const [rereading, setRereading] = useState<boolean>(false);
	const [rescanning, setRescanning] = useState<boolean>(false);

	async function createMinion(): Promise<boolean> {
		// Route to the create minion path
		history.push(CREATE_MINION_PATH);
		// Return false in order to not show the succeed icon, since it's pointless, only move route, yes? 
		return false;
	}

	async function refresh(): Promise<boolean> {
		setRefreshing(true);
		let succeed = false;
		try {
			await minionsService.forceFetchData();
			succeed = true;
		} catch (error) {
			handleServerRestError(error);
		}
		setRefreshing(false);
		return succeed;
	}

	/**
	 * Rescan minions status
	 * @param scanNetworkFirst Set true to scan the network devices first 
	 * @returns True if succeed
	 */
	async function rescanMinions(scanNetworkFirst: boolean): Promise<boolean> {
		let succeed = false;
		try {
			// Trigger the scan
			await ApiFacade.MinionsApi.rescanMinionsStatus(scanNetworkFirst);

			// Start the ack's to detect the scan results
			let updateStatus: ProgressStatus = ProgressStatus.InProgress;
			// Run till the status is not InProgress
			while (updateStatus === ProgressStatus.InProgress) {
				// Ask for the scan status
				const currentStatus = await ApiFacade.MinionsApi.getSescaningMinionsStatus();
				updateStatus = currentStatus.scanningStatus;
				// Await a while till next try
				await sleep(Duration.FromSeconds(5));
			}

			if (updateStatus === ProgressStatus.Fail) {
				// eslint-disable-next-line no-throw-literal
				postApiError({ responseCode: 1501 } as ErrorResponse);
			} else {
				// Once it's done force fetch minions again
				await minionsService.forceFetchData();
				succeed = true;
			}

		} catch (error) {
			handleServerRestError(error);
		}
		return succeed;
	}

	/** Read minions statuses without rescaning network first */
	async function reread(): Promise<boolean> {
		setRereading(true);
		const succeed = await rescanMinions(false);
		setRereading(false);
		return succeed;
	}

	/** Read minions statuses with rescaning network first */
	async function rescan(): Promise<boolean> {
		setRescanning(true);
		const succeed = await rescanMinions(true);
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
			loading={false}
			disabled={false}
			runAction={createMinion}
			text={t('dashboard.toolbar.pages.minions.create.minion')}
			Icon={AddIcon}
			tip={t('dashboard.toolbar.pages.minions.create.minion.tip')}
		/>
		<ToolbarDivider />
		<PageToolbarButton
			loading={refreshing}
			disabled={refreshing}
			runAction={refresh}
			text={t('global.refresh')}
			Icon={RefreshIcon}
			tip={t('dashboard.toolbar.pages.minions.refresh.tip')}
		/>
		<ToolbarDivider />
		<PageToolbarButton
			loading={rereading}
			disabled={rereading || rescanning}
			runAction={reread}
			text={t('dashboard.toolbar.pages.minions.re.read')}
			Icon={FindReplaceIcon}
			tip={t('dashboard.toolbar.pages.minions.re.read.tip')}
		/>
		<ToolbarDivider />
		<PageToolbarButton
			loading={rescanning}
			disabled={rereading || rescanning}
			runAction={rescan}
			text={t('dashboard.toolbar.pages.minions.re.scan')}
			Icon={TrackChangesIcon}
			tip={t('dashboard.toolbar.pages.minions.re.scan.tip')}
		/>
	</Grid>;
}
