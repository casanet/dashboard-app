import { Button, Grid, Theme, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { RemoteConnectionStatus, User } from '../../infrastructure/generated/api';
import { useEffect, useMemo, useState } from 'react';
import { handleServerRestError } from '../../services/notifications.service';
import { Loader } from '../../components/Loader';
import { useTranslation } from 'react-i18next';
import { DEFAULT_FONT_RATION } from '../../infrastructure/consts';
import { NoContent } from '../../components/NoContent';
import { usersService, remoteRegisteredUsersService, profileService } from '../../services/users.service';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import { NoPermissions } from '../../components/NoPermissions';
import { sessionManager } from '../../infrastructure/session-manager';
import { useHistory, useParams } from 'react-router-dom';
import PermIdentityOutlined from '@material-ui/icons/PermIdentityOutlined';
import { marginRight } from '../../logic/common/themeUtils';
import BlockIcon from '@mui/icons-material/Block';
import { ProfileName } from '../../components/profile/ProfileName';
import { ProfileScope } from '../../components/profile/ProfileScope';
import { ProfileRevokeSession } from '../../components/profile/ProfileRevokeSession';
import { ProfileOverridePass } from '../../components/profile/ProfileOverridePass';
import { ProfileRemoteAccess } from '../../components/profile/ProfileRemoteAccess';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { ProfileTFA } from '../../components/profile/ProfileTFA';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useData } from '../../hooks/useData';
import { useLiveliness } from '../../hooks/useLiveliness';
import { ThemeTooltip } from '../../components/global/ThemeTooltip';

export interface ProfileItemProps {
	profile: User;
	setProfile: (profile: User) => void;
}

