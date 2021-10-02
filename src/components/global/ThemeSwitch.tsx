import { makeStyles, Theme, useTheme } from "@material-ui/core";
import Switch, { SwitchProps } from "@mui/material/Switch";

const useStyles = makeStyles((theme: Theme) => ({
	track: {
		backgroundColor: `${theme.palette.grey[400]} !important`, // Used only for light mode, when the active is off, need to override the track color
	},
}));

/**
 * MUI  Switch with adaption to the dashboard's theme.
 */
export function ThemeSwitch(props: SwitchProps) {
	const classes = useStyles();
	const theme = useTheme();

	return <Switch {...props} classes={{
		// Override the track color in light and inactive mode only
		track: theme.palette.type === 'light' && !props.checked ? classes.track : undefined
	}} />;
}
