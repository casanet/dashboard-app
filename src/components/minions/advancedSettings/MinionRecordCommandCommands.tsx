import { Grid, IconButton, Theme, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { useTranslation } from "react-i18next"
import InfoIcon from '@mui/icons-material/Info';
import { useState } from "react";
import { handleServerRestError } from "../../../services/notifications.service";
import { defaultMinionStatus, isOnMode } from "../../../logic/common/minionsUtils";
import { getModeColor } from "../../../logic/common/themeUtils";
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import DoneIcon from '@mui/icons-material/Done';
import SettingsRemoteIcon from '@mui/icons-material/SettingsRemote';
import { SwitchEditStatus } from "../editMinionStatus/SwitchEditStatus";
import { MinionEditStatus } from "../editMinionStatus/MinionEditStatus";
import MoneyIcon from '@mui/icons-material/Money';
import { ThemeTooltip } from "../../global/ThemeTooltip";
import { DEFAULT_SUCCEED_ICON_SHOWN } from "../../../infrastructure/consts";
import { ApiFacade, Minion, MinionStatus, MinionTypes } from "../../../infrastructure/generated/api/swagger/api";

interface MinionRecordCommandCommandsProps {
	fontRatio: number;
	minion: Minion;
}

export function MinionRecordCommandCommands(props: MinionRecordCommandCommandsProps) {
	const { t } = useTranslation();
	const theme = useTheme();
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
	const [recordMinionStatus, setRecordMinionStatus] = useState<MinionStatus>(defaultMinionStatus(props.minion.minionType));
	const [recordingSuccess, setRecordingSuccess] = useState<boolean>();
	const [generatingSuccess, setGeneratingSuccess] = useState<boolean>();
	const [recording, setRecording] = useState<boolean>();
	const [generating, setGenerating] = useState<boolean>();

	const { fontRatio, minion } = props;

	async function recordCommand() {
		setRecording(true);
		try {
			await ApiFacade.RFApi.recordMinionCommand(minion.minionId || '', recordMinionStatus);
			// Shown recording success indicator for X sec
			setRecordingSuccess(true);
			setTimeout(() => {
				setRecordingSuccess(false);
			}, DEFAULT_SUCCEED_ICON_SHOWN.Milliseconds);
		} catch (error) {
			await handleServerRestError(error);
		}
		setRecording(false);
	}

	async function generateCommand() {
		setGenerating(true);
		try {
			await ApiFacade.RFApi.generateMinionCommand(minion.minionId || '', recordMinionStatus);
			// Shown generating success indicator for X sec
			setGeneratingSuccess(true);
			setTimeout(() => {
				setGeneratingSuccess(false);
			}, DEFAULT_SUCCEED_ICON_SHOWN.Milliseconds);
		} catch (error) {
			await handleServerRestError(error);
		}
		setGenerating(false);
	}

	const disableActions = recording || generating;

	return <Grid
		container
		direction="column"
		justifyContent="center"
		alignItems="stretch"
	>
		<Grid
			container
			direction="row"
			justifyContent="space-between"
			alignItems="center"
		>
			<div>
				<Grid
					container
					direction={'row'}
					justifyContent="flex-start"
					alignItems="center"
				>
					<Typography style={{ fontSize: fontRatio * 0.3 }} >{t('dashboard.minions.advanced.settings.record.commands.title')}</Typography>
					<ThemeTooltip title={<span>{t('dashboard.minions.advanced.settings.record.commands.tip')}</span>}>
						<InfoIcon style={{ fontSize: fontRatio * 0.3, marginTop: fontRatio * -0.2 }} />
					</ThemeTooltip>
				</Grid>
			</div>
			<div>
				<Grid
					container
					direction="row"
					justifyContent="center"
					alignItems="center"
				>
					<ThemeTooltip title={<span>{t(`dashboard.minions.advanced.settings.generate.command`)}</span>} disableFocusListener >
						<IconButton
							disabled={disableActions || generatingSuccess}
							onClick={generateCommand}
							color="inherit"
						>
							{generatingSuccess && <DoneIcon style={{ fontSize: fontRatio * 0.6, color: getModeColor(false, theme) }} />}
							{/* In case of generating, show loader icon */}
							{!generatingSuccess && generating && <MoreHorizIcon style={{ fontSize: fontRatio * 0.6, color: getModeColor(false, theme) }} />}
							{(!generatingSuccess && !generating) && <MoneyIcon style={{ fontSize: fontRatio * 0.6 }} />}
						</IconButton>
					</ThemeTooltip>
					<ThemeTooltip title={<span>{t(`dashboard.minions.advanced.settings.record.command`)}</span>} disableFocusListener >
						<IconButton
							disabled={disableActions || recordingSuccess}
							onClick={recordCommand}
							color="inherit"
						>
							{recordingSuccess && <DoneIcon style={{ fontSize: fontRatio * 0.6, color: getModeColor(false, theme) }} />}
							{/* In case of loading, show loader icon */}
							{!recordingSuccess && recording && <MoreHorizIcon style={{ fontSize: fontRatio * 0.6, color: getModeColor(false, theme) }} />}
							{!recordingSuccess && (!recording) && <SettingsRemoteIcon style={{ fontSize: fontRatio * 0.6 }} />}
						</IconButton>
					</ThemeTooltip>
				</Grid>
			</div>
		</Grid>
		<Grid
			style={{ width: '100%' }}
			container
			direction="row"
			justifyContent="space-between"
			alignItems="flex-end"
		>
			<Grid
				container
				direction={desktopMode ? 'row' : 'column'}
				justifyContent="center"
				alignItems="center"
			>
				<div>
					<SwitchEditStatus
						disabled={disableActions}
						minionStatus={recordMinionStatus}
						setMinionStatus={setRecordMinionStatus}
						minionType={props.minion.minionType}
						fontRatio={fontRatio * 0.7}
						smallFontRatio={fontRatio * 0.7 * 0.5}
						isOn={isOnMode(props.minion.minionType, recordMinionStatus)} />
				</div>
				<div>
					{props.minion.minionType !== MinionTypes.Toggle && props.minion.minionType !== MinionTypes.Switch &&
						<MinionEditStatus disabled={disableActions} minionStatus={recordMinionStatus} setMinionStatus={setRecordMinionStatus} minionType={props.minion.minionType} fontRatio={fontRatio * 0.7} />}
				</div>
			</Grid>
		</Grid>
	</Grid>;
}
