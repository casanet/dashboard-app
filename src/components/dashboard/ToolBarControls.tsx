import { Grid, IconButton, makeStyles, PaletteType } from "@material-ui/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { livelinessFeed, livelinessFlag, versionLatestService } from "../../services/settings.service";
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import CloudOffIcon from '@material-ui/icons/CloudOff';
import { RemoteConnectionStatus } from "../../infrastructure/generated/api";
import { ThemeToggle } from "../ThemeToggle";
import { ThemeTooltip } from "../global/ThemeTooltip";
import { remoteConnectionDisplayKey } from "../../logic/common/settingsUtils";
import Badge from '@mui/material/Badge';
import { marginRight } from "../../logic/common/themeUtils";
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';
import { useHistory } from "react-router-dom";
import { DashboardRoutes } from "../../infrastructure/consts";

const useStyles = makeStyles((theme) => ({
	badge: {
		[marginRight(theme)]: 2,
		marginTop: 0,
		border: `1.5px solid ${theme.palette.background.default}`,
	},
}));

interface ToolBarControlsProps {
	theme: PaletteType;
	setDarkMode: (paletteType: PaletteType) => void;
}

export function ToolBarControls(props: ToolBarControlsProps) {
	const { t } = useTranslation();
	const classes = useStyles();
	const history = useHistory();

	const [online, setOnline] = useState<boolean>(livelinessFlag.online);
	const [remoteConnection, setRemoteConnection] = useState<RemoteConnectionStatus>(livelinessFlag.remoteConnection);
	const [newVersion, setNewVersion] = useState<string>();

	useEffect(() => {
		let livelinessDetacher: () => void;
		let versionLatestDetacher: () => void;

		(async () => {

			try {
				// Subscribe to the liveliness feed
				livelinessDetacher = livelinessFeed.attach((livelinessData) => {
					setOnline(livelinessData.online);
					setRemoteConnection(livelinessData.remoteConnection);
				});

				versionLatestDetacher = await versionLatestService.attachDataSubs((latestVersion) => {
					setNewVersion(latestVersion);
				});
			} catch (error) {
				// Do nothing
			}

		})();

		return () => {
			// unsubscribe the feed on component unmount
			livelinessDetacher && livelinessDetacher();
			versionLatestDetacher && versionLatestDetacher();
		};
	}, []);

	return <div>
		<Grid
			container
			direction="row"
			justifyContent="flex-end"
			alignItems="center"
		>
			{newVersion && <div>
				<ThemeTooltip title={<span>{t(`dashboard.toolbar.new.version.available`, { newVersion })}</span>}>
					<IconButton
						onClick={() => history.push(DashboardRoutes.settings.path)}
						color="inherit">
						<Badge color="error" overlap={'circular'} variant="dot" classes={{ badge: classes.badge }}>
							<SystemUpdateIcon fontSize="small" />
						</Badge>
					</IconButton>
				</ThemeTooltip>
			</div>}
			<div>
				{/* Do not show cloud indicator in case of remote not configured at all */}
				{remoteConnection !== RemoteConnectionStatus.NotConfigured && <ThemeTooltip title={<span>{t(remoteConnectionDisplayKey[remoteConnection])}</span>}>
					<IconButton
						onClick={() => history.push(DashboardRoutes.settings.path)}
						color="inherit">
						{remoteConnection === RemoteConnectionStatus.ConnectionOK ? <CloudDoneIcon fontSize="small" /> : <CloudOffIcon fontSize="small" />}
					</IconButton>
				</ThemeTooltip>}
			</div>
			<div>
				<ThemeTooltip title={<span>{t(`dashboard.toolbar.connection.${online ? 'on' : 'off'}`)}</span>}>
					<IconButton
						color="inherit">
						{online ? <CheckCircleIcon fontSize="small" /> : <ErrorIcon fontSize="small" />}
					</IconButton>
				</ThemeTooltip>
			</div>
			<div>
				<ThemeToggle theme={props.theme} setDarkMode={props.setDarkMode} />
			</div>
		</Grid>
	</div>
}