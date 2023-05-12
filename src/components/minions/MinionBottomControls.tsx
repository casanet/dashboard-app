import { CircularProgress, Grid, IconButton, TextField, useTheme } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import CloseIcon from '@material-ui/icons/Close';
import '../../theme/styles/components/minions/minionEditableName.scss';
import { Fragment, useState } from "react";
import { Minion, minionsService } from "../../services/minions.service";
import { handleServerRestError } from "../../services/notifications.service";
import SaveIcon from '@material-ui/icons/Save';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { getModeColor } from "../../logic/common/themeUtils";
import RepeatIcon from '@mui/icons-material/Repeat';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ThemeTooltip } from "../global/ThemeTooltip";
import { ApiFacade } from "../../infrastructure/generated/api/swagger/api";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { timeOutService } from "../../services/timeout.service";
import { isOnMode } from "../../logic/common/minionsUtils";

interface MinionBottomControlsProps {
	minion: Minion;
	fontRatio: number;
}

const ACTIVATE_MINION_ROOM_ROOM = false;

export function MinionBottomControls(props: MinionBottomControlsProps) {
	const { t } = useTranslation();
	const theme = useTheme();
	const [editRoomNameMode, setEditRoomNameMode] = useState<boolean>(false);
	const [editingRoomName, setEditingRoomName] = useState<boolean>(false);
	const [editRoomNameError, setEditRoomNameError] = useState<boolean>(false);
	const [editRoomName, setEditRoomName] = useState<string>(props.minion.room || t('global.not.configured'));
	const [redoingStatus, setRedoingStatus] = useState<boolean>(false);
	const [resettingTimeoutStatus, setResettingTimeoutStatus] = useState<boolean>(false);
	const [refreshStatus, setRefreshStatus] = useState<boolean>(false);

	const { minion, fontRatio } = props;

	async function renameRoom() {
		setEditingRoomName(true);
		try {
			await ApiFacade.MinionsApi.renameRoom(minion.minionId || '', { room: editRoomName || '' });
			minion.room = editRoomName || '';
			minionsService.updateMinion(minion);
		} catch (error) {
			handleServerRestError(error);
		}
		setEditingRoomName(false);
	}

	async function redoMinionStatus() {
		setRedoingStatus(true);
		try {
			await ApiFacade.MinionsApi.setMinion(minion.minionId || '', minion.minionStatus);
		} catch (error) {
			handleServerRestError(error);
		}
		setRedoingStatus(false);
	}

	async function resetMinionTimeout() {
		setResettingTimeoutStatus(true);
		try {
			await ApiFacade.MinionsApi.restartMinionTimeout(minion.minionId || '');
			await timeOutService.forceFetchData();
		} catch (error) {
			handleServerRestError(error);
		}
		setResettingTimeoutStatus(false);
	}

	async function refreshMinionStatus() {
		setRefreshStatus(true);
		try {
			await ApiFacade.MinionsApi.rescanMinionStatus(minion.minionId || '');
			// In case of an update, fetch it again
			minionsService.forceFetchData();
		} catch (error) {
			handleServerRestError(error);
		}
		setRefreshStatus(false);
	}

	const isOn = isOnMode(minion.minionType, minion.minionStatus);

	return <Fragment>
		<Grid
			style={{ width: '100%' }}
			container
			direction="row"
			justifyContent="space-between"
			alignItems="center"
		>
			<div>
				{ACTIVATE_MINION_ROOM_ROOM && <Grid
					container
					direction="row"
					justifyContent="flex-start"
					alignItems="center"
					style={{ padding: fontRatio * 0.3 }}
				>
					{<div style={{ width: `70%` }}>
						<TextField
							style={{ width: `100%` }}
							disabled={editingRoomName}
							error={editRoomNameError}
							helperText={t('global.room')}
							variant="standard"
							value={editRoomName}
							onChange={(e) => {
								setEditRoomNameError(false);
								setEditRoomName(e.target.value);
								setEditRoomNameMode(true);
							}}
						/>
					</div>}
					<div>
						{editingRoomName && <CircularProgress size={fontRatio * 0.3} thickness={10} />}
						{!editingRoomName && editRoomNameMode && <ThemeTooltip title={<span>{t('global.save')}</span>} >
							<IconButton
								style={{ padding: fontRatio * 0.1, marginLeft: fontRatio * 0.3 }}
								onClick={renameRoom}
								color="inherit">
								<SaveIcon style={{ fontSize: fontRatio * 0.3 }} />
							</IconButton>
						</ThemeTooltip>}
						{!editingRoomName && editRoomNameMode && <ThemeTooltip title={<span>{t('global.cancel')}</span>} >
							<IconButton
								style={{ padding: fontRatio * 0.1 }}
								onClick={() => { setEditRoomNameMode(false); }}
								color="inherit">
								<CloseIcon style={{ fontSize: fontRatio * 0.3 }} />
							</IconButton>
						</ThemeTooltip>}
					</div>
				</Grid>}
			</div>
			{!minion?.readonly && <div>
				<Grid
					container
					direction="row"
					justifyContent="center"
					alignItems="center"
				>
					{minion.minionAutoTurnOffMS && isOn ? <ThemeTooltip title={<span>{t(`dashboard.minions.reset.timeout.tip`)}</span>} disableFocusListener >
						<IconButton
							style={{ padding: fontRatio * 0.2 }}
							disabled={redoingStatus}
							aria-label={t(`dashboard.minions.reset.timeout.tip`)}
							onClick={resetMinionTimeout}
							color="inherit"
						>
							{resettingTimeoutStatus && <MoreHorizIcon style={{ fontSize: fontRatio * 0.7, color: getModeColor(false, theme) }} />}
							{!resettingTimeoutStatus && <RestartAltIcon style={{ fontSize: fontRatio * 0.7 }} />}
						</IconButton>
					</ThemeTooltip> : <div></div>}
					<ThemeTooltip title={<span>{t(`dashboard.minions.redo.status.tip`)}</span>} disableFocusListener >
						<IconButton
							style={{ padding: fontRatio * 0.2 }}
							disabled={redoingStatus}
							aria-label={t(`dashboard.minions.redo.status.tip`)}
							onClick={redoMinionStatus}
							color="inherit"
						>
							{/* In case of loading, show loader icon */}
							{redoingStatus && <MoreHorizIcon style={{ fontSize: fontRatio * 0.7, color: getModeColor(false, theme) }} />}
							{!redoingStatus && <RepeatIcon style={{ fontSize: fontRatio * 0.7 }} />}
						</IconButton>
					</ThemeTooltip>
					<ThemeTooltip title={<span>{t(`dashboard.minions.sync.status.tip`)}</span>} disableFocusListener >
						<IconButton
							style={{ padding: fontRatio * 0.2 }}
							disabled={refreshStatus}
							aria-label={t(`dashboard.minions.sync.status.tip`)}
							onClick={refreshMinionStatus}
							color="inherit"
						>
							{/* In case of loading, show loader icon */}
							{refreshStatus && <MoreHorizIcon style={{ fontSize: fontRatio * 0.7, color: getModeColor(false, theme) }} />}
							{!refreshStatus && <RefreshIcon style={{ fontSize: fontRatio * 0.7 }} />}
						</IconButton>
					</ThemeTooltip>
				</Grid>
			</div>}
		</Grid>
	</Fragment>
}