export default function Profile() {

	const { t } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const history = useHistory();
	const theme = useTheme();

	const veryWideDesktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
	const wideDesktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

	const { remoteConnection } = useLiveliness();
	const [remoteRegisteredUsers] = useData(remoteRegisteredUsersService, [], { skipErrorToastOnFailure: true });

	const [loading, setLoading] = useState<boolean>(true);
	const [profile, setProfile] = useState<User>();

	const BackIcon = useMemo(() => theme.direction === 'ltr' ? ArrowBackIcon : ArrowForwardIcon, [theme.direction]);

	useEffect(() => {
		setLoading(true);
		(async () => {
			try {
				let profile: User | undefined;
				if (!id) {
					// Dont relay on the local storage in case of change in other dashboard instance
					profile = await profileService.getData();
				} else if (sessionManager.isAdmin) {
					const users = await usersService.getData();
					profile = users.find(u => u.email === id);
				}
				setProfile(profile);
			} catch (error) {
				await handleServerRestError(error);
			}
			setLoading(false);
		})();
	}, [id]);

	async function onProfileUpdate(profile: User) {
		// Set the update profile ("clone" it to make sure state update)
		setProfile({ ...profile });
		// During the change reset users data, if exists.
		usersService.reset();
		if (id) {
			// If editing other user profile, after resetting users service do nothing
			return;
		}
		try {
			// Force refetch updated profile 
			await profileService.forceFetchData();
		} catch (error) {
			// Do nothing
		}
	}

	function goBack() {
		history.goBack();
	}

	// non admin is allowed to see self profile only
	if (id && !sessionManager.isAdmin) {
		return <NoPermissions />
	}

	if (loading) {
		return <Loader />;
	}

	// If there are no any profile, show proper message
	if (!profile) {
		return <NoContent Icon={PermIdentityOutlined} message={t(`dashboard.profile.no.profile.exists`, { email: id })} />
	}


	const propsWidth = desktopMode ? (DEFAULT_FONT_RATION * 15) : '100%';
	const propsFontSize = DEFAULT_FONT_RATION * 1.2;

	const remoteConnectionOK = remoteConnection === RemoteConnectionStatus.ConnectionOK;

	return <div style={{ width: '100%', height: '100%' }}>
		<div style={{
			padding: DEFAULT_FONT_RATION * 1.5,
			paddingTop: DEFAULT_FONT_RATION * 0.75,
			paddingBottom: DEFAULT_FONT_RATION * 0.75,
			width: '100%',
			height: DEFAULT_FONT_RATION,
			marginBottom: DEFAULT_FONT_RATION * 2
		}}>
			<Button onClick={goBack} variant="outlined" startIcon={<BackIcon />}>
				{t('global.back')}
			</Button>
		</div>
		<div style={{
			padding: DEFAULT_FONT_RATION * 1.5,
			paddingTop: DEFAULT_FONT_RATION * 0.75,
			paddingBottom: 0,
			overflowX: 'hidden', overflowY: 'auto',
			height: `calc(100% - ${DEFAULT_FONT_RATION * 4}px)`, maxHeight: `calc(100% - ${DEFAULT_FONT_RATION * 4}px)`
		}}>
			<div style={{
				padding: DEFAULT_FONT_RATION * (veryWideDesktopMode ? 2 : wideDesktopMode ? 1 : 0),
				paddingRight: 0,
				paddingBottom: 0,
			}}>
				<div style={{ width: '100%' }}>
					<Grid
						style={{ width: '100%' }}
						container
						direction={wideDesktopMode ? 'row' : 'column'}
						justifyContent={wideDesktopMode ? 'space-between' : 'flex-start'}
						alignItems={wideDesktopMode ? 'center' : 'flex-start'}
					>
						<div>
							<ProfileName profile={profile} setProfile={onProfileUpdate} />
						</div>
						<div style={{ marginTop: DEFAULT_FONT_RATION }}>
							<Grid
								style={{ width: '100%' }}
								container
								direction="column"
								justifyContent="flex-end"
								alignItems="center"
							>
								<div style={{ width: '100%', marginBottom: DEFAULT_FONT_RATION }}>
									<Grid
										style={{ width: '100%' }}
										container
										direction="row"
										justifyContent="space-between"
										alignItems="center"
									>
										<div>
											<Typography style={{ fontSize: DEFAULT_FONT_RATION * 1.2, color: theme.palette.text.disabled, marginBottom: 0 }} >
												{t('dashboard.users.user.2fa')}
											</Typography>
										</div>
										<div>
											<ProfileTFA profile={profile} setProfile={onProfileUpdate} />
										</div>
									</Grid>
								</div>
								<div>
									<Typography style={{ fontSize: DEFAULT_FONT_RATION * 0.9, color: theme.palette.text.disabled, marginBottom: 0 }} >
										{t('dashboard.users.user.scope')}
									</Typography>
									<ProfileScope profile={profile} setProfile={onProfileUpdate} />
								</div>
							</Grid>
						</div>
					</Grid>
				</div>
				{/* The seconds row, the controls buttons */}
				<div style={{ marginTop: veryWideDesktopMode ? '10vh' : '2vh' }}>
					<Grid
						container
						direction="row"
						justifyContent="space-between"
						alignItems="flex-start"
					>
						<div style={{ width: propsWidth, marginTop: DEFAULT_FONT_RATION * 2, [marginRight(theme)]: !desktopMode ? 0 : DEFAULT_FONT_RATION * 6 }}>
							<Typography style={{ fontSize: propsFontSize, color: theme.palette.text.disabled, marginBottom: DEFAULT_FONT_RATION }} >
								{t('dashboard.profile.revoke.session')}
							</Typography>
							<ProfileRevokeSession profile={profile} setProfile={onProfileUpdate} />
						</div>
						<div style={{ width: propsWidth, marginTop: DEFAULT_FONT_RATION * 2, [marginRight(theme)]: !desktopMode ? 0 : DEFAULT_FONT_RATION * 6 }}>
							<Grid
								style={{ width: '100%', marginBottom: DEFAULT_FONT_RATION }}
								container
								direction="row"
								justifyContent="space-between"
								alignItems="center"
							>
								<div>
									<Typography style={{ fontSize: propsFontSize, color: theme.palette.text.disabled }} >
										{t('dashboard.profile.set.new.password')}
									</Typography>
								</div>
								<div>
									<ThemeTooltip title={<span>{t('dashboard.profile.set.new.password.required')}</span>}>
										<div>
											{profile.passwordChangeRequired && <WarningAmberIcon fontSize="medium" color="error" />}
										</div>
									</ThemeTooltip>
								</div>
							</Grid>
							<ProfileOverridePass profile={profile} setProfile={onProfileUpdate} />
						</div>
						<div style={{ width: propsWidth, marginTop: DEFAULT_FONT_RATION * 2 }}>
							<Grid
								style={{ width: '100%', marginBottom: DEFAULT_FONT_RATION }}
								container
								direction="row"
								justifyContent="space-between"
								alignItems="center"
							>
								<div>
									<Typography style={{ fontSize: propsFontSize, color: theme.palette.text.disabled }} >{t('dashboard.profile.remote.access')}</Typography>
								</div>
								<div>
									<ThemeTooltip title={<span>{t(!remoteConnectionOK
										? `dashboard.users.remote.access.status.no.connection`
										: remoteRegisteredUsers?.includes(profile.email)
											? 'dashboard.users.remote.access.status.registered'
											: 'dashboard.users.remote.access.status.unregistered')}</span>}>
										<div>
											{!remoteConnectionOK && <CloudOffIcon fontSize="medium" />}
											{remoteConnectionOK && remoteRegisteredUsers?.includes(profile.email) && <CloudDoneIcon fontSize="medium" />}
											{remoteConnectionOK && !remoteRegisteredUsers?.includes(profile.email) && <BlockIcon fontSize="medium" />}
										</div>
									</ThemeTooltip>
								</div>
							</Grid>
							<ProfileRemoteAccess profile={profile} remoteRegisteredUsers={remoteRegisteredUsers} />
						</div>
					</Grid>
				</div>
			</div>
		</div>
	</div>;
}
