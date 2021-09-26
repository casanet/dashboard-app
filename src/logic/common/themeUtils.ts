import { Theme } from "@material-ui/core";

/** Calc color for mode indicators (such as icons, brightness indicators etc..), based on status and theme */
export function getModeColor(isOn: boolean, theme: Theme) {
	return isOn ? 'inherit' : theme.palette.grey[theme.palette.type === 'light' ? 400 : 600];
}