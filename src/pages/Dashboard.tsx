import { AppBar, Box, Grid, Tabs, Tab, IconButton, PaletteType, Toolbar, Typography, Theme, makeStyles, useMediaQuery, useTheme } from "@material-ui/core";
import '../theme/styles/dashboard.scss';
import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
import RouterIcon from '@material-ui/icons/Router';
import SettingsIcon from '@material-ui/icons/Settings';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { SideBarBottom } from '../components/dashboard/SideBarBottom';
import { useTranslation } from "react-i18next";
import { ComponentType, LazyExoticComponent, Suspense, useEffect, useState } from "react";
import { getLocalStorageItem, LocalStorageKey, setLocalStorageItem } from "../infrastructure/local-storage";
import { getLang } from "../services/localization.service";
import {
	HashRouter,
	Switch,
	Route,
	Redirect,
	useHistory,
	useLocation
} from "react-router-dom";
import React from "react";
import { Loader } from "../components/Loader";
import { ProfileAvatar } from "../components/dashboard/ProfileAvatar";
import SearchIcon from '@mui/icons-material/Search';
import { AppRoutes, DashboardRoutes } from "../infrastructure/consts";
import { ToolBarControls } from "../components/dashboard/ToolBarControls";
import { sessionManager } from "../infrastructure/session-manager";
import InputBase from "@mui/material/InputBase";
import { ThemeTooltip } from "../components/global/ThemeTooltip";
import Collapse from '@mui/material/Collapse';
import { PageToolbarExtender } from "../components/dashboard/PageToolbarExtender";
import { PageToolbarContainer } from "../components/dashboard/PageToolbar";
import { MinionsToolbar } from "../components/toolbars/MinionsToolbar";
import { left, marginLeft } from "../logic/common/themeUtils";
import casanetLogo from '../static/logo-app.png';
import { NetworkToolbar } from "../components/toolbars/NetworkToolbar";
import { UsersToolbar } from "../components/toolbars/UsersToolbar";
import { useLiveliness } from "../hooks/useLiveliness";
import { livelinessCheck, livelinessFlag } from "../services/liveliness.service";
import { envFacade } from "../infrastructure/env-facade";
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import { RemoteConnectionStatus } from "../infrastructure/generated/api/swagger/api";

const Minions = React.lazy(() => import('./dashboard-pages/Minions'));
const Network = React.lazy(() => import('./dashboard-pages/Network'));
const Users = React.lazy(() => import('./dashboard-pages/Users'));
const Settings = React.lazy(() => import('./dashboard-pages/Settings'));
const Profile = React.lazy(() => import('./dashboard-pages/Profile'));
const Offline = React.lazy(() => import('../components/Offline'));

// Detect the direction, and use the correct arrow direction for extend/collapse side menu
const direction = getLang().direction;
const LeftArrowIcon = direction === 'rtl' ? ArrowBackIosIcon : ArrowForwardIosIcon;
const RightArrowIcon = direction === 'rtl' ? ArrowForwardIosIcon : ArrowBackIosIcon;

/** Any dashboard page, wants to get the dashboard search input value, required to add this to his props */
export interface DashboardPageInjectProps {
	searchText?: string;
}

interface DashboardProps {
	theme: PaletteType;
	setDarkMode: (paletteType: PaletteType) => void;
}

/** The interface represents a dashboard page full info for the router and the menus */
interface DashboardPage {
	icon: JSX.Element;
	nameKey: string;
	/** The page path (without params if exists) */
	path: string;
	/** The page full route definition (including the params if exists) */
	route: string;
	/** The page component */
	components: LazyExoticComponent<ComponentType<any>>;
	/** 
	 * Whenever the page supported filter some content by search string.
	 * if so, a search input will be shown at the app-bar and value will inject to the page
	 */
	supportedSearch?: boolean;
	/**
	 * The page toolbar (optional)
	 */
	toolbar?: any;
	/**
	 * Whenever it's page for admins only
	 */
	adminOnly?: boolean;
}

