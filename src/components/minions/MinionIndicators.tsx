import { Grid, useTheme } from "@material-ui/core";
import { CSSProperties, Fragment } from "react";
import { CalibrationMode, Minion } from "../../infrastructure/generated/api";
import { useTranslation } from "react-i18next";
import LockIcon from '@mui/icons-material/Lock';
import NetworkIssueIcon from '@mui/icons-material/SignalWifiStatusbarConnectedNoInternet4';
import SyncIcon from '@mui/icons-material/Sync';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import { ThemeTooltip } from "../global/ThemeTooltip";

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
			{syncOn && minion.calibration?.calibrationMode === CalibrationMode.AUTO && <Fragment>
				<ThemeTooltip title={<span>{t('dashboard.minions.sync.tip', { minutes: minion.calibration?.calibrationCycleMinutes })}</span>} enterDelay={100}>
					<SyncIcon style={indicatorsStyle} />
				</ThemeTooltip>
			</Fragment>}
			{syncOn && (minion.calibration?.calibrationMode === CalibrationMode.LOCKON || minion.calibration?.calibrationMode === CalibrationMode.LOCKOFF) && <Fragment>
				<ThemeTooltip title={<span>{t(`dashboard.minions.lock.${minion.calibration?.calibrationMode === CalibrationMode.LOCKON ? 'on' : 'off'}.tip`)}</span>} enterDelay={100}>
					<LockIcon style={indicatorsStyle} />
				</ThemeTooltip>
			</Fragment>}
			{syncOn && minion.calibration?.calibrationMode === CalibrationMode.SHABBAT && <Fragment>
				<ThemeTooltip title={<span>{t(`dashboard.minions.rotating.mode.tip`, { minutes: minion.calibration?.calibrationCycleMinutes })}</span>} enterDelay={100}>
					<RotateRightIcon style={indicatorsStyle} />
				</ThemeTooltip>
			</Fragment>}
		</Grid>
	</div>
}