import { Button, Grid, IconButton, InputAdornment, useTheme } from "@material-ui/core";
import { DEFAULT_FONT_RATION, PASSWORD_MIN_LENGTH } from "../../infrastructure/consts";
import { inputColor } from "../../logic/common/themeUtils";
import { useTranslation } from "react-i18next";
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import PasswordIcon from '@mui/icons-material/Password';
import Collapse from '@mui/material/Collapse';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { handleServerRestError } from "../../services/notifications.service";
import { ApiFacade } from "../../infrastructure/generated/proxies/api-proxies";
import { ProfileItemProps } from "../../pages/dashboard-pages/Profile";
import { useState } from "react";

export function ProfileOverridePass(props: ProfileItemProps) {
	const { t } = useTranslation();
	const theme = useTheme();
	const [password, setPassword] = useState<string>('');
	const [saving, setSaving] = useState<boolean>(false);
	const [showPasswordInputMode, setShowPasswordInputMode] = useState<boolean>(false);
	const [showPassword, setShowPassword] = useState<boolean>(false);

	function handleMouseDownInput(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();
	};

	async function savePassword() {
		setSaving(true);
		try {
			await ApiFacade.UsersApi.setUser({ ...props.profile, password }, props.profile.email);
			// Once password successfully changed, mark ChangeRequired as off
			props.setProfile({ ...props.profile, passwordChangeRequired: false });
		} catch (error) {
			await handleServerRestError(error);
		}
		setSaving(false);
		// Reset components states
		setShowPasswordInputMode(false);
		setShowPassword(false);
		setPassword('');
	}

	return <Grid
		container
		direction="column"
		justifyContent="center"
		alignItems="stretch"
	>
		<div>
			<LoadingButton
				style={{ width: '100%', color: inputColor(theme) }}
				loading={saving}
				loadingPosition={'start'}
				disabled={saving || showPasswordInputMode}
				variant="contained"
				color={'inherit'}
				endIcon={<PasswordIcon />}
				onClick={() => {
					setShowPasswordInputMode(true);
					setPassword('');
				}}>
				<div style={{ width: '100%' }}>
					{t('dashboard.profile.override.pass.set.new.password')}
				</div>
			</LoadingButton>
		</div>
		<div>
			<Collapse in={showPasswordInputMode}>
				<Grid
					container
					direction="column"
					justifyContent="center"
					alignItems="stretch"
				>
					{/* THIS IS AN UGLY WORK-AROUND!!!!!!!!!
					Google chrome assume that if there is a 'password' input there is also 'username' input, 
					so they decided that the scope select input will be the best option 😳
					The following hidden inputs use as a bait to capture the Google suggestion, same as any lightning rod :) */}
					<div style={{ maxHeight: 0, overflowY: 'hidden'}}>
						<input type="text" />
						<input type="password" />
					</div>
					<div style={{ height: DEFAULT_FONT_RATION * 2.5, marginTop: DEFAULT_FONT_RATION * 0.7 }}>
						<TextField
							style={{ width: `100%` }}
							disabled={saving}
							variant="standard"
							type={showPassword ? 'text' : 'password'}
							value={password}
							placeholder={t('dashboard.profile.override.pass.new.password.placeholder')}
							helperText={t('dashboard.profile.override.pass.new.password.help', { length: PASSWORD_MIN_LENGTH })}
							onChange={(e) => {
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
					</div>
					<Grid
						style={{ marginTop: DEFAULT_FONT_RATION * 0.7 }}
						container
						direction="row"
						justifyContent="space-between"
						alignItems="flex-end"
					>
						<Button disabled={saving} variant="contained" onClick={() => setShowPasswordInputMode(false)}>{t('global.cancel')}</Button>
						<LoadingButton
							style={{ minWidth: 200 }}
							loading={saving}
							loadingPosition={'start'}
							disabled={!password || password.length < PASSWORD_MIN_LENGTH}
							variant="contained"
							color={'primary'}
							onClick={savePassword}>
							{t('dashboard.profile.override.pass.set.password')}
						</LoadingButton>
					</Grid>
				</Grid>
			</Collapse>
		</div>
	</Grid>;
}