import { Grid, IconButton, makeStyles, PaletteType } from "@material-ui/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { versionLatestService } from "../../services/settings.service";
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import CloudOffIcon from '@material-ui/icons/CloudOff';
import { ThemeToggle } from "../global/ThemeToggle";
import { ThemeTooltip } from "../global/ThemeTooltip";
import { remoteConnectionDisplayKey } from "../../logic/common/settingsUtils";
import Badge from '@mui/material/Badge';
import { marginRight } from "../../logic/common/themeUtils";
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';
import { useHistory } from "react-router-dom";
import { DashboardRoutes } from "../../infrastructure/consts";
import { getLocalStorageItem, LocalStorageKey } from "../../infrastructure/local-storage";
import { profileService } from "../../services/users.service";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useData } from "../../hooks/useData";
import { useLiveliness } from "../../hooks/useLiveliness";
import { RemoteConnectionStatus, User } from "../../infrastructure/generated/api/swagger/api";

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

	const { online, remoteConnection } = useLiveliness();
	const [newVersion] = useData(versionLatestService, undefined, { skipErrorToastOnFailure: true });

	const [passwordChangeRequired, setPasswordChangeRequired] = useState<boolean>();
	useEffect(() => {
		let setPasswordRequiredDetacher: () => void;
		(async () => {

			try {
				const cachedProfile = getLocalStorageItem<User>(LocalStorageKey.Profile, { itemType: 'object' });
				// To skip unnecessary requests, Only if the password mark as "required change" in the local storage
				// Go to check if this flag still ON, and if so, show warning about it 
				if (cachedProfile?.passwordChangeRequired) {
					setPasswordChangeRequired(true);
					setPasswordRequiredDetacher = await profileService.attachDataSubs((profile) => {
						setPasswordChangeRequired(profile.passwordChangeRequired);
					});
				}
			} catch (error) {
				// Do nothing
			}

		})();

		return () => {
			// unsubscribe the feed on component unmount
			setPasswordRequiredDetacher && setPasswordRequiredDetacher();
		};
	}, []);

	return <div>
		<Grid
			container
			direction="row"
			justifyContent="flex-end"
			alignItems="center"
		>
			{passwordChangeRequired && <div>
				<ThemeTooltip title={<span>{t(`dashboard.toolbar.change.password.alert`)}</span>}>
					<IconButton
						onClick={() => history.push(DashboardRoutes.profile.path)}
						color="inherit">
						<Badge color="error" overlap={'circular'} variant="dot" classes={{ badge: classes.badge }}>
							<AccountCircleIcon fontSize="small" />
						</Badge>
					</IconButton>
				</ThemeTooltip>
			</div>}
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
						{remoteConnection === RemoteConnectionStatus.ConnectionOk ? <CloudDoneIcon fontSize="small" /> : <CloudOffIcon fontSize="small" />}
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