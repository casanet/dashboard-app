import React, { Suspense, useState } from 'react';
import './theme/styles/global.scss';
import './theme/styles/app.scss';
import { createTheme, PaletteType, ThemeProvider, useMediaQuery, useTheme  } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import {
	HashRouter,
	Switch,
	Route,
	Redirect
} from "react-router-dom";
import { getLocalStorageItem, LocalStorageKey, setLocalStorageItem } from './infrastructure/local-storage';
import { Loader } from './components/Loader';
import { getLang } from './services/localization.service';

const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

function App() {
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
	const [darkMode, setDarkMode] = useState<PaletteType>(getLocalStorageItem<PaletteType>(LocalStorageKey.Theme, { itemType: 'string' }) || (prefersDarkMode ? 'dark' : 'light'));
	const themePalette = useTheme();
	const theme = React.useMemo(
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

	function applyThemeMode(paletteType: PaletteType) {
		setDarkMode(paletteType);
		setLocalStorageItem<PaletteType>(LocalStorageKey.Theme, paletteType, { itemType: 'string' });
	}

	// Inject global var into global.scss
	const globalCssVars = { 
		"--primary-color": themePalette.palette.primary.main,
		"--background-color": themePalette.palette.background.default,
	} as React.CSSProperties;

	return (
		<div className="App" style={globalCssVars}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Suspense fallback={<Loader />}>
					<HashRouter>
						<Switch>
							<Route exact path="/login">
								<Login />
							</Route>
							<Route path="/dashboard">
								<Dashboard setDarkMode={applyThemeMode} theme={darkMode} />
							</Route>
							<Route exact path="/">
								<Redirect to="/login" />
							</Route>
							<Route exact path="/*">
								<Redirect to="/dashboard" />
							</Route>
						</Switch>
					</HashRouter>
				</Suspense>
			</ThemeProvider>
		</div>
	);
}

export default App;
