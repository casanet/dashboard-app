import { Button, Grid, IconButton, InputAdornment, TextField } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { DEFAULT_FONT_RATION, REMOTE_SERVER_AUTH_KEY_LENGTH } from "../../../infrastructure/consts";
import { remoteURLService } from "../../../services/settings.service";
import { useEffect, useState } from "react";
import Collapse from '@mui/material/Collapse';
import { ThemeTooltip } from "../../global/ThemeTooltip";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import LoadingButton from '@mui/lab/LoadingButton';
import { TitleButtonContent } from "../../layouts/TitleButtonContent";
import { isValidUrl } from "../../../infrastructure/utils";
import { handleServerRestError } from "../../../services/notifications.service";
import { livelinessCheck } from "../../../services/liveliness.service";
import { ApiFacade } from "../../../infrastructure/generated/api/swagger/api";

export function EditRemoteConnection() {
	const { t } = useTranslation();

	const [remoteURL, setRemoteURL] = useState<string>('');

	const [showEditRemote, setShowEditRemote] = useState<boolean>();
	const [settingRemote, setSettingRemote] = useState<boolean>();

	const [editRemoteURL, setEditRemoteURL] = useState<string>('');
	const [editRemoteURLError, setEditRemoteURLError] = useState<boolean>();

	const [remoteKey, setRemoteKey] = useState<string>('');
	const [remoteKeyError, setRemoteKeyError] = useState<boolean>();

	const [showRemoteKey, setShowRemoteKey] = useState<boolean>(false);

	useEffect(() => {
		(async () => {
			try {
				const remoteURL = await remoteURLService.getData();
				setRemoteURL(remoteURL);
			} catch (error) {
				// Do nothing
			}
		})();
	}, []);

	function handleMouseDownInput(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();
	};

	function verifyRemoteSettings(): boolean {
		let isValid = true;
		if (!editRemoteURL || !isValidUrl(editRemoteURL, 'ws')) {
			isValid = false;
			setEditRemoteURLError(true);
		}

		if (!remoteKey || remoteKey.length < REMOTE_SERVER_AUTH_KEY_LENGTH) {
			isValid = false;
			setRemoteKeyError(true);
		}

		return isValid;
	}

	async function saveRemoteServer() {
		if (!verifyRemoteSettings()) {
			return;
		}

		setSettingRemote(true);
		try {
			await ApiFacade.RemoteApi.setRemoteSettings({
				host: editRemoteURL,
				connectionKey: remoteKey,
			});
			// Once remote server set, "refresh" the known remote URL and the liveliness (that sampling the remote status) 
			const remoteURL = await remoteURLService.forceFetchData();
			setRemoteURL(remoteURL);
			await livelinessCheck();
		} catch (error) {
			await handleServerRestError(error);
		}
		setSettingRemote(false);
		toggleShowEditRemoteView();
	}

	function toggleShowEditRemoteView() {
		setShowEditRemote(!showEditRemote);

		// Reset all remote props on toggling
		setEditRemoteURL(remoteURL);
		setRemoteKey('');
		setEditRemoteURLError(false);
		setRemoteKeyError(false);
	}

	return <TitleButtonContent
		title={t('dashboard.settings.connectivity.edit.connection')}
		tip={t('dashboard.settings.connectivity.edit.connection.tip')}
		button={<ThemeTooltip title={<span>{t(`dashboard.settings.connectivity.edit.connection.button`)}</span>}>
			<IconButton
				disabled={settingRemote}
				onClick={toggleShowEditRemoteView}
				color="inherit"
			>
				{(!showEditRemote) && <EditIcon style={{ fontSize: DEFAULT_FONT_RATION }} />}
				{(showEditRemote) && <CloseIcon style={{ fontSize: DEFAULT_FONT_RATION }} />}
			</IconButton>
		</ThemeTooltip>}
	>
		<div>
			<Collapse in={showEditRemote}>
				<Grid
					container
					direction="column"
					justifyContent="space-between"
					alignItems="stretch"
				>
					<div style={{ margin: DEFAULT_FONT_RATION * 0.7 }}>
						<TextField
							style={{ width: `100%` }}
							disabled={settingRemote}
							error={editRemoteURLError}
							variant="standard"
							value={editRemoteURL}
							placeholder={t('dashboard.settings.connectivity.edit.remote.url.placeholder')}
							helperText={t('dashboard.settings.connectivity.edit.remote.url.helper')}
							onChange={(e) => {
								setEditRemoteURLError(false);
								setEditRemoteURL(e.target.value);
							}}
						/>
					</div>
					<div style={{ margin: DEFAULT_FONT_RATION * 0.7, marginTop: DEFAULT_FONT_RATION * 0.1 }}>
						<TextField
							style={{ width: `100%` }}
							disabled={settingRemote}
							error={remoteKeyError}
							variant="standard"
							type={showRemoteKey ? 'text' : 'password'}
							value={remoteKey}
							// Disable browser password suggestions
							autoComplete={'new-password'}
							placeholder={t('dashboard.settings.connectivity.edit.remote.key.placeholder')}
							helperText={t('dashboard.settings.connectivity.edit.remote.key.helper', { length: REMOTE_SERVER_AUTH_KEY_LENGTH })}
							onChange={(e) => {
								setRemoteKeyError(false);
								setRemoteKey(e.target.value);
							}}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											onClick={() => { setShowRemoteKey(!showRemoteKey); }}
											onMouseDown={handleMouseDownInput}
											edge="end"
										>
											{showRemoteKey ? <VisibilityIcon /> : <VisibilityOffIcon />}
										</IconButton>
									</InputAdornment>
								)
							}}
						/>
					</div>
					<div style={{ marginLeft: DEFAULT_FONT_RATION * 0.7, marginRight: DEFAULT_FONT_RATION * 0.7 }}>
						<Grid
							container
							direction="row"
							justifyContent="space-between"
							alignItems="flex-end"
						>
							<Button disabled={settingRemote} variant="contained" onClick={toggleShowEditRemoteView}>{t('global.cancel')}</Button>
							<LoadingButton
								style={{ minWidth: '35%' }}
								loading={settingRemote}
								disabled={settingRemote}
								loadingPosition={'center'}
								variant="contained"
								color={'primary'}
								onClick={saveRemoteServer}>
								{t('global.save')}
							</LoadingButton>
						</Grid>
					</div>
				</Grid>
			</Collapse>
		</div>
	</TitleButtonContent>;
}
