import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { CircularProgress, Grid, IconButton, Theme, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { AuthScopes, RemoteConnectionStatus, User } from '../../infrastructure/generated/api';
import { ComponentType, useEffect, useState } from 'react';
import { handleServerRestError } from '../../services/notifications.service';
import { Loader } from '../../components/Loader';
import { useTranslation } from 'react-i18next';
import { ThemeTooltip } from '../../components/global/ThemeTooltip';
import { CREATE_USER_PATH, DashboardRoutes, DEFAULT_FONT_RATION } from '../../infrastructure/consts';
import { ApiFacade } from '../../infrastructure/generated/proxies/api-proxies';
import { DashboardPageInjectProps } from '../Dashboard';
import { NoContent } from '../../components/NoContent';
import RouterIcon from '@material-ui/icons/Router';
import { usersService, remoteRegisteredUsersService } from '../../services/users.service';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import { mapAuthScopeToDisplay } from '../../logic/common/usersUtils';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import RemoveModeratorIcon from '@mui/icons-material/RemoveModerator';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import Chip from '@mui/material/Chip';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useHistory, useLocation } from 'react-router-dom';
import { useLiveliness } from '../../hooks/useLiveliness';
import { useData } from '../../hooks/useData';
import { PageLayout } from '../../components/layouts/PageLayout';
import { CreateUser } from '../../components/users/CreateUser';
import { AlertDialog } from '../../components/AlertDialog';
import LaunchIcon from '@mui/icons-material/Launch';
import { SensitiveContent } from '../../components/NoPermissions';

/**
 * The sort formula for sorting users by email
 */
function sortUsersFormula(a: User, b: User): number {
	return a.email < b.email ? -1 : 1;
}

interface UserComponentProps {
	user: User;
}

interface UserComponent {
	title: string;
	content: ComponentType<UserComponentProps>;
}

interface UsersLayoutProps {
	users: User[];
	email: UserComponent;
	name: UserComponent;
	scope: UserComponent;
	ignoreTfa: UserComponent;
	remoteAccess: UserComponent;
	editProfile: UserComponent;
	deleteUser: UserComponent;
}

/**
 * The users page desktops layout.
 */
function UsersDesktopLayout(props: UsersLayoutProps) {
	// In desktops, show data in a simple table
	return <TableContainer component={Paper}>
		<Table stickyHeader>
			<TableHead>
				<TableRow>
					<TableCell >{props.email.title}</TableCell>
					<TableCell >{props.name.title}</TableCell>
					<TableCell >{props.scope.title}</TableCell>
					<TableCell >{props.ignoreTfa.title}</TableCell>
					<TableCell >{props.remoteAccess.title}</TableCell>
					<TableCell >{props.editProfile.title}</TableCell>
					<TableCell >{props.deleteUser.title}</TableCell>
				</TableRow>
			</TableHead>
			<TableBody >
				{props.users.map(user => <TableRow >
					<TableCell ><props.email.content user={user} /></TableCell>
					<TableCell ><props.name.content user={user} /></TableCell>
					<TableCell ><props.scope.content user={user} /></TableCell>
					<TableCell ><props.ignoreTfa.content user={user} /></TableCell>
					<TableCell ><props.remoteAccess.content user={user} /></TableCell>
					<TableCell ><props.editProfile.content user={user} /></TableCell>
					<TableCell ><props.deleteUser.content user={user} /></TableCell>
				</TableRow>)}
			</TableBody>
		</Table>
	</TableContainer>;
}

/**
 * The users page mobile layout
 */
