import { Grid, Theme, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { getModeColor } from "../logic/common/themeUtils";
import BlockIcon from '@mui/icons-material/Block';
import { useTranslation } from "react-i18next";

interface NoPermissionsProps {
	fontRatio?: number;
}

/**
 * Generic 'no permission' component to show in case of forbidden access
 */
export function NoPermissions(props: NoPermissionsProps) {
	const { t } = useTranslation();
	const theme = useTheme();
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

	const fontRatio = props.fontRatio || (desktopMode ? 50 : 35);

	return <Grid
		style={{ width: '100%', height: '100%', textAlign: 'center' }}
		container
		direction="column"
		justifyContent="center"
		alignItems="center"
	>
		<div>
			<BlockIcon style={{ fontSize: fontRatio * 5, color: getModeColor(false, theme) }} />
		</div>
		<Typography style={{ fontSize: fontRatio * 0.9, marginTop: fontRatio * 0.5, color: getModeColor(false, theme) }} >{t('You dont have permission to see this content')}</Typography>
	</Grid>
}