import { AppBar, Box, Grid, Tabs, Tab, IconButton, PaletteType, Toolbar, Tooltip, Typography, Theme, makeStyles, useMediaQuery } from "@material-ui/core";
import '../theme/styles/dashboard.scss';
import MenuIcon from '@material-ui/icons/Menu';
import DarkIcon from '@material-ui/icons/Brightness4';
import LightIcon from '@material-ui/icons/BrightnessHigh';
import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
import RouterIcon from '@material-ui/icons/Router';
import SettingsIcon from '@material-ui/icons/Settings';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { SideBarBottom } from '../components/SideBarBottom';
import { useTranslation } from "react-i18next";
import { ComponentType, LazyExoticComponent, Suspense, useState } from "react";
import { getLocalStorageItem, LocalStorageKey, setLocalStorageItem } from "../infrastructure/local-storage";
import { getLang } from "../logic/services/localization.service";
import {
	HashRouter,
	Switch,
	Route,
	Redirect,
	useRouteMatch,
	useHistory,
	useLocation
} from "react-router-dom";
import React from "react";
import { Loader } from "../components/Loader";

const Minions = React.lazy(() => import('./dashboard-pages/Minions'));
const Network = React.lazy(() => import('./dashboard-pages/Network'));
const Users = React.lazy(() => import('./dashboard-pages/Users'));
const Settings = React.lazy(() => import('./dashboard-pages/Settings'));

// Detect the direction, and use the correct arrow direction for extend/collapse side menu
const direction = getLang().direction;
const ExtendMenuIcon = direction === 'rtl' ? ArrowBackIosIcon : ArrowForwardIosIcon;
const CollapseMenuIcon = direction === 'rtl' ? ArrowForwardIosIcon : ArrowBackIosIcon;

interface DashboardProps {
	theme: PaletteType;
	setDarkMode: (paletteType: PaletteType) => void;
}

/** The interface represents a dashboard page full info for the router and the menus */
interface DashboardPage {
	icon: JSX.Element;
	nameKey: string;
	path: string;
	components: LazyExoticComponent<ComponentType<any>>;
}

// Const predefined dimensions of bars menus etc,
const sideBarExtendedWidth = 110;
const sideBarCollapseWidth = 55;
const appBarHight = 64;
const footerMenuHight = 60;

const useStyles = makeStyles((theme: Theme) => ({
	sideBarTab: {
		minWidth: 'unset', // do not set min width, align to the extend/collapse bar size
		height: '8vh',
		minHeight: '8vh',
	},
	sideBarTabIndicator: {
		left: '0px' // Set selected item line indicator to be in left 
	},
}));

/** The dashboard pages collection */
const dashboardPages: DashboardPage[] = [
	{
		icon: <WbIncandescentIcon />,
		nameKey: 'global.minions',
		path: 'minions',
		components: Minions,
	},
	{
		icon: <PeopleAltIcon />,
		nameKey: 'global.users',
		path: 'users',
		components: Users,
	},
	{
		icon: <RouterIcon />,
		nameKey: 'global.network',
		path: 'network',
		components: Network,
	},
	{
		icon: <SettingsIcon />,
		nameKey: 'global.settings',
		path: 'settings',
		components: Settings,
	}
];

