import { Avatar, Divider, IconButton, ListItemIcon, Menu, MenuItem, Typography } from "@material-ui/core";
import { useEffect, useState } from "react";
import { User } from "../../infrastructure/generated/api";
import { getLocalStorageItem, LocalStorageKey } from "../../infrastructure/local-storage";
import '../../theme/styles/components/profileAvatar.scss';
import InfoOutlined from '@material-ui/icons/InfoOutlined';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import HelpOutlineOutlined from '@material-ui/icons/HelpOutlineOutlined';
import PermIdentityOutlined from '@material-ui/icons/PermIdentityOutlined';
import { ApiFacade } from "../../infrastructure/generated/proxies/api-proxies";
import { useTranslation } from "react-i18next";
import { sessionManager } from "../../infrastructure/session-manager";
import { useHistory } from "react-router-dom";
import { AppRoutes } from "../../infrastructure/consts";

export function ProfileAvatar() {
	const { t } = useTranslation();
	const history = useHistory();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [profile, setProfile] = useState<User>();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [avatarLetters, setAvatarLetters] = useState<string>('');

	useEffect(() => {
		const profile = getLocalStorageItem<User>(LocalStorageKey.Profile, { itemType: 'object' });
		setProfile(profile);
		// Get the first letter of user's display name parts and combine the first two parts (for example haim kasnter to HK :)  
		const avatarLetters = (profile?.displayName?.trim().split(' ') || ['-', '-']).map(p => p[0]?.toUpperCase()).slice(0, 2).join('');
		setAvatarLetters(avatarLetters);
	}, [])

	function handleOpenMenu(event: React.MouseEvent<HTMLElement>) {
		setAnchorEl(event.currentTarget);
	};

	function handleClose() {
		setAnchorEl(null);
	};

	async function handleLogout() {
		try {
			await ApiFacade.AuthenticationApi.logout();
		} catch (error) {
			// TODO: make sue to somehow delete the session without connection to the server since it's HTTP ONLY cookie session.
			// handleServerRestError(error);
		}
		sessionManager.onLogout();
		history.push(AppRoutes.login.path);
	};


	return <div className="profile-avatar-container">
		<IconButton
			className="profile-avatar"
			aria-label={t('dashboard.appbar.profile')}
			aria-controls="menu-profile-appbar"
			aria-haspopup="true"
			onClick={handleOpenMenu}
			color="inherit"
		>
			<Avatar >{avatarLetters}</Avatar>
		</IconButton>

		<Menu
			id="menu-profile-appbar"
			elevation={0}
			getContentAnchorEl={null}
			anchorEl={anchorEl}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'center',
			}}
			keepMounted
			transformOrigin={{
				vertical: 'top',
				horizontal: 'center',
			}}
			open={Boolean(anchorEl)}
			onClose={handleClose}
		>
			<MenuItem >
				<ListItemIcon className="profile-menu-item-icon">
					<PermIdentityOutlined fontSize="small" />
				</ListItemIcon>
				<Typography variant="inherit">
					{t('global.profile')}
				</Typography>
			</MenuItem>
			<MenuItem >
				<ListItemIcon className="profile-menu-item-icon">
					<HelpOutlineOutlined fontSize="small" />
				</ListItemIcon>
				<Typography variant="inherit">
					{t('global.help')}
				</Typography>
			</MenuItem>
			<MenuItem >
				<ListItemIcon className="profile-menu-item-icon">
					<InfoOutlined fontSize="small" />
				</ListItemIcon>
				<Typography variant="inherit">
					{t('global.about')}
				</Typography></MenuItem>
			<Divider />
			<MenuItem onClick={handleLogout}>
				<ListItemIcon className="profile-menu-item-icon">
					<ExitToAppIcon fontSize="small" />
				</ListItemIcon>
				<Typography variant="inherit">
					{t('global.logout')}
				</Typography>
			</MenuItem>
		</Menu>
	</div>
}