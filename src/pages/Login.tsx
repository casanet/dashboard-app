
import { Button, Grid, Paper, TextField, Typography, LinearProgress, Link, PaletteType, FormControl, InputLabel, InputAdornment, IconButton, OutlinedInput, Input, Select, MenuItem, useTheme } from '@material-ui/core';
import '../theme/styles/login.scss';
import casanetLogo from '../static/logo-app.png';
import { Trans, useTranslation } from 'react-i18next';
import { useState } from 'react';
import isEmail from 'isemail';
import { sessionManager } from '../infrastructure/session-manager';
import { envFacade } from '../infrastructure/env-facade';
import { API_KEY_HEADER, AppRoutes, DEFAULT_FONT_RATION, PROJECT_URL, SERVER_REPO_URL } from '../infrastructure/consts';
import { useHistory } from 'react-router-dom';
import { ThemeToggle } from '../components/global/ThemeToggle';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import { isValidUrl } from '../infrastructure/utils';
import { handleServerRestError } from '../services/notifications.service';
import { ThemeTooltip } from '../components/global/ThemeTooltip';
import { profileService } from '../services/users.service';
import { ApiFacade } from '../infrastructure/generated/api/swagger/api';
import { ThemeSwitch } from '../components/global/ThemeSwitch';

interface LocalServer {
	displayName: string;
	localServerId: string;
}

interface LoginProps {
	theme: PaletteType;
	setDarkMode: (paletteType: PaletteType) => void;
}