export default function Dashboard(props: DashboardProps) {
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
	const { path, url } = useRouteMatch();
	const history = useHistory();
	const location = useLocation();
	const { t } = useTranslation();
	const [collapseMenu, setCollapseMenu] = useState<boolean>(!!getLocalStorageItem<boolean>(LocalStorageKey.CollapseMenu, { itemType: 'boolean' }));
	const classes = useStyles();

	function toggleCollapseMenu() {
		const newCollapseMenuMode = !collapseMenu;
		setCollapseMenu(newCollapseMenuMode);
		setLocalStorageItem<boolean>(LocalStorageKey.CollapseMenu, newCollapseMenuMode, { itemType: 'boolean' });
	}

	const onTabSelected = (event: React.ChangeEvent<{}>, newValue: number) => {
		history.push(`${url}/${dashboardPages[newValue].path}`)
	};

	// Find the current route shown component index  
	const tabIndex = dashboardPages.findIndex(d => location?.pathname?.includes(d.path));

	// Inject dashboard bars and menu dimension to the global.scss
	const dashboardCssVars = {
		"--app-bar-hight": `${appBarHight}px`,
		"--side-bar-extended-width": `${sideBarExtendedWidth}px`,
		"--side-bar-collapse-width": `${sideBarCollapseWidth}px`,
		"--footer-menu-hight": `${footerMenuHight}px`,
	} as React.CSSProperties;

	// Calculate the box size for the pages content
	const routerContainerWidth = !desktopMode ? '100vw' : `calc(100vw - ${collapseMenu ? sideBarCollapseWidth : sideBarExtendedWidth}px)`;
	const routerContainerHight = `calc(100vh - ${desktopMode ? appBarHight : (appBarHight + footerMenuHight)}px)`;

	return <div className="dashboard-container" style={dashboardCssVars}>
		<div className="dashboard-header">
			<AppBar position="static" color="default">
				<Toolbar className="dashboard-header-tool-box">
					<Grid
						container
						direction="row"
						justifyContent="space-between"
						alignItems="center">
						<div className="dashboard-header-tool-box-info">
							<Grid
								container
								direction="row"
								justifyContent="flex-start"
								alignItems="center">
								<IconButton edge="start" color="inherit" aria-label="menu">
									<MenuIcon />
								</IconButton>
								{desktopMode && <Typography variant="h6" >
									{t('general.casanet.dashboard')}
								</Typography>}
							</Grid>
						</div>
						<div className="dashboard-header-tool-box-controls">
							<Box display='flex' flexGrow={1}>
								<Tooltip title={<span>{t('dashboard.toolbar.theme.toggle')}</span>} enterDelay={300}>
									<IconButton
										onClick={() => props.setDarkMode(props.theme === 'dark' ? 'light' : 'dark')}
										color="inherit">
										{props.theme === 'dark' ? <LightIcon fontSize="small" /> : <DarkIcon fontSize="small" />}
									</IconButton>
								</Tooltip>
							</Box>
						</div>
					</Grid>
				</Toolbar>
			</AppBar>
		</div>
		<div className={"dashboard-content-dashboard"} style={{ height: `calc(100vh - ${appBarHight}px)` }}>
			{/* Show side menu in desktop mode only */}
			{desktopMode && <div className={`dashboard-side-menu  ${collapseMenu && '--collapse'} `}>
				<AppBar position="static" color="default" className={"dashboard--side-menu-bar"}>
					<div>
						<Box display='flex' className="dashboard-side-menu-collapse-icon-container" flexGrow={1}>
							<IconButton
								onClick={toggleCollapseMenu}
								color="inherit">
								{collapseMenu ? <ExtendMenuIcon fontSize="small" /> : <CollapseMenuIcon fontSize="small" />}
							</IconButton>
						</Box>
					</div>
					<Tabs
						className="dashboard-side-menu-tabs"
						orientation="vertical"
						value={tabIndex}
						onChange={onTabSelected}
						variant="scrollable"
						scrollButtons="auto"
						indicatorColor="primary"
						textColor="primary"
						aria-label={t('dashboard.pages.menu')}
						classes={{
							indicator: classes.sideBarTabIndicator
						}}

					>
						{
							dashboardPages.map(dashboardPage =>
								<Tab
									id={`dashboard-tab-${dashboardPage.path}`}
									aria-controls={`dashboard-tabpanel-${dashboardPage.path}`}
									className={classes.sideBarTab}
									label={collapseMenu ? '' : t(dashboardPage.nameKey)}
									icon={dashboardPage.icon}
									aria-label={t(dashboardPage.nameKey)} />)
						}
					</Tabs>
					{!collapseMenu && <div className="dashboard-side-menu-bottom-area">
						<SideBarBottom />
					</div>}
				</AppBar>
			</div>}
			<div className="dashboard-router" style={{
				maxWidth: routerContainerWidth,
				width: routerContainerWidth,
				maxHeight: routerContainerHight,
				height: routerContainerHight,
			}} >
				<Suspense fallback={<Loader />}>
					<HashRouter>
						<Switch>
							{/* Generate route for each page */}
							{dashboardPages.map(dashboardPage =>
								<Route exact path={`${path}/${dashboardPage.path}`}><dashboardPage.components /></Route>)}
							{/* As fallback, redirect to the first page */}
							<Route exact path={[`${path}`, `${path}/*`]}>
								<Redirect to={`${path}/${dashboardPages[0].path}`} />
							</Route>
						</Switch>
					</HashRouter>
				</Suspense>
			</div>
		</div>
		{/* Show footer menu in mobile mode only */}
		{!desktopMode && <div className="dashboard-footer-menu">
			<AppBar position="static" color="default">
				<Tabs
					value={tabIndex}
					onChange={onTabSelected}
					variant="fullWidth"
					scrollButtons="auto"
					indicatorColor="primary"
					textColor="primary"
					aria-label={t('dashboard.pages.menu')}
				>
					{
						dashboardPages.map(dashboardPage =>
							<Tab
								id={`dashboard-tab-${dashboardPage.path}`}
								aria-controls={`dashboard-tabpanel-${dashboardPage.path}`}
								className={classes.sideBarTab}
								label={t(dashboardPage.nameKey)}
								icon={dashboardPage.icon}
								aria-label={t(dashboardPage.nameKey)} />)
					}
				</Tabs>
			</AppBar>
		</div>}
	</div>
}