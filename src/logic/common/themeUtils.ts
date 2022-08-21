import { Theme } from "@material-ui/core";

/** Calc color for mode indicators (such as icons, brightness indicators etc..), based on status and theme */
export function getModeColor(isOn: boolean, theme: Theme) {
	return isOn ? 'inherit' : theme.palette.grey[theme.palette.type === 'light' ? 400 : 600];
}

type marginSide = 'marginLeft' | 'marginRight';

/** marginLeft real key consider LTR vs RTL */
export function marginLeft(theme: Theme): marginSide {
	return theme.direction === "ltr" ? 'marginLeft' : 'marginRight';
}

/** marginRight real key consider LTR vs RTL */
export function marginRight(theme: Theme): marginSide {
	return theme.direction === "ltr" ? 'marginRight' : 'marginLeft';
}

type paddingSide = 'paddingLeft' | 'paddingRight';

/** paddingLeft real key consider LTR vs RTL */
export function paddingLeft(theme: Theme): paddingSide {
	return theme.direction === "ltr" ? 'paddingLeft' : 'paddingRight';
}

/** paddingRight real key consider LTR vs RTL */
export function paddingRight(theme: Theme): paddingSide {
	return theme.direction === "ltr" ? 'paddingRight' : 'paddingLeft';
}

type side = 'left' | 'right';

/** Left real key consider LTR vs RTL */
export function left(theme: Theme): side {
	return theme.direction === "ltr" ? 'left' : 'right';
}

/** Right real key consider LTR vs RTL */
export function right(theme: Theme): side {
	return theme.direction === "ltr" ? 'right' : 'left';
}

/** The new MUI input text color */
export function inputColor(theme: Theme) {
	return theme.palette.grey[900];
}
