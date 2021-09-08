
import { Button, Grid, Paper, TextField, Typography, LinearProgress, Link } from '@material-ui/core';
import '../theme/styles/login.scss';
import casanetLogo from '../static/logo-app.png';
import { Trans, useTranslation } from 'react-i18next';
import { useState } from 'react';
import isEmail from "isemail";
import { GitHub } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';

function LoginForm() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState<boolean>();
	const [mfaMode, setMfaMode] = useState<boolean>();
	const [emailError, setEmailError] = useState<boolean>(false);
	const [passwordError, setPasswordError] = useState<boolean>(false);
	const [mfaError, setMfaError] = useState<boolean>(false);
	const [email, setEmail] = useState<string>();
	const [password, setPassword] = useState<string>();
	const [mfa, setMfa] = useState<string>();
	const history = useHistory();

	function submit() {
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
		if (mfaMode) {
			setLoading(true);

			setTimeout(() => {
				history.push('/dashboard');
			}, 3000)
		} else {
			setMfaMode(true);
		}
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
						Welcome to the <Link onClick={() => window.open('https://github.com/casanet/casanet-server', '_blank')}>casanet</Link> IoT dashboard
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
					required
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
				<TextField
					disabled={loading}
					error={passwordError}
					className="login-form-input-item"
					required
					id="outlined-password-input"
					label={t('login.password')}
					type="password"
					autoComplete="current-password"
					variant="outlined"
					value={password}
					onChange={(e) => {
						setPassword(e.target.value);
					}}
				/>
			</Grid>}
		</div>
		<div className="login-form-submit">
			{loading
				? <LinearProgress />
				: <Button onClick={submit} style={{ width: '100%' }} variant="contained" color="primary" >
					{t('login.sign.in').toUpperCase()}
				</Button>}
		</div>
		<div className="login-form-footer">
			<Typography variant="body2" onClick={() => window.open('https://www.freepik.com/vectors/background', '_blank')}>
				<Trans i18nKey="login.background.credit.message" values={{ url: 'www.freepik.com' }}>
					Background from  www.freepik.com
				</Trans>
			</Typography>
			<Typography variant="body2" onClick={() => window.open('https://github.com/casanet', '_blank')}>
				{t('general.copyright.message', { year: new Date().getFullYear() })}
			</Typography>
		</div>
	</div >
}


export default function Login() {
	const { t } = useTranslation();

	return <div id="login-container-item" className="login-container">
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
				</Paper>
			</Grid>
			<div className="casanet-credit">
				<Paper className="casanet-credit-paper" elevation={3} onClick={() => window.open('https://github.com/casanet/casanet-server', '_blank')}>
					<div className="casanet-credit-container">
						<GitHub />
						<Typography className="casanet-credit-text" variant="body2" >{t('global.powered.by.casanet')}</Typography>
					</div>
				</Paper>
			</div>
		</div>
	</div>
}