function UsersMobileLayout(props: UsersLayoutProps) {
	const theme = useTheme();

	return <Grid
		container
		direction="column"
		justifyContent="center"
		alignItems="stretch"
	>
		{props.users.map(user =>
			// Each user has own card 
			<Paper elevation={3} style={{ margin: DEFAULT_FONT_RATION }}>
				<Grid
					style={{ padding: DEFAULT_FONT_RATION }}
					container
					direction="column"
					justifyContent="center"
					alignItems="stretch"
				>
					{/* On first row, show the user mail */}
					<Grid
						style={{ width: '100%', marginBottom: DEFAULT_FONT_RATION }}
						container
						direction="row"
						justifyContent="flex-start"
						alignItems="center"
					>
						<Typography style={{ fontSize: DEFAULT_FONT_RATION * 0.7, width: '100%', color: theme.palette.text.hint }} >{props.email.title}</Typography>
						<Typography style={{ fontSize: DEFAULT_FONT_RATION * 1 }} ><props.email.content user={user} /></Typography>
					</Grid>
					{/* On second row, show the user name */}
					<Grid
						style={{ width: '100%', marginBottom: DEFAULT_FONT_RATION }}
						container
						direction="row"
						justifyContent="flex-start"
						alignItems="center"
					>
						<Typography style={{ fontSize: DEFAULT_FONT_RATION * 0.7, width: '100%', color: theme.palette.text.hint }} >{props.name.title}</Typography>
						<Typography style={{ fontSize: DEFAULT_FONT_RATION * 1 }} ><props.name.content user={user} /></Typography>
					</Grid>
					{/* On third row, show the user's controls and info such as scope, auth, delete etc */}
					<Grid
						style={{ width: '100%' }}
						container
						direction="row"
						justifyContent="space-between"
						alignItems="flex-end"
					>
						<div>
							{/* Add marginBottom: 6 to match scope content "space" with other icon buttons */}
							<div style={{ marginBottom: 6, marginTop: 6, fontSize: DEFAULT_FONT_RATION }} ><props.scope.content user={user} /></div>
						</div>
						<div>
							<div style={{ fontSize: DEFAULT_FONT_RATION }} ><props.ignoreTfa.content user={user} /></div>
						</div>
						<div>
							<div style={{ fontSize: DEFAULT_FONT_RATION }} ><props.remoteAccess.content user={user} /></div>
						</div>
						<div>
							<div style={{ fontSize: DEFAULT_FONT_RATION }} ><props.editProfile.content user={user} /></div>
						</div>
						<div>
							<div style={{ fontSize: DEFAULT_FONT_RATION }} ><props.deleteUser.content user={user} /></div>
						</div>
					</Grid>
				</Grid>
			</Paper>
		)
		}
	</Grid >
}

