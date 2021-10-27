import { CircularProgress, Grid, IconButton, TextField, Theme, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { User } from "../../infrastructure/generated/api";
import Avatar from '@mui/material/Avatar';
import { DEFAULT_FONT_RATION } from "../../infrastructure/consts";
import { marginLeft } from "../../logic/common/themeUtils";
import { extractProfileAvatarText } from "../../logic/common/profileUtils";
import { useMemo, useState } from "react";
import { ThemeTooltip } from "../global/ThemeTooltip";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';
import { useTranslation } from "react-i18next";
import { ApiFacade } from "../../infrastructure/generated/proxies/api-proxies";
import { ProfileItemProps } from "../../pages/dashboard-pages/Profile";
import { handleServerRestError } from "../../services/notifications.service";

export function ProfileName(props: ProfileItemProps) {
	const { t } = useTranslation();
	const theme = useTheme();
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
	const wideDesktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

	const [editNameMode, setEditNameMode] = useState<boolean>(false);
	const [editingName, setEditingName] = useState<boolean>(false);
	const [editNameError, setEditNameError] = useState<boolean>(false);
	const [editName, setEditName] = useState<string>('');

	const avatarLetters = useMemo(() => extractProfileAvatarText(props.profile), [props.profile]);

	async function rename() {
		if (!editName) {
			setEditNameError(true);
			return;
		}
		setEditingName(true);

		try {
			const newProfile = { ...props.profile, displayName: editName } as User;
			await ApiFacade.UsersApi.setUser(newProfile, props.profile.email);
			props.setProfile(newProfile);
			setEditNameMode(false);
		} catch (error) {
			await handleServerRestError(error);
		}
		setEditingName(false);
	}

	const { profile } = props;

	return <Grid
		container
		direction="row"
		justifyContent="flex-start"
		alignItems="center"
	>
		{/* Show the big avatar only on wide screens */}
		{wideDesktopMode && <div>
			<Avatar style={{ width: DEFAULT_FONT_RATION * 7.5, height: DEFAULT_FONT_RATION * 7.5, fontSize: DEFAULT_FONT_RATION * 4.5 }}>
				{avatarLetters}
			</Avatar>
		</div>}
		<div style={{ maxWidth: DEFAULT_FONT_RATION * 25, [marginLeft(theme)]: wideDesktopMode ? DEFAULT_FONT_RATION * 2 : 0 }}>
			<Grid
				container
				direction="column"
				justifyContent="flex-start"
				alignItems="flex-start"
			>
				<div style={{ maxWidth: '100%' }}>
					<Grid
						container
						direction="row"
						justifyContent="center"
						alignItems="center"
					>
						{!editNameMode && <div style={{ maxWidth: `calc(100% - 70px)` }}>
							<Typography style={{ wordBreak: 'break-word', fontSize: DEFAULT_FONT_RATION * (desktopMode ? 2.3 : 1.8) }} >{profile.displayName}</Typography>
						</div>}
						{editNameMode && <div style={{ width: `calc(100% - 45px)` }}>
							<TextField
								style={{ width: `100%` }}
								disabled={editingName}
								error={editNameError}
								variant="standard"
								value={editName}
								onChange={(e) => {
									setEditNameError(false);
									setEditName(e.target.value);
								}}
							/>
						</div>}
						<div style={{ [marginLeft(theme)]: DEFAULT_FONT_RATION }}>
							{!editNameMode && <ThemeTooltip title={<span>{t('global.edit')}</span>} >
								<IconButton
									style={{ padding: DEFAULT_FONT_RATION * 0.5 }}
									onClick={() => { setEditNameMode(true); setEditName(profile.displayName || ''); }}
									color="inherit">
									<EditIcon style={{ fontSize: DEFAULT_FONT_RATION * 1.5 }} />
								</IconButton>
							</ThemeTooltip>}
							{editingName && <CircularProgress size={DEFAULT_FONT_RATION * 0.8} thickness={10} />}
							{!editingName && editNameMode && <ThemeTooltip title={<span>{t('global.save')}</span>} >
								<IconButton
									style={{ padding: DEFAULT_FONT_RATION * 0.1 }}
									onClick={rename}
									color="inherit">
									<SaveIcon style={{ fontSize: DEFAULT_FONT_RATION * 0.8 }} />
								</IconButton>
							</ThemeTooltip>}
							{!editingName && editNameMode && <ThemeTooltip title={<span>{t('global.cancel')}</span>} >
								<IconButton
									style={{ padding: DEFAULT_FONT_RATION * 0.1 }}
									onClick={() => { setEditNameMode(false); }}
									color="inherit">
									<CloseIcon style={{ fontSize: DEFAULT_FONT_RATION * 0.8 }} />
								</IconButton>
							</ThemeTooltip>}
						</div>
					</Grid>
				</div>
				<div>
					<Typography style={{ wordBreak: 'break-word', fontSize: DEFAULT_FONT_RATION * (desktopMode ? 1.3 : 1), color: theme.palette.text.hint }} >{profile.email}</Typography>
				</div>
			</Grid>
		</div>
	</Grid>;
}