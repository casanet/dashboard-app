
import { Button, Grid, Paper, TextField, Typography, LinearProgress, Link, PaletteType, FormControl, InputLabel, InputAdornment, IconButton, OutlinedInput, Input, Tooltip } from '@material-ui/core';
import '../theme/styles/login.scss';
import casanetLogo from '../static/logo-app.png';
import { Trans, useTranslation } from 'react-i18next';
import { useState } from 'react';
import isEmail from "isemail";
import { ApiFacade } from '../infrastructure/generated/proxies/api-proxies';
import { sessionManager } from '../infrastructure/session-manager';
import { envFacade } from '../infrastructure/env-facade';
import { API_KEY_HEADER, AppRoutes, PROJECT_URL, SERVER_REPO_URL } from '../infrastructure/consts';
import { useHistory } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import { isValidHttpUrl } from '../infrastructure/utils';
import { handleServerRestError } from '../services/notifications.service';

interface LoginProps {
	theme: PaletteType;
	setDarkMode: (paletteType: PaletteType) => void;
}

function LoginForm() {
	const { t } = useTranslation();
	const history = useHistory();
	const [loading, setLoading] = useState<boolean>();
	const [mfaMode, setMfaMode] = useState<boolean>();
	const [emailError, setEmailError] = useState<boolean>(false);
	const [passwordError, setPasswordError] = useState<boolean>(false);
	const [mfaError, setMfaError] = useState<boolean>(false);
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [serverUrl, setServerUrl] = useState<string>(envFacade.apiServerUrl);
	const [serverUrlEditMode, setServerUrlEditMode] = useState<boolean>(false);
	const [serverUrlError, setServerUrlError] = useState<boolean>(false);

	const [mfa, setMfa] = useState<string>('');

	async function applyLogin() {

		try {
			const profile = await ApiFacade.UsersApi.getProfile();
			sessionManager.onLogin(profile);
			history.push(AppRoutes.dashboard.path);
		} catch (error) {
			handleServerRestError(error);
		}
	}

	async function login() {
		if (mfaMode) {
			try {
				await ApiFacade.AuthenticationApi.loginTfa({ email, mfa });
				applyLogin();
			} catch (error) {
				handleServerRestError(error);
			}
			return;
		}

		try {
			const authResponse = await ApiFacade.AuthenticationApi.login({ email, password });

			if (authResponse.status === 201) {
				setMfaMode(true);
				return;
			}

			if (envFacade.isTokenAllowed) {
				sessionManager.setToken(authResponse.headers.get(API_KEY_HEADER) || '');
			}

			applyLogin();

		} catch (error: any) {
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
		if (!isValidHttpUrl(serverUrl)) {
			setServerUrlError(true);
			return;
		}

		// Set and save the new URL
		setServerUrlEditMode(false);
		setServerUrl(serverUrl);
		envFacade.apiServerUrl = serverUrl;
	}

	return <div className="login-form-container">
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
					disabled={loading}
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
						disabled={loading}
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
			</Grid>}
		</div>
		<div className="login-form-submit">
			{loading
				? <LinearProgress />
				: <Button onClick={submit} style={{ width: '100%' }} variant="contained" color="primary" >
					{t('login.sign.in').toUpperCase()}
				</Button>}
		</div>
		<FormControl className={'edit-server-url-container'}>
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
						<Tooltip title={<span>{t(`login.${serverUrlEditMode ? 'save' : 'edit'}.server.url`)}</span>} enterDelay={100}>
							<IconButton
								aria-label="toggle edit mode"
								onClick={handleEditServerUrlToggle}
								onMouseDown={handleMouseDownInput}
							>
								{!serverUrlEditMode ? <EditIcon /> : <SaveIcon />}
							</IconButton>
						</Tooltip>
					</InputAdornment>
				}
			/>
		</FormControl>
		<div className="login-form-footer">
			<Typography variant="body2" onClick={() => window.open('https://www.freepik.com/vectors/background', '_blank')}>
				{/* <Trans i18nKey="login.background.credit.message" values={{ url: 'www.freepik.com' }}>
					Background from  www.freepik.com
				</Trans> */}
			</Typography>
			<Typography variant="body2" onClick={() => window.open(PROJECT_URL, '_blank')}>
				{t('general.copyright.message', { year: new Date().getFullYear() })}
			</Typography>
		</div>
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
			{/* <div className="casanet-credit">
				<Paper className="casanet-credit-paper" elevation={3} onClick={() => window.open(DASHBOARD_REPO_URL, '_blank')}>
					<div className="casanet-credit-container">
						<GitHub />
						<Typography className="casanet-credit-text" variant="body2" >{t('global.powered.by.casanet')}</Typography>
					</div>
				</Paper>
			</div> */}
		</div>
	</div>
}