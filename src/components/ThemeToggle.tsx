import { IconButton, PaletteType } from "@material-ui/core";
import { useTranslation } from "react-i18next"
import DarkIcon from '@material-ui/icons/Brightness4';
import LightIcon from '@material-ui/icons/BrightnessHigh';
import { ThemeTooltip } from "./global/ThemeTooltip";

interface ThemeToggleProps {
	theme: PaletteType;
	setDarkMode: (paletteType: PaletteType) => void;
}
export function ThemeToggle(props: ThemeToggleProps) {
	const { t } = useTranslation();

	return <div>
		<ThemeTooltip title={<span>{t('dashboard.toolbar.theme.toggle')}</span>} enterDelay={100}>
			<IconButton
				onClick={() => props.setDarkMode(props.theme === 'dark' ? 'light' : 'dark')}
				color="inherit">
				{props.theme === 'dark' ? <LightIcon fontSize="small" /> : <DarkIcon fontSize="small" />}
			</IconButton>
		</ThemeTooltip>
	</div>
}