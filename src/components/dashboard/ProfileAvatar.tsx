import { Avatar, Divider, IconButton, ListItemIcon, Menu, MenuItem, Typography } from "@material-ui/core";
import { useEffect, useState } from "react";
import { getLocalStorageItem, LocalStorageKey } from "../../infrastructure/local-storage";
import '../../theme/styles/components/profileAvatar.scss';
import InfoOutlined from '@material-ui/icons/InfoOutlined';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import HelpOutlineOutlined from '@material-ui/icons/HelpOutlineOutlined';
import PermIdentityOutlined from '@material-ui/icons/PermIdentityOutlined';
import { useTranslation } from "react-i18next";
import { sessionManager } from "../../infrastructure/session-manager";
import { useHistory } from "react-router-dom";
import { AppRoutes, DashboardRoutes } from "../../infrastructure/consts";
import { extractProfileAvatarText } from "../../logic/common/profileUtils";
import Modal from '@mui/material/Modal';
import { Help } from "../general/Help";
import Box from '@mui/material/Box';
import { About } from "../general/About";
import { modalBoxStyle } from "../../logic/common/modalUtils";
import { ApiFacade, User } from "../../infrastructure/generated/api/swagger/api";

export function ProfileAvatar() {
	const { t } = useTranslation();
	const history = useHistory();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [avatarLetters, setAvatarLetters] = useState<string>('');
	const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
	const [showAboutModal, setShowAboutModal] = useState<boolean>(false);

	useEffect(() => {
		// Read user session info from local storage, it may be not up to date, but it's good enough for the avatar icon.
		const profile = getLocalStorageItem<User>(LocalStorageKey.Profile, { itemType: 'object' });
		setAvatarLetters(extractProfileAvatarText(profile));
	}, [])

	function handleOpenMenu(event: React.MouseEvent<HTMLElement>) {
		setAnchorEl(event.currentTarget);
	};

	function handleClose() {
		setAnchorEl(null);
	};

	function handleLogout() {
		ApiFacade.AuthenticationApi.logout().catch(() => {
			// TODO: LOG
		});
		sessionManager.onLogout();
		history.push(AppRoutes.login.path);
		handleClose();
	};

	function goToProfile() {
		history.push(DashboardRoutes.profile.path);
		handleClose();
	};

	return <div className="profile-avatar-container">
		<Modal
			open={showHelpModal}
			onClose={() => setShowHelpModal(false)}
		>
			<Box sx={modalBoxStyle}>
				<Help />
			</Box>
		</Modal>
		<Modal
			open={showAboutModal}
			onClose={() => setShowAboutModal(false)}
		>
			<Box sx={modalBoxStyle}>
				<About />
			</Box>
		</Modal>
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
			<MenuItem>
				<div onClick={goToProfile}>
					<ListItemIcon className="profile-menu-item-icon">
						<PermIdentityOutlined fontSize="small" />
					</ListItemIcon>
					<Typography variant="inherit">
						{t('global.profile')}
					</Typography>
				</div>
			</MenuItem>
			<MenuItem onClick={() => { setShowHelpModal(true); handleClose(); }}>
				<ListItemIcon className="profile-menu-item-icon">
					<HelpOutlineOutlined fontSize="small" />
				</ListItemIcon>
				<Typography variant="inherit">
					{t('global.help')}
				</Typography>
			</MenuItem>
			<MenuItem onClick={() => { setShowAboutModal(true); handleClose(); }}>
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