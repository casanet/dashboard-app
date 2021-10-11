import { Paper, IconButton } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { ThemeTooltip } from "../global/ThemeTooltip";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface PageToolbarExtenderProps {
	collapsePageToolbar: boolean;
	toggleToolBar: () => void;
}

export function PageToolbarExtender(props: PageToolbarExtenderProps) {
	const { t } = useTranslation();

	const ToggleToolbarIcon = props.collapsePageToolbar ? KeyboardArrowDownIcon : KeyboardArrowUpIcon;

	return <Paper elevation={3} style={{ opacity: 0.5 }}>
		<ThemeTooltip title={<span>{t('dashboard.toolbar.pages.show.toolbar')}</span>}>
			<IconButton
				onClick={props.toggleToolBar}
				color="inherit">
				<ToggleToolbarIcon />
			</IconButton>
		</ThemeTooltip>
	</Paper>;
}