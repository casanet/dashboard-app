import React, { Suspense, useMemo, useState } from 'react';
import './theme/styles/global.scss';
import './theme/styles/app.scss';
import { createTheme, PaletteType, ThemeProvider, useMediaQuery, useTheme } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import {
	HashRouter,
	Switch,
	Route,
	Redirect,
} from "react-router-dom";
import { getLocalStorageItem, LocalStorageKey, setLocalStorageItem } from './infrastructure/local-storage';
import { Loader } from './components/Loader';
import { NotificationContainer } from './components/NotificationContainer';
import { getLang } from './services/localization.service';
import { AppRoutes } from './infrastructure/consts';

const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

function App() {
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
		<div className="App" style={globalCssVars}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<NotificationContainer />
				<Suspense fallback={<Loader />}>
					<HashRouter>
						<Switch>
							<Route exact path={AppRoutes.login.path}>
								<Login setDarkMode={applyThemeMode} theme={darkMode} />
							</Route>
							<Route path={AppRoutes.dashboard.path}>
								<Dashboard setDarkMode={applyThemeMode} theme={darkMode} />
							</Route>
							<Route exact path={["/", "/*"]}>
								<Redirect to={AppRoutes.dashboard.path} />
							</Route>
						</Switch>
					</HashRouter>
				</Suspense>
			</ThemeProvider>
		</div>
	);
}

export default App;
