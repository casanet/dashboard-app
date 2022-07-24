import { Grid, useTheme } from "@material-ui/core";
import { CSSProperties, Fragment } from "react";
import { useTranslation } from "react-i18next";
import LockIcon from '@mui/icons-material/Lock';
import NetworkIssueIcon from '@mui/icons-material/SignalWifiStatusbarConnectedNoInternet4';
import SyncIcon from '@mui/icons-material/Sync';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import { ThemeTooltip } from "../global/ThemeTooltip";
import { CalibrationMode, Minion } from "../../infrastructure/generated/api/swagger/api";

interface MinionIndicatorsProps {
	minion: Minion;
	fontRatio: number;
	smallFontRatio: number;
}

export function MinionIndicators(props: MinionIndicatorsProps) {
	const { t } = useTranslation();
	const theme = useTheme();

	const { minion, smallFontRatio } = props;

	const indicatorsStyle: CSSProperties = { fontSize: smallFontRatio, marginTop: smallFontRatio * 0.3, color: theme.palette.grey[500] };

	const syncOn = !!minion.calibration?.calibrationCycleMinutes;
	return <div className="minion-indicators-container">
		<Grid
			container
			direction="column"
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
		</Grid>
	</div>
}