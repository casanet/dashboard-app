import { Button, Grid, IconButton, InputAdornment, useTheme } from "@material-ui/core";
import { DEFAULT_FONT_RATION } from "../../infrastructure/consts";
import { inputColor } from "../../logic/common/themeUtils";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import Collapse from '@mui/material/Collapse';
import { handleServerRestError } from "../../services/notifications.service";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { remoteRegisteredUsersService } from "../../services/users.service";
import { AlertDialog } from "../AlertDialog";
import { useLiveliness } from "../../hooks/useLiveliness";
import { ApiFacade, RemoteConnectionStatus, User } from "../../infrastructure/generated/api/swagger/api";

interface ProfileRemoteAccessProps {
	profile: User;
	remoteRegisteredUsers: string[] | undefined;
}

export function ProfileRemoteAccess(props: ProfileRemoteAccessProps) {
	const { t } = useTranslation();
	const theme = useTheme();
	const { remoteConnection } = useLiveliness();

	const [loading, setLoading] = useState<boolean>(false);
	const [prepareSendMode, setPrepareSendMode] = useState<boolean>(false);
	const [waitForCodeMode, setWaitForCodeMode] = useState<boolean>(false);
	const [authCode, setAuthCode] = useState<string>('');
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [openUnregisterAlert, setOpenUnregisterAlert] = useState<boolean>(false);

	/**
	 * Request authentication code for user from the remote server
	 */
	async function requestAuthCode() {
		setLoading(true);
		try {
			await ApiFacade.UsersApi.requestUserForwarding(props.profile.email);
			// Once it's succeed move to the "type your code" view.
			setPrepareSendMode(false);
			setWaitForCodeMode(true);
			// Reset auth code.
			setAuthCode('');
		} catch (error) {
			await handleServerRestError(error);
		}
		setLoading(false);
	}

	/**
	 * Register user to the remote server by the authentication code
	 */
	async function registerUser() {
		setLoading(true);
		try {
			await ApiFacade.UsersApi.requestUserForwardingAuth(props.profile.email, { code: authCode });
			// Once it's succeed, refresh registered users list
			await remoteRegisteredUsersService.forceFetchData();
			// Reset view
			setWaitForCodeMode(false);
			setAuthCode('');
		} catch (error) {
			await handleServerRestError(error);
		}
		setLoading(false);
	}

	async function unregisterUser() {
		setLoading(true);
		try {
			await ApiFacade.UsersApi.removeUserForwarding(props.profile.email);
			// Once it's succeed, refresh registered users list
			await remoteRegisteredUsersService.forceFetchData();
		} catch (error) {
			await handleServerRestError(error);
		}
		setLoading(false);
	}

	function handleMouseDownInput(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();
	};

	const { profile, remoteRegisteredUsers } = props;
	const connectionOK = remoteConnection === RemoteConnectionStatus.ConnectionOk;

	return <div style={{ width: '100%' }}>
		<AlertDialog
			open={openUnregisterAlert}
			cancelText={t('global.cancel')}
			submitText={t('dashboard.profile.remote.access.unregister')}
			title={t('dashboard.profile.remote.access.unregister.alert.title', { name: props.profile.displayName })}
			text={t('dashboard.profile.remote.access.unregister.alert.text', { name: props.profile.displayName })}
			onCancel={() => setOpenUnregisterAlert(false)}
			onSubmit={() => { setOpenUnregisterAlert(false); unregisterUser(); }}
			submitColor={'error'}
		/>
		<div>
			{!connectionOK && <LoadingButton
				style={{ width: '100%', color: inputColor(theme) }}
				loading={loading}
				loadingPosition={'start'}
				disabled={true}
				variant="contained"
				color={'inherit'}
				endIcon={<CloudOffIcon />}
				onClick={() => { }}>
				<div style={{ width: '100%' }}>
					{t('dashboard.profile.remote.access.no.remote.connection')}
				</div>
			</LoadingButton>}
			{connectionOK && remoteRegisteredUsers?.includes(profile.email) && <LoadingButton
				style={{ width: '100%', color: inputColor(theme) }}
				loading={loading}
				loadingPosition={'start'}
				disabled={false}
				variant="contained"
				color={'inherit'}
				endIcon={<CloudOffIcon />}
				onClick={() => setOpenUnregisterAlert(true)}>
				<div style={{ width: '100%' }}>
					{t('dashboard.profile.remote.access.unregister.button')}
				</div>
			</LoadingButton>}
			{connectionOK && !remoteRegisteredUsers?.includes(profile.email) && <LoadingButton
				style={{ width: '100%', color: inputColor(theme) }}
				loading={loading}
				loadingPosition={'start'}
				disabled={false}
				variant="contained"
				color={'inherit'}
				endIcon={<CloudUploadIcon />}
				onClick={() => setPrepareSendMode(true)}>
				<div style={{ width: '100%' }}>
					{t('dashboard.profile.remote.access.register.button')}
				</div>
			</LoadingButton>}
		</div>
		<div>
			<Collapse in={prepareSendMode}>
				<Grid
					container
					direction="column"
					justifyContent="center"
					alignItems="stretch"
				>
					<div style={{ height: DEFAULT_FONT_RATION * 2.5, marginTop: DEFAULT_FONT_RATION * 0.7 }}>
						{t('dashboard.profile.remote.access.request.auth.code.text')}
					</div>
					<Grid
						style={{ marginTop: DEFAULT_FONT_RATION * 0.7 }}
						container
						direction="row"
						justifyContent="space-between"
						alignItems="flex-end"
					>
						<Button disabled={loading} variant="contained" onClick={() => setPrepareSendMode(false)}>{t('global.cancel')}</Button>
						<LoadingButton
							style={{ minWidth: 200 }}
							loading={loading}
							loadingPosition={'start'}
							variant="contained"
							color={'primary'}
							onClick={requestAuthCode}>
							{t('dashboard.profile.remote.access.request.auth.code')}
						</LoadingButton>
					</Grid>
				</Grid>
			</Collapse>
		</div>
		<div>
			<Collapse in={waitForCodeMode}>
				<Grid
					container
					direction="column"
					justifyContent="center"
					alignItems="stretch"
				>
					<div style={{ height: DEFAULT_FONT_RATION * 2.5, marginTop: DEFAULT_FONT_RATION * 0.7 }}>
						<TextField
							style={{ width: `100%` }}
							disabled={loading}
							variant="standard"
							type={'text'}
							value={authCode}
							placeholder={t('dashboard.profile.remote.access.auth.code')}
							onChange={(e) => {
								setAuthCode(e.target.value);
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
					</div>
					<Grid
						style={{ marginTop: DEFAULT_FONT_RATION * 0.7 }}
						container
						direction="row"
						justifyContent="space-between"
						alignItems="flex-end"
					>
						<Button disabled={loading} variant="contained" onClick={() => setWaitForCodeMode(false)}>{t('global.cancel')}</Button>
						<LoadingButton
							style={{ minWidth: 200 }}
							disabled={!authCode}
							loading={loading}
							loadingPosition={'start'}
							variant="contained"
							color={'primary'}
							onClick={registerUser}>
							{t('dashboard.profile.remote.access.register')}
						</LoadingButton>
					</Grid>
				</Grid>
			</Collapse>
		</div>
	</div>;
}