function LoginForm() {
	const { t } = useTranslation();
	const history = useHistory();
	const theme = useTheme();
	const [loading, setLoading] = useState<boolean>();
	const [mfaMode, setMfaMode] = useState<boolean>();
	const [localServerSelectionMode, setLocalServerSelectionMode] = useState<boolean>();
	const [emailError, setEmailError] = useState<boolean>(false);
	const [passwordError, setPasswordError] = useState<boolean>(false);
	const [localServerIdError, setLocalServerIdError] = useState<boolean>(false);
	const [mfaError, setMfaError] = useState<boolean>(false);
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [localServerId, setLocalServerId] = useState<string>('');
	const [localServers, setLocalServers] = useState<LocalServer[]>([]);
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [serverUrl, setServerUrl] = useState<string>(envFacade.apiServerBaseUrl);
	const [serverUrlEditMode, setServerUrlEditMode] = useState<boolean>(false);
	const [serverUrlError, setServerUrlError] = useState<boolean>(false);
	const [demoMode, setDemoMode] = useState<boolean>(envFacade.mockMode);

	const [mfa, setMfa] = useState<string>('');

	async function applyLogin(authResponse: Response) {

		try {
			const loginPayload = await authResponse?.json?.() as { isRemote?: boolean, localAddress?: string };

			// Keep login info 
			envFacade.localIP = loginPayload?.localAddress || '';
			envFacade.remoteConnection = !!loginPayload?.isRemote;

			if (envFacade.isTokenAllowed) {
				sessionManager.setToken(authResponse.headers.get(API_KEY_HEADER) || '');
			}
			const profile = await profileService.forceFetchData();
			sessionManager.onLogin(profile);
			history.push(AppRoutes.dashboard.path);
		} catch (error) {
			handleServerRestError(error);
		}
	}

	async function login() {
		if (mfaMode) {
			try {
				const authResponse = await ApiFacade.AuthenticationApi.loginTfa({ email, mfa, localServerId });
				applyLogin(authResponse);
			} catch (error) {
				handleServerRestError(error);
			}
			return;
		}

		try {
			const authResponse = await ApiFacade.AuthenticationApi.login({ email, password, localServerId });

			// If the login request is OK, but user need to select the local server to connect 
			// (In case there are more than one local server for same user)
			if (authResponse.status === 210) {
				// Get the local servers, and let the user to select one of them
				const localServers = await authResponse.json() as LocalServer[];
				setLocalServerSelectionMode(true);
				setLocalServers(localServers);
				return;
			}
			setLocalServerSelectionMode(false);


			if (authResponse.status === 201) {
				setMfaMode(true);
				return;
			}

			applyLogin(authResponse);

		} catch (error: any) {
			// In any case of failure, clean the local server selection 
			setLocalServerId('');
			setLocalServerSelectionMode(false);
			handleServerRestError(error);
		}
	}

	async function submit() {
		// First check the forms input that they OK, mark as error if case of not.
		let ignoreSubmit = false;
		if (!email || !isEmail.validate(email)) {
			ignoreSubmit = true;
			setEmailError(true);
		}
		if (!password) {
			ignoreSubmit = true;
			setPasswordError(true);
		}

		if (mfaMode && (!mfa || mfa.length < 6)) {
			ignoreSubmit = true;
			setMfaError(true);
		}

		if (localServerSelectionMode && !localServerId) {
			ignoreSubmit = true;
			setLocalServerIdError(true);
		}

		// Abort submit in case of error
		if (ignoreSubmit) {
			return;
		}

		setLoading(true);

		await login();

		setLoading(false);
	}

	function handleMouseDownInput(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();
	};

	function handleEditServerUrlToggle() {

		setServerUrlError(false);

		// If it's not in edit mode, set it 
		if (!serverUrlEditMode) {
			setServerUrlEditMode(true);
			return;
		}

		// If URL is invalid, abort
		if (!isValidUrl(serverUrl)) {
			setServerUrlError(true);
			return;
		}

		// Set and save the new URL
		setServerUrlEditMode(false);
		setServerUrl(serverUrl);
		envFacade.apiServerBaseUrl = serverUrl;
	}

	return <div id="login-form-container" className="login-form-container">
		<div className="login-form-header">
			<Grid
				container
				direction="column"
				justifyContent="center"
				alignItems="center"
			>
				<div className="login-form-header-icon">
					<img width={'75em'} height={'75em'} alt="casanet-logo" src={casanetLogo} />
				</div>
				<Typography variant="h6">
					{t('general.casanet.dashboard')}
				</Typography>
				<Typography variant="body1">
					<Trans i18nKey="login.welcome.message">
						Welcome to the <Link onClick={() => window.open(SERVER_REPO_URL, '_blank')}>casanet</Link> IoT dashboard
					</Trans>
				</Typography>
			</Grid>
		</div >
		<div className="login-form-inputs">

			{mfaMode && <Grid
				container
				direction="column"
			>
				<TextField
					disabled={loading}
					error={mfaError}
					className="login-form-input-item"
					required
					id="mfa-input"
					label={t('login.mfa.code')}
					variant="outlined"
					value={mfa}
					onChange={(e) => {
						setMfaError(false);
						// Accept only numbers
						setMfa(e.target.value.replace(/[^0-9]/g, ''));
					}}
					inputProps={{ maxLength: 6 }}
				/>
			</Grid>}
			{!mfaMode && <Grid
				container
				direction="column"
			>
				<TextField
					disabled={loading || localServerSelectionMode}
					error={emailError}
					className="login-form-input-item"
					id="email-address-input"
					label={t('login.email.address')}
					type="email"
					variant="outlined"
					value={email}
					onChange={(e) => {
						setEmailError(false);
						setEmail(e.target.value);
					}}
				/>
				<FormControl variant="outlined">
					<InputLabel htmlFor="login-password">{t('login.password')}</InputLabel>
					<OutlinedInput
						className="login-form-input-item"
						// required
						disabled={loading || localServerSelectionMode}
						error={passwordError}
						id="login-password"
						label={t('login.password')}
						type={showPassword ? 'text' : 'password'}
						value={password}
						autoComplete="current-password"
						onChange={(e) => {
							setPassword(e.target.value);
						}}
						endAdornment={
							<InputAdornment position="end">
								<IconButton
									aria-label="toggle password visibility"
									onClick={() => { setShowPassword(!showPassword); }}
									onMouseDown={handleMouseDownInput}
									edge="end"
								>
									{showPassword ? <Visibility /> : <VisibilityOff />}
								</IconButton>
							</InputAdornment>
						}
					/>
				</FormControl>
				{localServerSelectionMode && <FormControl variant="outlined">
					<InputLabel id="local-server-select-label">{t('login.select.local.server')}</InputLabel>
					<Select
						error={localServerIdError}
						className="login-form-input-item"
						labelId="local-server-select-label"
						value={localServerId}
						label={t('login.select.local.server')}
						onChange={(e) => {
							setLocalServerIdError(false);
							setLocalServerId(e.target.value as string);
						}}
					>
						{
							localServers.map(s => <MenuItem value={s.localServerId}>{s.displayName}</MenuItem>)
						}
					</Select>
				</FormControl>}
			</Grid>}
		</div>
		<div className="login-form-submit">
			{loading
				? <LinearProgress />
				: <Button disabled={loading} id="login-submit" onClick={submit} style={{ width: '100%' }} variant="contained" color="primary" >
					{t('login.sign.in').toUpperCase()}
				</Button>}
		</div>
		{envFacade.mockModeAvailable && <div style={{ marginTop: '5%', width: '100%' }}>
			<Grid
				style={{ width: '100%', height: '100%', textAlign: 'center' }}
				container
				direction="column"
				justifyContent="center"
				alignItems="center"
			>
				<Typography variant="body2" >

					{t('general.demo.mode')}
					{envFacade.isMobileApp && <ThemeSwitch
						disabled={loading}
						checked={demoMode}
						onChange={() => {
							setDemoMode(!demoMode);
							envFacade.mockMode = !demoMode;
							// Reset the API URL usings
							setServerUrl(envFacade.apiServerBaseUrl);
						}}
						inputProps={{ 'aria-label': 'controlled' }}
					/>}
				</Typography>
			</Grid>
		</div>}
		{!demoMode && !envFacade.mockModeConst && envFacade.allowSetApiServiceURL && <FormControl className={'edit-server-url-container'} style={{ marginTop: '5%', width: '100%' }}>
			<InputLabel htmlFor="server-url-input">{t('global.server.url')}</InputLabel>
			<Input
				error={serverUrlError}
				disabled={!serverUrlEditMode}
				id="standard-adornment-password"
				type={'text'}
				value={serverUrl}
				onChange={(e) => {
					setServerUrl(e.target.value);
				}}
				endAdornment={
					<InputAdornment position="end">
						<ThemeTooltip title={<span>{t(`login.${serverUrlEditMode ? 'save' : 'edit'}.server.url`)}</span>}>
							<IconButton
								aria-label="toggle edit mode"
								onClick={handleEditServerUrlToggle}
								onMouseDown={handleMouseDownInput}
							>
								{!serverUrlEditMode ? <EditIcon /> : <SaveIcon />}
							</IconButton>
						</ThemeTooltip>
					</InputAdornment>
				}
			/>
		</FormControl>}
		<Grid
			style={{ textAlign: 'center', textOverflow: 'clip', marginTop: '3%' }}
			container
			direction="row"
			justifyContent="center"
			alignItems="center">
			<div style={{ maxWidth: '280px' }}>
				{(envFacade.mockModeConst || demoMode) && <div style={{ color: theme.palette.text.hint, marginBottom: DEFAULT_FONT_RATION }}>
					<Typography variant="body2" >
						{t('general.demo.mode.tip')}
					</Typography>
				</div>}
				{(envFacade.mockModeConst || demoMode) && <div style={{ color: theme.palette.text.hint, marginBottom: DEFAULT_FONT_RATION }}>
					<Typography variant="body2" style={{ fontSize: DEFAULT_FONT_RATION * 0.5 }} >
						{t('general.mobile.demo.url.tip.title')}
						{envFacade.isMobileApp && <br />}
						{envFacade.isMobileApp && t('general.mobile.demo.url.tip.switch.app.info')}
					</Typography>
				</div>}
				<Typography variant="body2" onClick={() => window.open(PROJECT_URL, '_blank')}>
					{t('general.copyright.message', { year: new Date().getFullYear() })}
				</Typography>
				<Typography style={{ fontSize: DEFAULT_FONT_RATION * 0.5, marginTop: DEFAULT_FONT_RATION * 0.4 }} onClick={() => window.open('https://www.freepik.com/free-photos-vectors/technology-pattern', '_blank')}>
					<Trans i18nKey="login.background.credit.message" values={{ url: 'www.freepik.com' }}>
						Background from  www.freepik.com
					</Trans>
				</Typography>
			</div>
		</Grid>
	</div >
}


export default function Login(props: LoginProps) {
	return <div className={`login-container --theme-${props.theme}`}>
		<div>
			<Grid
				className="login-card-grid"
				container
				direction="row"
				justifyContent="center"
				alignItems="center"
			>
				<Paper className="login-content-paper" elevation={10}>
					<div className="login-content-container">
						<LoginForm />
					</div>
					<div className="login-content-paper-theme" >
						<ThemeToggle theme={props.theme} setDarkMode={props.setDarkMode} />
					</div>
				</Paper>
			</Grid>
		</div>
	</div>
}