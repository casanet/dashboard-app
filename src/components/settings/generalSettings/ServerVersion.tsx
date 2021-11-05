import { Grid, IconButton, makeStyles, Typography, useTheme } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { SettingItem } from "../../../pages/dashboard-pages/Settings";
import { DASHBOARD_REPO_URL, DEFAULT_FONT_RATION, SERVER_REPO_URL } from "../../../infrastructure/consts";
import { ThemeTooltip } from "../../global/ThemeTooltip";
import { sessionManager } from "../../../infrastructure/session-manager";
import { ApiFacade } from "../../../infrastructure/generated/proxies/api-proxies";
import { handleServerRestError, notificationsFeed, postApiError } from "../../../services/notifications.service";
import { sleep } from "../../../infrastructure/utils";
import { useEffect, useState } from "react";
import { versionDataService, versionLatestService } from "../../../services/settings.service";
import { ErrorResponse, ProgressStatus } from "../../../infrastructure/generated/api";
import SecurityUpdateGoodIcon from '@mui/icons-material/SecurityUpdateGood';
import SecurityUpdateIcon from '@mui/icons-material/SecurityUpdate';
import { Duration } from "unitsnet-js";
import Badge from '@mui/material/Badge';
import { marginRight } from "../../../logic/common/themeUtils";
import LaunchIcon from '@mui/icons-material/Launch';
import StayCurrentPortraitIcon from '@mui/icons-material/StayCurrentPortrait';
import CircularProgress from "@mui/material/CircularProgress";
import { AlertDialog } from "../../AlertDialog";
import { useData } from "../../../hooks/useData";
import { livelinessCheck } from "../../../services/liveliness.service";
import { envFacade } from "../../../infrastructure/env-facade";

const useStyles = makeStyles((theme) => ({
	iconBadge: {
		[marginRight(theme)]: 9,
		marginTop: -4,
		border: `3px solid ${theme.palette.background.paper}`,
		padding: '0 4px',
	},
	textBadge: {
		[marginRight(theme)]: 0,
		marginTop: 6,
		border: `1px solid ${theme.palette.background.paper}`,
		padding: '0 2px',
	}
}));

interface VersionSourceLinkProps {
	/** The link URL */
	link: string;
	/** A tooltip text */
	tip?: string;
}

/** Version source link icon */
function VersionSourceLink(props: VersionSourceLinkProps) {
	const theme = useTheme();

	return <ThemeTooltip hideTip={!props.tip} title={<span>{props.tip}</span>}>
		<IconButton
			onClick={() => { window.open(props.link, '_blank') }}
			color="inherit"
			style={{ padding: DEFAULT_FONT_RATION * 0.15, marginTop: -DEFAULT_FONT_RATION * 0.5, [marginRight(theme)]: -DEFAULT_FONT_RATION * 0.15 }}
		>
			<LaunchIcon style={{ fontSize: DEFAULT_FONT_RATION * 0.8 }} />
		</IconButton>
	</ThemeTooltip>;
}

