import { Grid, Theme, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { getModeColor } from "../logic/common/themeUtils";

interface NoContentProps {
	fontRatio?: number;
	Icon: any;
	message: string;
}

/**
 * Generic 'no content' component to show for empty pages
 */
export function NoContent(props: NoContentProps) {
	const theme = useTheme();
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

	const { Icon, message } = props;
	const fontRatio = props.fontRatio || (desktopMode ? 50 : 35);

	return <Grid
		style={{ width: '100%', height: '100%', textAlign: 'center' }}
		container
		direction="column"
		justifyContent="center"
		alignItems="center"
	>
		<div>
			<Icon style={{ fontSize: fontRatio * 5, color: getModeColor(false, theme) }} />
		</div>
		<Typography style={{ fontSize: fontRatio * 0.9, marginTop: fontRatio * 0.5, color: getModeColor(false, theme) }} >{message}</Typography>
	</Grid>
}