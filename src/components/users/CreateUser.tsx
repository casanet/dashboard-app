import { Button, Grid, IconButton, InputAdornment, TextField, useTheme } from "@material-ui/core";
import { AuthScopes } from "../../infrastructure/generated/api";
import { useHistory } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { DashboardRoutes, PASSWORD_MIN_LENGTH, SERVER_REPO_URL, SIDE_CONTAINER_DEFAULT_FONT_SIZE } from "../../infrastructure/consts";
import { useState } from "react";
import { ApiFacade } from "../../infrastructure/generated/proxies/api-proxies";
import { handleServerRestError } from "../../services/notifications.service";
import Typography from '@mui/material/Typography';
import useMediaQuery from "@mui/material/useMediaQuery";
import { Theme } from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import Autocomplete from '@mui/material/Autocomplete';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Link from '@mui/material/Link';
import { usersService } from "../../services/users.service";
import { useData } from "../../hooks/useData";
import isEmail from 'isemail';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { mapAuthScopeToDisplay } from "../../logic/common/usersUtils";
import { ThemeSwitch } from "../global/ThemeSwitch";

const DEFAULT_FONT_SIZE = SIDE_CONTAINER_DEFAULT_FONT_SIZE;

interface CreateUserInputProps {
	children: JSX.Element;
	text: string;
	disabled?: boolean;
	optional?: boolean;
}

function CreateUserInput(props: CreateUserInputProps) {
	const theme = useTheme();

	return <div style={{ width: '100%' }}>
		<Grid
			style={{ width: '100%' }}
			container
			direction="row"
			justifyContent="space-between"
			alignItems="center"
		>
			<div style={{ color: props.disabled ? theme.palette.text.hint : undefined }}>{props.text}{!props.disabled && !props.optional && '*'}</div>
			<div style={{ width: '75%' }} >{props.children}</div>
		</Grid>
	</div>;
}

