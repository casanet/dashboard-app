import { Avatar, Divider, IconButton, ListItemIcon, Menu, MenuItem, Typography, useTheme } from "@material-ui/core";
import { useEffect, useState } from "react";
import { getLocalStorageItem, LocalStorageKey } from "../../infrastructure/local-storage";
import '../../theme/styles/components/profileAvatar.scss';
import InfoOutlined from '@material-ui/icons/InfoOutlined';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import HelpOutlineOutlined from '@material-ui/icons/HelpOutlineOutlined';
import PermIdentityOutlined from '@material-ui/icons/PermIdentityOutlined';
import HomeIcon from '@material-ui/icons/Home';
import { useTranslation } from "react-i18next";
import { sessionManager } from "../../infrastructure/session-manager";
import { useHistory } from "react-router-dom";
import { AppRoutes, DashboardRoutes, DEFAULT_FONT_RATION } from "../../infrastructure/consts";
import { extractProfileAvatarText } from "../../logic/common/profileUtils";
import Modal from '@mui/material/Modal';
import { Help } from "../general/Help";
import Box from '@mui/material/Box';
import { About } from "../general/About";
import { modalBoxStyle } from "../../logic/common/modalUtils";
import { ApiFacade, User } from "../../infrastructure/generated/api/swagger/api";
import { envFacade } from "../../infrastructure/env-facade";
import { Grid } from "@mui/material";
import { ThemeTooltip } from "../global/ThemeTooltip";
import InfoIcon from '@mui/icons-material/Info';
import { marginLeft } from "../../logic/common/themeUtils";

export function ProfileAvatar() {
	const { t } = useTranslation();
	const history = useHistory();
	const theme = useTheme();

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [avatarLetters, setAvatarLetters] = useState<string>('');
	const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
	const [homeNetwork, setHomeNetwork] = useState<boolean>(envFacade.useLocalConnection);
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
			<Avatar
				style={{ border: homeNetwork ? `0.3rem outset ${theme.palette.info.main}` : '', color: homeNetwork ? theme.palette.info.main : undefined }}
			>{avatarLetters}
			</Avatar>
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
			{/* If local server is avialbe during a remote server session, show this item to allow use/disable it. */}
			{envFacade.localConnectionAvailable && <MenuItem style={{
				background: homeNetwork ? theme.palette.action.selected : undefined,
				color: homeNetwork ? theme.palette.info.main : undefined
			}}>
				<Grid onClick={() => {
					const newHomeNetworkMode = !homeNetwork;
					setHomeNetwork(newHomeNetworkMode);
					envFacade.useLocalConnection = newHomeNetworkMode;
				}}
					container
					direction="row"
					justifyContent="flex-start"
					alignItems="center"
				>
					<ListItemIcon className="profile-menu-item-icon">
						<HomeIcon fontSize="small" style={{ color: homeNetwork ? theme.palette.info.main : undefined }} />
					</ListItemIcon>
					<Typography variant="inherit">
						{t(`dashboard.appbar.use.home.network`)}
					</Typography>
					<ThemeTooltip title={<span>{t(`dashboard.appbar.use.home.network.${homeNetwork ? 'on' : 'off'}.tip`)}</span>}>
						<InfoIcon style={{ fontSize: DEFAULT_FONT_RATION * 0.7, marginTop: DEFAULT_FONT_RATION * -0.2, [marginLeft(theme)]: DEFAULT_FONT_RATION * 0.2 }} />
					</ThemeTooltip>
				</Grid>
			</MenuItem>}
			<MenuItem>
				<Grid onClick={goToProfile}
					container
					direction="row"
					justifyContent="flex-start"
					alignItems="center"
				>
					<ListItemIcon className="profile-menu-item-icon">
						<PermIdentityOutlined fontSize="small" />
					</ListItemIcon>
					<Typography variant="inherit">
						{t('global.profile')}
					</Typography>
				</Grid>
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