import { Grid, useTheme } from "@material-ui/core";
import { CSSProperties, Fragment } from "react";
import { useTranslation } from "react-i18next";
import LockIcon from '@mui/icons-material/Lock';
import NetworkIssueIcon from '@mui/icons-material/SignalWifiStatusbarConnectedNoInternet4';
import SyncIcon from '@mui/icons-material/Sync';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import { ThemeTooltip } from "../global/ThemeTooltip";
import { Action, CalibrationMode, Minion } from "../../infrastructure/generated/api/swagger/api";
import PhonelinkLockIcon from '@material-ui/icons/PhonelinkLock';
import { useData } from "../../hooks/useData";
import { timingsService } from "../../services/timings.service";
import { actionsService } from "../../services/actions.service";
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import DeviceHubIcon from '@material-ui/icons/DeviceHub';
import { marginLeft } from "../../logic/common/themeUtils";
import { minionsService } from "../../services/minions.service";

interface MinionIndicatorsProps {
	minion: Minion;
	fontRatio: number;
	smallFontRatio: number;
	showAsRow: boolean;
}

function controllingMinionsByActions(actions: Action[]): (Minion | undefined)[] {
	const ids: string[] = [];
	// Collect all minions controlled by all actions
	for (const action of actions) {
		ids.push(...action.thenSet?.map(s => s?.minionId));
	}
	const uniqueIds = [...new Set(ids)];
	return uniqueIds.map(id => minionsService.getMinion(id));
}

function controlledByActionsMinions(actions: Action[]): (Minion | undefined)[] {
	const uniqueIds = [...new Set(actions.map(a => a.minionId))];
	return uniqueIds.map(id => minionsService.getMinion(id));
}

export function MinionIndicators(props: MinionIndicatorsProps) {
	const { t } = useTranslation();
	const theme = useTheme();

	const [timings] = useData(timingsService);
	const [actions] = useData(actionsService);

	const { minion, smallFontRatio, showAsRow } = props;

	const indicatorsStyle: CSSProperties = { [marginLeft(theme)]: smallFontRatio * (showAsRow ? 0.3 : 0.75), fontSize: smallFontRatio, marginTop: smallFontRatio * 0.3, color: theme.palette.grey[500] };
	const hasTimings = timings.some((t) => t.isActive && t.triggerDirectAction?.minionId === minion?.minionId);
	const minionActions = actions.filter((a) => a.active && a.minionId === minion?.minionId);
	const managedByActions = actions.filter((a) => a.active && a.thenSet?.find(s => s.minionId === minion?.minionId));

	const syncOn = !!minion.calibration?.calibrationCycleMinutes;

	// Build a string continues all the minions controlled by this minion by any actions.
	const hasActionsNames = controllingMinionsByActions(minionActions).map(m => m?.name || '-').join(', ');
	// Build a string of all minions controlling this minion by any action
	const managedByActionsNames = controlledByActionsMinions(managedByActions).map(m => m?.name || '-').join(', ');

	return <Grid
		container
		direction={showAsRow ? 'row-reverse' : 'column'}
		justifyContent="center"
		alignItems="center"
	>
		{!minion.isProperlyCommunicated && <Fragment>
			<ThemeTooltip title={<span>{t('dashboard.minions.communication.error.tip')}</span>} enterDelay={100}>
				<NetworkIssueIcon style={indicatorsStyle} />
			</ThemeTooltip>
		</Fragment>}
		{syncOn && minion.calibration?.calibrationMode === CalibrationMode.Auto && <Fragment>
			<ThemeTooltip title={<span>{t('dashboard.minions.sync.tip', { minutes: minion.calibration?.calibrationCycleMinutes })}</span>} enterDelay={100}>
				<SyncIcon style={indicatorsStyle} />
			</ThemeTooltip>
		</Fragment>}
		{syncOn && (minion.calibration?.calibrationMode === CalibrationMode.LockOn || minion.calibration?.calibrationMode === CalibrationMode.LockOff) && <Fragment>
			<ThemeTooltip title={<span>{t(`dashboard.minions.lock.${minion.calibration?.calibrationMode === CalibrationMode.LockOn ? 'on' : 'off'}.tip`)}</span>} enterDelay={100}>
				<LockIcon style={indicatorsStyle} />
			</ThemeTooltip>
		</Fragment>}
		{syncOn && minion.calibration?.calibrationMode === CalibrationMode.Shabbat && <Fragment>
			<ThemeTooltip title={<span>{t(`dashboard.minions.rotating.mode.tip`, { minutes: minion.calibration?.calibrationCycleMinutes })}</span>} enterDelay={100}>
				<RotateRightIcon style={indicatorsStyle} />
			</ThemeTooltip>
		</Fragment>}
		{syncOn && minion.calibration?.calibrationMode === CalibrationMode.LockDashboard && <Fragment>
			<ThemeTooltip title={<span>{t(`dashboard.minions.dashboard.lock.tip`, { minutes: minion.calibration?.calibrationCycleMinutes })}</span>} enterDelay={100}>
				<PhonelinkLockIcon style={indicatorsStyle} />
			</ThemeTooltip>
		</Fragment>}
		{hasTimings && <Fragment>
			<ThemeTooltip title={<span>{t(`dashboard.minions.dashboard.timings.tip`, { name: minion?.name })}</span>} enterDelay={100}>
				<AccessAlarmIcon style={indicatorsStyle} />
			</ThemeTooltip>
		</Fragment>}
		{minionActions?.length > 0 && <Fragment>
			<ThemeTooltip title={<span>{t(`dashboard.minions.dashboard.control.actions.tip`, { names: hasActionsNames })}</span>} enterDelay={100}>
				<PlayCircleOutlineIcon style={indicatorsStyle} />
			</ThemeTooltip>
		</Fragment>}
		{managedByActions?.length > 0 && <Fragment>
			<ThemeTooltip title={<span>{t(`dashboard.minions.dashboard.controlled.actions.tip`, { names: managedByActionsNames })}</span>} enterDelay={100}>
				<DeviceHubIcon style={indicatorsStyle} />
			</ThemeTooltip>
		</Fragment>}
	</Grid>;
}