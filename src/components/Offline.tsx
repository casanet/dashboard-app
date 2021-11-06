import { Grid, Theme, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { getModeColor } from "../logic/common/themeUtils";
import CloudOffIcon from '@mui/icons-material/CloudOff';
import LinearProgress from '@mui/material/LinearProgress';
import { useLiveliness } from "../hooks/useLiveliness";
import { useTranslation } from "react-i18next";

interface OfflineProps {
	fontRatio?: number;
}

/**
 * Generic 'OFFLINE' component to show 'OFFLINE' view while there is no connection to the server/local server
 */
export default function Offline(props: OfflineProps) {
	const { t } = useTranslation();
	const theme = useTheme();
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
	const liveliness = useLiveliness();

	const fontRatio = props.fontRatio || (desktopMode ? 50 : 35);

	return <Grid
		style={{ width: '100%', height: '100%', textAlign: 'center' }}
		container
		direction="column"
		justifyContent="center"
		alignItems="center"
	>
		<div>
			<CloudOffIcon style={{ fontSize: fontRatio * 5, color: getModeColor(false, theme) }} />
		</div>
		<div style={{ width: fontRatio * 5 }}  >
			<LinearProgress color="inherit" />
		</div>
		<Typography style={{ fontSize: fontRatio * 0.5, marginTop: fontRatio * 0, color: getModeColor(false, theme) }} >
			{t(`dashboard.offline.${!liveliness.online ? 'server' : 'local.server'}.message`)}
		</Typography>
	</Grid>
}