// Const predefined dimensions of bars menus etc,
const sideBarExtendedWidth = 110;
const sideBarCollapseWidth = 55;
const appBarHight = 64;
const footerMenuHight = 70;
const pagesToolbarPullUp = 16;

const useStyles = makeStyles((theme: Theme) => ({
	sideBarTab: {
		minWidth: 'unset', // do not set min width, align to the extend/collapse bar size
		height: '10vh',
		minHeight: '10vh',
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
		path: DashboardRoutes.minions.path,
		route: `${DashboardRoutes.minions.path}/:${DashboardRoutes.minions.param}?`,
		components: Minions,
		supportedSearch: true,
		toolbar: MinionsToolbar,
	},
	{
		icon: <RouterIcon />,
		nameKey: 'global.network',
		path: DashboardRoutes.network.path,
		route: DashboardRoutes.network.path,
		components: Network,
		supportedSearch: true,
		toolbar: NetworkToolbar,
	},
	{
		icon: <PeopleAltIcon />,
		nameKey: 'global.users',
		path: DashboardRoutes.users.path,
		route: `${DashboardRoutes.users.path}/:${DashboardRoutes.users.param}?`,
		components: Users,
		supportedSearch: true,
		toolbar: UsersToolbar,
		adminOnly: true
	},
	{
		icon: <SettingsIcon />,
		nameKey: 'global.settings',
		path: DashboardRoutes.settings.path,
		route: DashboardRoutes.settings.path,
		components: Settings,
	}
];

export default function Dashboard(props: DashboardProps) {
	const { t } = useTranslation();
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
	const theme = useTheme();
	const history = useHistory();
	const classes = useStyles();
	const liveliness = useLiveliness();
	const location = useLocation();
	const [waitForCommunication, setWaitForCommunication] = useState<boolean>(false);
	const [collapseMenu, setCollapseMenu] = useState<boolean>(!!getLocalStorageItem<boolean>(LocalStorageKey.CollapseMenu, { itemType: 'boolean' }));
	const [collapseToolbar, setCollapseToolbar] = useState<boolean>(getLocalStorageItem<boolean>(LocalStorageKey.CollapseAppToolbar, { itemType: 'boolean' }) ?? envFacade.isMobileApp);
	const [collapsePageToolbar, setCollapsePageToolbar] = useState<boolean>(getLocalStorageItem<boolean>(LocalStorageKey.CollapsePageToolbar, { itemType: 'boolean' }) ?? true);
	const [searchText, setSearchText] = useState<string>();

	useEffect(() => {
		(async () => {
			// Dashboard init, check liveliness, and if there is an issue in it, show offline view
			await livelinessCheck();
			setWaitForCommunication(!livelinessFlag.online || livelinessFlag.remoteConnection === RemoteConnectionStatus.LocalServerDisconnected);
		})();
	}, []);

	useEffect(() => {
		// Once liveliness mode has changed, make sure to update offline mode state 
		if (waitForCommunication && livelinessFlag.online && livelinessFlag.remoteConnection !== RemoteConnectionStatus.LocalServerDisconnected) {
			setWaitForCommunication(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [liveliness]);

	function toggleCollapseMenu() {
		const newCollapseMenuMode = !collapseMenu;
		setCollapseMenu(newCollapseMenuMode);
		setLocalStorageItem<boolean>(LocalStorageKey.CollapseMenu, newCollapseMenuMode, { itemType: 'boolean' });
	}

	function toggleCollapseToolbar() {
		const newCollapseToolbar = !collapseToolbar;
		setCollapseToolbar(newCollapseToolbar);
		setLocalStorageItem<boolean>(LocalStorageKey.CollapseAppToolbar, newCollapseToolbar, { itemType: 'boolean' });
	}

	function toggleCollapsePageToolbar() {
		const newCollapsePageToolbar = !collapsePageToolbar;
		setCollapsePageToolbar(newCollapsePageToolbar);
		setLocalStorageItem<boolean>(LocalStorageKey.CollapsePageToolbar, newCollapsePageToolbar, { itemType: 'boolean' });
	}

	const onTabSelected = (event: React.ChangeEvent<{}>, newValue: number) => {
		// Once the page has changed, reset the search
		setSearchText('');
		history.push(dashboardPages[newValue].path);
	};

	// In case of user not logged on
	if (!sessionManager.isLoggedOn) {
		console.warn('USER NOT LOGGED ON, SHOEING LOADER TILL REDIRECTION TO LOGIC PAGE EFFECT');
		sessionManager.onLogout();
		// In the meanwhile, dont load the dashboard, but show a loader
		return <div style={{ height: '100vh' }}><Loader /></div>;
	}

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
	const sideMenuWidth = !desktopMode ? 0 : collapseMenu ? sideBarCollapseWidth : sideBarExtendedWidth;
	const routerContainerWidth = !desktopMode ? '100vw' : `calc(100vw - ${sideMenuWidth}px)`;
	const routerContainerHight = `calc(100vh - ${desktopMode ? appBarHight : (appBarHight + footerMenuHight)}px)`;

	// The properties of the current page in the view
	const dashboardPage = dashboardPages.find(p => location.pathname.startsWith(p.path));

	// Is user have the permission to see current page
	const accessPageForbidden = !!dashboardPage?.adminOnly && !sessionManager.isAdmin;

	// Calc if show the toolbar, if it exists for current page, and the user allowed to see this page
	const showPageToolbar = dashboardPage?.toolbar && !accessPageForbidden;

	return <div className="dashboard-container" style={dashboardCssVars}>
		<div className="dashboard-header">
			<AppBar position="static" color="default">
				<Toolbar className="dashboard-header-tool-box"
					style={{ backgroundColor: 'inherit' }} // inherit to pomp the color to the dashboard controls component
				>
					<Grid
						style={{ backgroundColor: 'inherit' }} // inherit to pomp the color to the dashboard controls component
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
								{!dashboardPage?.supportedSearch
									? <img width={'40px'} height={'40px'} alt="casanet-logo" src={casanetLogo} />
									: <IconButton edge="start" color="inherit" aria-label="menu">
										<SearchIcon />
									</IconButton>
								}

								{dashboardPage?.supportedSearch && <InputBase
									style={{ position: 'absolute', zIndex: 5, marginTop: 3, [left(theme)]: '45px' }}
									sx={{ ml: 1, flex: 1 }}
									placeholder={t('dashboard.toolbar.search.in.page.content', { pageName: t(dashboardPage.nameKey).toLowerCase() })}
									value={searchText}
									onChange={(e) => {
										setSearchText(e.target.value)
									}}
									inputProps={{ 'aria-label': t('dashboard.toolbar.search.in.page.content', { pageName: t(dashboardPage.nameKey).toLowerCase() }) }}
								/>}
								{desktopMode && !dashboardPage?.supportedSearch && <Typography variant="h6" style={{ [marginLeft(theme)]: 20 }}>
									{t('general.casanet.dashboard')}
								</Typography>}
							</Grid>
						</div>
						<div className="dashboard-header-tool-box-controls"
							style={{ backgroundColor: 'inherit' }} // inherit the color to make sure if the content is on the search placeholder, it will be covered
						>
							<Grid
								container
								direction="row"
								justifyContent="flex-end"
								alignItems="center"
							>
								<div>
									<ThemeTooltip title={<span>{t(`dashboard.toolbar.${collapseToolbar ? 'extend' : 'collapse'}.controls`)}</span>} enterDelay={100}>
										<IconButton
											onClick={toggleCollapseToolbar}
											color="inherit">
											{!collapseToolbar ? <LeftArrowIcon fontSize="small" /> : <RightArrowIcon fontSize="small" />}
										</IconButton>
									</ThemeTooltip>
								</div>
								<Collapse in={!collapseToolbar} orientation={'horizontal'}>
									<div className={`dashboard-toolbar-icons-container`}>
										<ToolBarControls theme={props.theme} setDarkMode={props.setDarkMode} />
									</div>
								</Collapse>
								<div>
									<ProfileAvatar />
								</div>
							</Grid>
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
								{collapseMenu ? <LeftArrowIcon fontSize="small" /> : <RightArrowIcon fontSize="small" />}
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
									// Hide tab for non authorized
									style={{ display: dashboardPage.adminOnly && !sessionManager.isAdmin ? 'none' : undefined }}
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
			<div className={`dashboard-router ${!desktopMode && '--mobile'}`} style={{
				maxWidth: routerContainerWidth,
				width: routerContainerWidth,
				maxHeight: routerContainerHight,
				height: routerContainerHight,
			}} >
				<div style={{ width: '100%', height: '100%', maxHeight: '100%' }}>
					{/* The show pages toolbar button component */}
					{showPageToolbar && <div
						style={{
							position: 'absolute',
							// The formula is : center of the screen + shift left of half of the side-menu and minus half of the component self width
							[left(theme)]: `calc(50vw - ${((- (sideMenuWidth * 0.5)) + 60)}px)`,
							top: appBarHight - 10,
							zIndex: 3,
						}}
					>
						<PageToolbarExtender collapsePageToolbar={collapsePageToolbar} toggleToolBar={toggleCollapsePageToolbar} />
					</div>}
					{/* The pages toolbar component, pull it up to make it by start under the app-bar */}
					{showPageToolbar && <div style={{ marginTop: -pagesToolbarPullUp }}>
						<Collapse in={!collapsePageToolbar}>
							<PageToolbarContainer toggleToolBar={toggleCollapsePageToolbar}>
								<dashboardPage.toolbar />
							</PageToolbarContainer>
						</Collapse>
					</div>}
					{/* On collapse page toolbar, cancel the toolbar marginTop effect */}
					{showPageToolbar && collapsePageToolbar && <div style={{ marginBottom: pagesToolbarPullUp }} />}
					<div style={{ width: '100%', height: `calc(100% - ${(showPageToolbar && !collapsePageToolbar) ? appBarHight : 0}px)` }}>
						<Suspense fallback={<Loader fancy={{
							text: t('global.rendering.component'),
							icon: DashboardCustomizeIcon
						}} />}>
							{/* Show offline page in case of OFFLINE mode */}
							{waitForCommunication && <Offline />}
							{/* Show pages only in ONLINE mode */}
							{!waitForCommunication && <HashRouter>
								<Switch>
									{/* Generate route for each page */}
									{dashboardPages.map(dashboardPage =>
										<Route exact path={dashboardPage.route}>
											<dashboardPage.components searchText={searchText} />
										</Route>)}
									{/* The profile page is not lined to any page tab */}
									<Route exact path={`${DashboardRoutes.profile.path}/:${DashboardRoutes.profile.param}?`}><Profile /></Route>
									{/* As fallback, redirect to the first page */}
									<Route exact path={[AppRoutes.dashboard.path, `${AppRoutes.dashboard.path}/*`]}>
										<Redirect to={dashboardPages[0].path} />
									</Route>
								</Switch>
							</HashRouter>}
						</Suspense>
					</div>
				</div>
			</div>
		</div>
		{/* Show footer menu in mobile mode only */}
		{!desktopMode && <div className="dashboard-footer-menu">
			<AppBar position="static" color="default" style={{ height: footerMenuHight, maxHeight: footerMenuHight }}>
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
								// Hide tab for non authorized
								style={{
									// Set the hight to be slight up to better visibility of the bottom-line
									height: footerMenuHight - 1, maxHeight: footerMenuHight - 1,
									display: dashboardPage.adminOnly && !sessionManager.isAdmin ? 'none' : undefined
								}}
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