import { Box, CircularProgress, Grid, Theme, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import LinearProgress from "@mui/material/LinearProgress";
import { useTranslation } from "react-i18next";
import { DEFAULT_FONT_RATION } from "../infrastructure/consts";
import { getModeColor } from "../logic/common/themeUtils";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

interface LoaderProps {
	fullScreen?: boolean;
	fontRatio?: number;
	fancy?: {
		icon?: any;
		text?: string;
	}
}

export function Loader(props: LoaderProps) {
	const { t } = useTranslation();
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
	const theme = useTheme();

	const Icon = props.fancy?.icon || CloudDownloadIcon;
	const fontRatio = props.fontRatio || (desktopMode ? 50 : 35);

	if (!props.fancy) {
		return <Grid
			style={{ width: props.fullScreen ? '100vw' : '100%', height: props.fullScreen ? '100vh' : '100%', textAlign: 'center' }}
			container
			direction="column"
			justifyContent="center"
			alignItems="center"
		>
			<Box sx={{ width: '100%' }}>
				<CircularProgress size={props.fontRatio || (DEFAULT_FONT_RATION * 7.5)} />
			</Box>
		</Grid>;
	}


	return <Grid
		style={{ width: props.fullScreen ? '100vw' : '100%', height: props.fullScreen ? '100vh' : '100%', textAlign: 'center' }}
		container
		direction="column"
		justifyContent="center"
		alignItems="center"
	>
		<div>
			<Icon style={{ fontSize: fontRatio * 5, color: getModeColor(false, theme) }} />
		</div>
		<Typography style={{ fontSize: fontRatio * 0.5, marginTop: -fontRatio * 0.5, marginBottom: fontRatio * 0.2,color: getModeColor(false, theme) }} >
			{props.fancy?.text || t(`global.loading.fancy`)}
		</Typography>
		<div style={{ width: fontRatio * 5.5 }}  >
			<LinearProgress color="inherit" />
		</div>
	</Grid>;
}