export function ServerVersion() {
	const { t } = useTranslation();
	const classes = useStyles();

	const [versionData] = useData(versionDataService, undefined, { skipErrorToastOnFailure: true });
	const [newVersion] = useData(versionLatestService, undefined, { skipErrorToastOnFailure: true });

	const [updating, setUpdating] = useState<boolean>();
	const [showUpgradingAlert, setShowUpgradingAlert] = useState<boolean>(false);

	useEffect(() => {
		(async () => {
			try {
				// Each component mount, check in currently there is an update in progress
				const updateStatus = await ApiFacade.VersionApi.getUpdateStatus();
				// If there is an update in progress, show the correct "loading" icon and wait for it to finish 
				if (updateStatus.updateStatus === ProgressStatus.InProgress) {
					awaitForServerUpdate();
				}

			} catch (error) {
				// Do nothing
			}
		})();
	}, []);

	function openShowUpgradingView() {
		if (!newVersion) {
			notificationsFeed.post({
				messageKey: 'dashboard.settings.general.update.already.updated',
				duration: Duration.FromSeconds(3),
			});
			return;
		}
		setShowUpgradingAlert(true);
	}

	async function awaitForServerUpdate() {
		setUpdating(true);

		try {
			let updateStatus: ProgressStatus = ProgressStatus.InProgress;
			// Run till the status is not InProgress
			while (updateStatus === ProgressStatus.InProgress) {
				// Ask for the update status
				try {
					const currentStatus = await ApiFacade.VersionApi.getUpdateStatus();
					updateStatus = currentStatus.updateStatus;
					// Await a while till next try
					await sleep(Duration.FromSeconds(5));
				} catch (error) {
					// DO nothing... await till valid response
					// The server can be OOO during the update process, just wat for valid answer
				}
			}

			if (updateStatus === ProgressStatus.Fail) {
				postApiError({ responseCode: 1501 } as ErrorResponse);
			} else {
				// Once it's done force fetch version info and latest version again
				await versionDataService.forceFetchData();
				await versionLatestService.forceFetchData();
				// And force refresh server availability status 
				await livelinessCheck();
				notificationsFeed.post({
					messageKey: 'dashboard.settings.general.update.succeed',
					duration: Duration.FromSeconds(20),
				});
			}

		} catch (error) {
			handleServerRestError(error);
		}
		setUpdating(false);
	}

	async function triggerServerUpdate() {
		setUpdating(true);
		try {
			// Trigger the update to the latest
			await ApiFacade.VersionApi.updateVersion();
			// Then, await till finished
			await awaitForServerUpdate();
		} catch (error) {
			handleServerRestError(error);
		}
		setUpdating(false);
	}

	return <SettingItem title={t('dashboard.settings.general.update.version')} >
		<Grid
			style={{ width: '100%' }}
			container
			direction="row"
			justifyContent="space-between"
			alignItems="center"
		>
			<AlertDialog
				open={showUpgradingAlert}
				cancelText={t('global.cancel')}
				submitText={t('global.update')}
				title={t('dashboard.settings.general.update.server.alert.title', { version: newVersion })}
				text={t('dashboard.settings.general.update.server.alert.text')}
				onCancel={() => setShowUpgradingAlert(false)}
				onSubmit={() => { setShowUpgradingAlert(false); triggerServerUpdate(); }}
				submitColor={'primary'}
			/>
			<div style={{ width: '70%' }}>
				<Grid
					style={{ maxWidth: '100%' }}
					container
					direction="row"
					justifyContent="space-between"
					alignItems="center"
				>
					<div>
						{t('dashboard.settings.general.update.server.version')}
					</div>
					{versionData?.version && <div style={{ display: 'flex' }}>
						<Typography>{versionData?.version}</Typography>
						<VersionSourceLink link={`${SERVER_REPO_URL}/releases/tag/${versionData?.version}`} tip={t('dashboard.settings.general.update.version.link.tip', { version: versionData?.version })} />
					</div>}
				</Grid>
				<Grid
					style={{ maxWidth: '100%' }}
					container
					direction="row"
					justifyContent="space-between"
					alignItems="center"
				>
					<div>
						{t('dashboard.settings.general.update.front.version')}
					</div>
					<div style={{ display: 'flex' }}>
						<Typography>{envFacade.bundleVersion}</Typography>
						<VersionSourceLink link={`${DASHBOARD_REPO_URL}/releases/tag/${envFacade.bundleVersion}`} tip={t('dashboard.settings.general.update.version.link.tip', { version: versionData?.version })} />
					</div>
				</Grid>
				{!newVersion && <Grid
					style={{ width: '100%' }}
					container
					direction="row"
					justifyContent="space-between"
					alignItems="center"
				>
					<div>
						{t('dashboard.settings.general.update.release.date')}
					</div>
					{versionData?.timestamp && <div>
						{new Date(versionData.timestamp).toLocaleDateString()}
					</div>}
				</Grid>}
				{newVersion && <Grid
					style={{ width: '100%' }}
					container
					direction="row"
					justifyContent="space-between"
					alignItems="center"
				>
					<div>
						<Badge color="error" overlap={'rectangular'} variant="dot" classes={{ badge: classes.textBadge }}>
							<Typography>{t('dashboard.settings.general.update.available.version')}</Typography>
						</Badge>
					</div>
					<div style={{ display: 'flex' }}>
						<Typography>{newVersion}</Typography>
						<VersionSourceLink link={`${SERVER_REPO_URL}/releases/tag/${newVersion}`} tip={t('dashboard.settings.general.update.available.version.link.tip', { version: newVersion })} />
					</div>
				</Grid>}
			</div>
			<div style={{ width: '25%' }} >
				<Grid
					style={{ width: '100%' }}
					container
					direction="row"
					justifyContent="center"
					alignItems="center"
				>
					<IconButton
						disabled={updating || !sessionManager.isAdmin}
						onClick={openShowUpgradingView}
						color="inherit"
					>
						{!updating && newVersion &&
							<Badge color="error" overlap={'circular'} badgeContent=" " classes={{ badge: classes.iconBadge }}>
								<SecurityUpdateIcon style={{ fontSize: DEFAULT_FONT_RATION * 3.5 }} />
							</Badge>
						}
						{!updating && !newVersion && < SecurityUpdateGoodIcon style={{ fontSize: DEFAULT_FONT_RATION * 3.5 }} />}
						{updating && <div>
							<StayCurrentPortraitIcon style={{ fontSize: DEFAULT_FONT_RATION * 3.5 }} />
							{/* Show the progress indicator "over" the middle of the empty phone, so create relative div, and below absolute div for the loading */}
							{/* https://stackoverflow.com/questions/2941189/how-to-overlay-one-div-over-another-div */}
							<div style={{ maxHeight: 0, position: 'relative' }}>
								<div style={{ top: -55, left: 27, position: 'absolute' }}> <CircularProgress size={15} color="inherit" thickness={5} /></div>
							</div>
						</div>}
					</IconButton>
				</Grid>
			</div>
		</Grid>
	</SettingItem>;
}
