import { CircularProgress, Grid, IconButton, Typography, useTheme } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { DEFAULT_FONT_RATION } from "../../../infrastructure/consts";
import { livelinessFeed, livelinessFlag } from "../../../services/settings.service";
import { useEffect, useState } from "react";
import { RemoteConnectionStatus } from "../../../infrastructure/generated/api";
import Collapse from '@mui/material/Collapse';
import { ThemeTooltip } from "../../global/ThemeTooltip";
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { getModeColor } from "../../../logic/common/themeUtils";
import { ApiFacade } from "../../../infrastructure/generated/proxies/api-proxies";
import { handleServerRestError } from "../../../services/notifications.service";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { AlertDialog } from "../../AlertDialog";
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { TitleButtonContent } from "../../global/TitleButtonContent";


export function ShowRegisteredUsers() {
	const { t } = useTranslation();
	const theme = useTheme();
	const [remoteConnection, setRemoteConnection] = useState<RemoteConnectionStatus>(livelinessFlag.remoteConnection);

	const [fetchingRegisteredUsers, setFetchingRegisteredUsers] = useState<boolean>();
	const [registeredUsers, setRegisteredUsers] = useState<string[]>();

	const [unregisteredUserCandidate, setUnregisteredUserCandidate] = useState<string>('');
	const [unregistering, setUnregistering] = useState<string>('');
	const [openUnregisteredUserAlert, setOpenUnregisteredUserAlert] = useState<boolean>(false);

	useEffect(() => {
		let livelinessDetacher: () => void;

		(async () => {
			// Subscribe to the liveliness feed
			livelinessDetacher = livelinessFeed.attach((livelinessData) => {
				setRemoteConnection(livelinessData.remoteConnection);
			});

		})();

		return () => {
			// unsubscribe the feed on component unmount
			livelinessDetacher && livelinessDetacher();
		};
	}, []);

	async function fetchRegisteredUsers() {
		setFetchingRegisteredUsers(true);
		try {
			const registeredUsers = await ApiFacade.UsersApi.getRegisteredUsers();
			setRegisteredUsers(registeredUsers);
		} catch (error) {
			await handleServerRestError(error);
		}
		setFetchingRegisteredUsers(false);
	}

	async function unregisterCandidateUser() {
		setUnregistering(unregisteredUserCandidate);
		try {
			await ApiFacade.UsersApi.removeUserForwarding(unregisteredUserCandidate);
			setRegisteredUsers(registeredUsers?.filter(u => u !== unregisteredUserCandidate));
		} catch (error) {
			await handleServerRestError(error);
		}
		setUnregistering('');
	}

	function toggleRegisteredUsersVisibility() {
		if (registeredUsers) {
			setRegisteredUsers(undefined);
		} else {
			fetchRegisteredUsers();
		}
	}

	return <div style={{ width: '100%' }} >
		<AlertDialog
			open={openUnregisteredUserAlert}
			cancelText={t('global.cancel')}
			submitText={t('dashboard.settings.connectivity.show.registered.unregister')}
			title={t('dashboard.settings.connectivity.show.registered.unregister.alert.title', { user: unregisteredUserCandidate })}
			text={t('dashboard.settings.connectivity.show.registered.unregister.alert.text', { user: unregisteredUserCandidate })}
			onCancel={() => setOpenUnregisteredUserAlert(false)}
			onSubmit={() => { setOpenUnregisteredUserAlert(false); unregisterCandidateUser(); }}
			submitColor={'error'}
		/>
		<TitleButtonContent
			title={t('dashboard.settings.connectivity.show.registered.users')}
			tip={t('dashboard.settings.connectivity.show.registered.users.tip')}
			button={<ThemeTooltip title={<span>{t(`dashboard.settings.connectivity.show.registered.${!!registeredUsers ? 'hide' : 'show'}.users`)}</span>}>
				<IconButton
					disabled={remoteConnection !== RemoteConnectionStatus.ConnectionOK || fetchingRegisteredUsers}
					onClick={toggleRegisteredUsersVisibility}
					color="inherit"
				>
					{/* In case of fetching, show loader icon */}
					{fetchingRegisteredUsers && <MoreHorizIcon style={{ fontSize: DEFAULT_FONT_RATION, color: getModeColor(false, theme) }} />}
					{(!fetchingRegisteredUsers && !registeredUsers) && <VisibilityIcon style={{ fontSize: DEFAULT_FONT_RATION }} />}
					{(!fetchingRegisteredUsers && registeredUsers) && <VisibilityOffIcon style={{ fontSize: DEFAULT_FONT_RATION }} />}
				</IconButton>
			</ThemeTooltip>}
		>
			<Collapse in={!!registeredUsers}>
				<div style={{ margin: DEFAULT_FONT_RATION * 0.7 }}>
					{registeredUsers?.map(user => <Grid
						container
						direction="row"
						justifyContent="flex-start"
						alignItems="center"
					>
						<div>
							<ThemeTooltip title={<span>{t(`dashboard.settings.connectivity.show.registered.unregister.user`, { user })}</span>}>
								<IconButton
									disabled={!!unregistering}
									onClick={() => { setUnregisteredUserCandidate(user); setOpenUnregisteredUserAlert(true); }}
									color="inherit"
								>
									{unregistering !== user && <RemoveCircleIcon style={{ fontSize: DEFAULT_FONT_RATION * 0.9 }} />}
									{unregistering === user && <CircularProgress size={DEFAULT_FONT_RATION * 0.8} thickness={10} />}
								</IconButton>
							</ThemeTooltip>
						</div>
						<div><Typography style={{ fontSize: DEFAULT_FONT_RATION * 0.8 }}>{user}</Typography></div>
					</Grid>
					)}
				</div>
			</Collapse>
		</TitleButtonContent>
	</div>;
}
