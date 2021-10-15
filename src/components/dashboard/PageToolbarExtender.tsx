import { Grid, useTheme } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { ThemeTooltip } from "../global/ThemeTooltip";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

interface PageToolbarExtenderProps {
	collapsePageToolbar: boolean;
	toggleToolBar: () => void;
}

export function PageToolbarExtender(props: PageToolbarExtenderProps) {
	const { t } = useTranslation();
	const theme = useTheme();

	const ToggleToolbarIcon = props.collapsePageToolbar ? ArrowDropDownIcon : ArrowDropUpIcon;

	return <ThemeTooltip title={<span>{t(`dashboard.toolbar.pages.${props.collapsePageToolbar ? 'show' : 'collapse'}.toolbar`)}</span>} >
		<div className="dashboard-pages-show-toolbar-indicator"
			onClick={props.toggleToolBar}
			style={{
				backgroundColor: theme.palette.background.paper
			}}
		>
			<Grid
				style={{ height: '100%', width: '100%' }}
				container
				direction="row"
				justifyContent="center"
				alignItems="center"
			>
				<div style={{ marginTop: -7 }}>
					<ToggleToolbarIcon />
				</div>
			</Grid>
		</div>
	</ThemeTooltip>;
}
