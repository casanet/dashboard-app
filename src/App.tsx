import React, { Suspense, useMemo, useState } from 'react';
import './theme/styles/global.scss';
import './theme/styles/app.scss';
import { createTheme, PaletteType, ThemeProvider, useMediaQuery, useTheme } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import MuiCssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import {
	Routes,
	HashRouter,
	Route,
	Navigate,
} from "react-router-dom";
import { getLocalStorageItem, LocalStorageKey, setLocalStorageItem } from './infrastructure/local-storage';
import { Loader } from './components/Loader';
import { NotificationContainer } from './components/NotificationContainer';
import { getLang } from './services/localization.service';
import { AppRoutes } from './infrastructure/consts';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useTranslation } from 'react-i18next';
import { envFacade } from './infrastructure/env-facade';

const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

function App() {
	const { t } = useTranslation();
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
	const themePalette = useTheme();
	const [darkMode, setDarkMode] = useState<PaletteType>(getLocalStorageItem<PaletteType>(LocalStorageKey.Theme, { itemType: 'string' }) || (prefersDarkMode ? 'dark' : 'light'));

	function applyThemeMode(paletteType: PaletteType) {
		setDarkMode(paletteType);
		setLocalStorageItem<PaletteType>(LocalStorageKey.Theme, paletteType, { itemType: 'string' });
	}

	const theme = useMemo(
		() => {
			const viewLanguage = getLang();
			return createTheme({
				typography: {
					fontFamily: viewLanguage.fontFamily || 'Segoe UI'
				},
				palette: {
					type: darkMode,
				},
				direction: viewLanguage.direction
			})
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[prefersDarkMode, darkMode],
	);

	// Inject global var into global.scss
	const globalCssVars = {
		"--primary-color": themePalette.palette.primary.main,
		"--background-color": themePalette.palette.background.default,
	} as React.CSSProperties;

	return (
		<div style={globalCssVars}>
			<ThemeProvider theme={theme}>
				<MuiThemeProvider theme={theme}>
					<CssBaseline />
					<MuiCssBaseline />
					<NotificationContainer />
					<Suspense fallback={<Loader fullScreen={true} fancy={{
						text: t('global.rendering.app', { app: t(envFacade.isMobileApp ? 'global.application' : 'global.dashboard').toLowerCase() }),
						icon: DashboardIcon
					}} />}>
						<HashRouter>
							<Routes>
								<Route path={AppRoutes.login.path} element={<Login setDarkMode={applyThemeMode} theme={darkMode} />}/>									
								<Route path={AppRoutes.dashboard.path} element={<Dashboard setDarkMode={applyThemeMode} theme={darkMode} />}/>
								<Route path={"/*"}  element={<Navigate to={AppRoutes.dashboard.path} />} />
							</Routes>
						</HashRouter>
					</Suspense>
				</MuiThemeProvider>
			</ThemeProvider>
		</div>
	);
}

export default App;