export function CreateUser() {
	const { t } = useTranslation();
	const history = useHistory();
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

	const [users] = useData(usersService, [], { skipErrorToastOnFailure: true });

	const [creating, setCreating] = useState<boolean>();

	const [name, setName] = useState<string>();
	const [nameError, setNameError] = useState<boolean>();

	const [email, setEmail] = useState<string>();
	const [emailError, setEmailError] = useState<boolean>();
	const [emailExistsError, setEmailExistsError] = useState<boolean>();

	const [password, setPassword] = useState<string>();
	const [passwordError, setPasswordError] = useState<boolean>();
	const [passwordLengthError, setPasswordLengthError] = useState<boolean>();

	const [passwordVerify, setPasswordVerify] = useState<string>();
	const [passwordVerifyError, setPasswordVerifyError] = useState<boolean>();
	const [passwordNotMatchError, setPasswordNotMatchError] = useState<boolean>();

	const [scope, setScope] = useState<AuthScopes>();
	const [scopeError, setScopeError] = useState<boolean>();

	const [forceMfa, setForceMfa] = useState<boolean>(false);

	const [showPassword, setShowPassword] = useState<boolean>(false);

	function handleMouseDownInput(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();
	};

	/**
	 * Verify the user is ready for creation
	 * @returns True when ever all required fields are OK 
	 */
	function validateInputs(): boolean {
		let validated = true;

		if (!name) {
			validated = false;
			setNameError(true);
		}

		if (!email || !isEmail.validate(email)) {
			validated = false;
			setEmailError(true);
		} else if (users.some(u => u.email === email)) {
			validated = false;
			setEmailError(true);
			setEmailExistsError(true);
		}

		if (!password) {
			validated = false;
			setPasswordError(true);
		} else if (password.length < PASSWORD_MIN_LENGTH) {
			validated = false;
			setPasswordError(true);
			setPasswordLengthError(true);
		}

		if (!passwordVerify) {
			validated = false;
			setPasswordVerifyError(true);
		} else if (passwordVerify !== password) {
			validated = false;
			setPasswordVerifyError(true);
			setPasswordNotMatchError(true);
		}

		if (!scope) {
			validated = false;
			setScopeError(true);
		}

		return validated;
	}

	/**
	 * Create the new user
	 */
	async function createUser() {
		// If not ready, abort
		if (!validateInputs()) {
			return;
		}

		setCreating(true);

		// For lint only (the validateInputs passed)
		if (!email || !password || !scope) {
			return;
		}

		try {
			await ApiFacade.UsersApi.createUser({
				email,
				password,
				scope,
				displayName: name,
				ignoreTfa: !forceMfa,
			});
			await usersService.forceFetchData();
			// Once it's succeed, close create user view
			close();
		} catch (error) {
			handleServerRestError(error);
		}
		setCreating(false);
	}

	/** Close create user view  */
	function close() {
		history.push(DashboardRoutes.users.path);
	}

	// TODO: Rename class and scss file name
	return <div className="page-full-info-area">
		<Grid
			className={'page-full-info-container'}
			style={{ padding: DEFAULT_FONT_SIZE * 0.4 }}
			container
			direction="column"
			justifyContent="space-between"
			alignItems="stretch"
		>
			<div style={{ width: '100%', textAlign: 'center' }}>
				<Typography variant="h4" >{t('dashboard.users.create.new.user.name.title')}</Typography>
			</div>
			<div style={{ width: '100%', maxHeight: 'calc(100% - 100px)', overflowY: 'auto', overflowX: 'hidden' }}>
				<Grid
					style={{ width: '100%', height: '100%', minHeight: DEFAULT_FONT_SIZE * 8 }}
					container
					direction="column"
					justifyContent="space-evenly"
					alignItems="center"
				>
					<CreateUserInput text={t('dashboard.users.create.new.user.name')}>
						<TextField
							style={{ width: `100%` }}
							disabled={creating}
							error={nameError}
							variant="standard"
							value={name}
							placeholder={t('dashboard.users.create.new.user.name.placeholder')}
							onChange={(e) => {
								setNameError(false);
								setName(e.target.value);
							}}
						/>
					</CreateUserInput>
					<CreateUserInput text={t('dashboard.users.create.new.user.email')}>
						<TextField
							style={{ width: `100%` }}
							type="email"
							disabled={creating}
							error={emailError}
							variant="standard"
							value={email}
							helperText={emailExistsError ? t('dashboard.users.create.new.user.email.exist.help') : ''}
							placeholder={t('dashboard.users.create.new.user.email.placeholder')}
							onChange={(e) => {
								setEmailError(false);
								setEmailExistsError(false);
								setEmail(e.target.value);
							}}
						/>
					</CreateUserInput>
					<CreateUserInput text={t('dashboard.users.create.new.user.password')}>
						<TextField
							style={{ width: `100%` }}
							disabled={creating}
							variant="standard"
							type={showPassword ? 'text' : 'password'}
							value={password}
							error={passwordError}
							placeholder={t('dashboard.users.create.new.user.password.placeholder')}
							helperText={!passwordLengthError ? '' : t('dashboard.profile.override.pass.new.password.help', { length: PASSWORD_MIN_LENGTH })}
							onChange={(e) => {
								setPasswordError(false);
								setPasswordLengthError(false);
								setPassword(e.target.value);
							}}
							// Disable browser password suggestions
							autoComplete={'new-password'}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											onClick={() => { setShowPassword(!showPassword); }}
											onMouseDown={handleMouseDownInput}
											edge="end"
										>
											{showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
										</IconButton>
									</InputAdornment>
								)
							}}
						/>
					</CreateUserInput>
					<CreateUserInput text={t('dashboard.users.create.new.user.retype.password')}>
						<TextField
							style={{ width: `100%` }}
							disabled={creating}
							variant="standard"
							type={showPassword ? 'text' : 'password'}
							value={passwordVerify}
							error={passwordVerifyError}
							placeholder={t('dashboard.users.create.new.user.retype.password.placeholder')}
							helperText={!passwordNotMatchError ? '' : t('dashboard.users.create.new.user.retype.not.match.password.help')}
							onChange={(e) => {
								setPasswordVerifyError(false);
								setPasswordNotMatchError(false);
								setPasswordVerify(e.target.value);
							}}
							// Disable browser password suggestions
							autoComplete={'new-password'}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											onClick={() => { setShowPassword(!showPassword); }}
											onMouseDown={handleMouseDownInput}
											edge="end"
										>
											{showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
										</IconButton>
									</InputAdornment>
								)
							}}
						/>
					</CreateUserInput>
					<CreateUserInput text={t('dashboard.users.user.scope')}>
						<Autocomplete
							style={{ width: `100%` }}
							disabled={creating}
							multiple
							limitTags={1}
							options={[AuthScopes.AdminAuth, AuthScopes.UserAuth]}
							getOptionLabel={(option) => t(mapAuthScopeToDisplay[option])}
							value={scope ? [scope] : []}
							onChange={(e, o) => {
								// Take the newest scope (since only once selection at a time currently supported)
								const newScope = o[o.length - 1];
								setScopeError(false);
								setScope(newScope);
							}}
							renderInput={(params) => (
								<div>
									<TextField
										{...params}
										error={scopeError}
										variant="standard"
									/>
								</div>
							)}
						/>
					</CreateUserInput>
					<CreateUserInput text={t('dashboard.users.user.2fa')} optional>
						<ThemeSwitch
							disabled={creating}
							checked={forceMfa}
							onChange={() => setForceMfa(!forceMfa)}
							inputProps={{ 'aria-label': 'controlled' }}
						/>
					</CreateUserInput>
				</Grid>
			</div>
			<div style={{ marginBottom: DEFAULT_FONT_SIZE * 0.7 }}>
				<Grid
					style={{ width: `100%` }}
					container
					direction="row"
					justifyContent="space-around"
					alignItems="center"
				>
					<div>
						<HelpOutlineIcon />
					</div>
					<div style={{ width: `80%` }}>
						<Trans i18nKey="dashboard.users.create.new.user.info">
							For more information about the 2FA (multi-factor authentication) see
							<Link
								style={{ marginLeft: 3, marginRight: 3 }}
								target="_blank"
								href={`${SERVER_REPO_URL}/tree/development/backend#two-factor-authentication-2fa`}>
								casanet 2FA documentation
							</Link>
						</Trans>
					</div>
				</Grid>
			</div>
			<div style={{ width: '100%' }}>
				<Grid
					container
					direction="row"
					justifyContent="space-between"
					alignItems="flex-end"
				>
					<Button disabled={creating} variant="contained" onClick={close}>{t('global.cancel')}</Button>
					<LoadingButton
						style={{ minWidth: desktopMode ? 200 : 0 }}
						loading={creating}
						disabled={creating}
						loadingPosition={desktopMode ? 'start' : 'center'}
						variant="contained"
						color={'primary'}
						onClick={createUser}>
						{t('dashboard.users.create.new.user.creat.user')}
					</LoadingButton>
				</Grid>
			</div>
		</Grid>
	</div>;
}
