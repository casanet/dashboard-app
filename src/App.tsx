import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import 'date-fns';
import { CircularProgress, createTheme, PaletteType, ThemeProvider, useMediaQuery } from '@material-ui/core';
import { KeyboardDatePicker, KeyboardTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import { useTranslation } from 'react-i18next';
import CssBaseline from '@material-ui/core/CssBaseline';
// import 'cordova-plugin-device';

// Device.


function App() {
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
	const [darkMode, setDarkMode] = useState<PaletteType>(localStorage.getItem('prefersDarkMode') || prefersDarkMode ? 'dark' : 'light');
	const [api, setApi] = useState<any>({});
	const theme = React.useMemo(
		() => {
			// const prefersDarkModeCache = localStorage.getItem('prefersDarkMode') || prefersDarkMode;
			return createTheme({
				palette: {
					type: darkMode,
					// type: 'dark',
				},
			})
		}
		,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[prefersDarkMode, darkMode],
	);
	useEffect(() => {
		(async() => {
			const res = await fetch('https://api.chucknorris.io/jokes/random');
			const apis = await res.json();
			setApi(apis);
		})();
	}, [])

	const { t } = useTranslation();

	localStorage.setItem('a', 'v');
	const v = localStorage.getItem('a');
	// The first commit of Material-UI
	const [selectedDate, setSelectedDate] = React.useState<Date | null>(
		new Date('2014-08-18T21:11:54'),
	);

	const toggleDark = () => {
		const newMode = darkMode === 'dark' ? 'light' : 'dark';
		localStorage.setItem('prefersDarkMode', newMode);
		setDarkMode(newMode);
	};

	const handleDateChange = (date: Date | null) => {
		setSelectedDate(date);
	};
	return (
		<div className="App">
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<CircularProgress />
					<MuiPickersUtilsProvider utils={DateFnsUtils}>
						<Grid container justifyContent="space-around">
							<KeyboardDatePicker
								disableToolbar
								variant="inline"
								format="MM/dd/yyyy"
								margin="normal"
								id="date-picker-inline"
								// label="Date picker inline"
								label="בחר תאריך"
								value={selectedDate}
								onChange={handleDateChange}
								KeyboardButtonProps={{
									'aria-label': 'change date',
								}}
							/>
							<KeyboardDatePicker
								margin="normal"
								id="date-picker-dialog"
								label="Date picker dialog"
								format="MM/dd/yyyy"
								value={selectedDate}
								onChange={handleDateChange}
								KeyboardButtonProps={{
									'aria-label': 'change date',
								}}
							/>
							<KeyboardTimePicker
								margin="normal"
								id="time-picker"
								label="Time picker"
								value={selectedDate}
								onChange={handleDateChange}
								KeyboardButtonProps={{
									'aria-label': 'change time',
								}}
							/>
						</Grid>
					</MuiPickersUtilsProvider>
					{device.platform + v}
					<div>
						{t('Welcome to React')}
					</div>
					{api?.value || 'loading'}
					<p onClick={toggleDark}>
						Edit <code>src/App.tsx</code> and save to reload.
					</p>
					<a
						className="App-link"
						href="https://reactjs.org"
						target="_blank"
						rel="noopener noreferrer"
					>
						Learn React
					</a>
				</header>
			</ThemeProvider>
		</div>
	);
}

export default App;