function Users(props: DashboardPageInjectProps) {
	const { t } = useTranslation();
	const wideDesktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
	const history = useHistory();
	const location = useLocation();
	const { remoteConnection } = useLiveliness();
	const [users, loading] = useData(usersService, []);

	const [deleting, setDeleting] = useState<boolean>(false);
	const [showDeleteUserAlert, setShowDeleteUserAlert] = useState<boolean>(false);
	const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
	const [remoteRegisteredUsers, setRemoteRegisteredUsers] = useState<string[]>();
	const [deleteCandidate, setDeleteCandidate] = useState<User>();

	useEffect(() => {
		// every time the devices collection has changed or the search term changed, re-calc the filtered minions
		calcDevicesFilter(users);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [users, props.searchText]);

	useEffect(() => {
		(async () => {
			// Every time the remote connection status is/changed  to OK, fetch registered users list. 
			if (remoteConnection === RemoteConnectionStatus.ConnectionOK) {
				try {
					const remoteRegisteredUsers = await remoteRegisteredUsersService.forceFetchData();
					setRemoteRegisteredUsers(remoteRegisteredUsers);
				} catch (error) {

				}
			}
		})();
	}, [remoteConnection]);

	function calcDevicesFilter(users: User[]) {
		const searchString = props.searchText?.trim().toLowerCase() || '';
		// In case of empty search term, "clone" collection anyway to avoid sort cache issue
		const filteredUsers = !searchString ? [...users] : users.filter(user => {
			// If the name match, return true
			if (user.email?.toLowerCase().includes(searchString)) {
				return true;
			}
			if (user.displayName?.toLowerCase().includes(searchString)) {
				return true;
			}
			return false;
		});

		setFilteredUsers(filteredUsers.sort(sortUsersFormula));
	}

	function goToProfile(user: User) {
		history.push(`${DashboardRoutes.profile.path}/${user.email}`);
	};

	async function deleteUser() {
		// If there is no candidate, abort
		if (!deleteCandidate) {
			return;
		}

		setDeleting(true);
		try {
			await ApiFacade.UsersApi.deleteUser(deleteCandidate.email);
			await usersService.forceFetchData();
		} catch (error) {
			handleServerRestError(error);
		}
		setDeleting(false);
	}

	if (loading) {
		return <Loader />;
	}

	// If there are no any user, show proper message
	if (users.length === 0) {
		return <NoContent Icon={PeopleAltIcon} message={t('dashboard.users.no.user.message')} />
	}

	// If there are no any user match the search term, show proper message
	if (filteredUsers.length === 0) {
		return <NoContent Icon={PeopleAltIcon} message={t('dashboard.users.no.users.match.message')} />
	}

	function EmailComponent(props: UserComponentProps) {
		return <div>{props.user.email}</div>;
	}

	function DisplayNameComponent(props: UserComponentProps) {
		return <div>{props.user.displayName}</div>;
	}

	function ScopeComponent(props: UserComponentProps) {
		return <Chip label={t(mapAuthScopeToDisplay[props.user.scope])} />;
	}

	function TfaComponent(props: UserComponentProps) {
		return <ThemeTooltip title={<span>{t(`dashboard.users.2fa.is.${props.user.ignoreTfa ? 'off' : 'on'}`)}</span>} >
			<IconButton
				color="inherit">
				{props.user.ignoreTfa ? <RemoveModeratorIcon fontSize="small" /> : <VerifiedUserIcon fontSize="small" />}
			</IconButton>
		</ThemeTooltip>;
	}

	function RemoteAccessComponent(props: UserComponentProps) {

		const userRegistered = remoteRegisteredUsers?.includes(props.user.email);

		return <ThemeTooltip title={<span>{t(!remoteRegisteredUsers
			? 'dashboard.users.remote.access.status.no.connection'
			: userRegistered
				? 'dashboard.users.remote.access.status.registered'
				: 'dashboard.users.remote.access.status.unregistered')}
		</span>} >
			<IconButton
				color="inherit">
				{!remoteRegisteredUsers && <CloudOffIcon fontSize="small" />}
				{remoteRegisteredUsers && userRegistered && <CloudDoneIcon fontSize="small" />}
				{remoteRegisteredUsers && !userRegistered && <RouterIcon fontSize="small" />}
			</IconButton>
		</ThemeTooltip>;
	}

	function EditProfileComponent(props: UserComponentProps) {
		return <ThemeTooltip title={<span>{t('dashboard.users.go.to.profile')}</span>} >
			<IconButton
				disabled={deleting}
				onClick={() => goToProfile(props.user)}
				color="inherit">
				<LaunchIcon fontSize="small" />
			</IconButton>
		</ThemeTooltip>;
	}

	function DeleteUserComponent(props: UserComponentProps) {
		return <ThemeTooltip title={<span>{t('global.delete')}</span>} >
			<IconButton
				disabled={deleting}
				onClick={() => { setShowDeleteUserAlert(true); setDeleteCandidate(props.user); }}
				color="inherit">
				{(!deleting || deleteCandidate?.email !== props.user.email) && <DeleteForeverIcon fontSize="small" />}
				{(deleting && deleteCandidate?.email === props.user.email) && <CircularProgress size={15} color="inherit" thickness={5} />}
			</IconButton>
		</ThemeTooltip>;
	}

	const showSideInfo = location?.pathname === CREATE_USER_PATH;
	const Layout = wideDesktopMode ? UsersDesktopLayout : UsersMobileLayout;

	return <div style={{ width: '100%', height: '100%' }}>
		<AlertDialog
			open={showDeleteUserAlert}
			cancelText={t('global.cancel')}
			submitText={t('global.delete')}
			title={t('dashboard.users.delete.user.alert.title', { name: deleteCandidate?.displayName })}
			text={t('dashboard.users.delete.user.alert.text', { email: deleteCandidate?.email, name: deleteCandidate?.displayName })}
			onCancel={() => setShowDeleteUserAlert(false)}
			onSubmit={() => { setShowDeleteUserAlert(false); deleteUser(); }}
			submitColor={'error'}
		/>

		<PageLayout
			showSideInfo={showSideInfo}
			// Empty DOM if side info not should be shown
			sideInfo={showSideInfo ? <CreateUser /> : <div></div>}
		>
			<Grid
				style={{ width: '100%', height: '100%' }}
				container
				direction="column"
				justifyContent="space-between"
				alignItems="stretch"
			>
				<Layout
					users={filteredUsers}
					email={{
						title: t('dashboard.users.user.email'),
						content: EmailComponent
					}}
					name={{
						title: t('dashboard.users.user.name'),
						content: DisplayNameComponent
					}}
					scope={{
						title: t('dashboard.users.user.scope'),
						content: ScopeComponent
					}}
					ignoreTfa={{
						title: t('dashboard.users.user.2fa'),
						content: TfaComponent
					}}
					remoteAccess={{
						title: t('dashboard.users.user.access'),
						content: RemoteAccessComponent
					}}
					editProfile={{
						title: t('dashboard.users.user.profile'),
						content: EditProfileComponent
					}}
					deleteUser={{
						title: '',
						content: DeleteUserComponent
					}}
				/>
			</Grid>
		</PageLayout>
	</div>;
}

export default function UsersPage(props: DashboardPageInjectProps) {
	return <SensitiveContent requiredScopes={[AuthScopes.AdminAuth]}>
		<Users {...props} />
	</SensitiveContent>
}
