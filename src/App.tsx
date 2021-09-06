import React, { Suspense, useState } from 'react';
import './theme/styles/app.css';
import { createTheme, PaletteType, ThemeProvider, useMediaQuery } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import {
	HashRouter,
	Switch,
	Route,
	Redirect
} from "react-router-dom";
import { Dashboard } from './pages/Dashboard';
import { getLocalStorageItem, LocalStorageKey } from './logic/common/local-storage';
import { Loader } from './components/Loader';
import { getLang } from './logic/services/localization.service';

const Login = React.lazy(() => import('./pages/Login'));

function App() {
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
	const [darkMode, setDarkMode] = useState<PaletteType>(getLocalStorageItem<PaletteType>(LocalStorageKey.Theme, { itemType: 'string' }) || prefersDarkMode ? 'dark' : 'light');
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

	return (
		<div className="App">
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Suspense fallback={<Loader />}>
					<HashRouter>
						<Switch>
							<Route exact path="/login">
								<Login />
							</Route>
							<Route path="/dashboard">
								<Dashboard />
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
