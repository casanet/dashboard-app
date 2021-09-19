import { Grid, SvgIcon, Tooltip, useTheme } from "@material-ui/core";
import { CSSProperties, Fragment } from "react";
import { CalibrationMode, Minion } from "../../infrastructure/generated/api";
import { useTranslation } from "react-i18next";
import LockIcon from '@mui/icons-material/Lock';
import NetworkIssueIcon from '@mui/icons-material/SignalWifiStatusbarConnectedNoInternet4';
import { ReactComponent as ShabbatIcon } from '../../theme/icons/shabbat.svg';
import AdjustIcon from '@mui/icons-material/Adjust';

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
				<Tooltip title={<span>{t('dashboard.minions.communication.error.tip')}</span>} enterDelay={100}>
					<NetworkIssueIcon style={indicatorsStyle} />
				</Tooltip>
			</Fragment>}
			{syncOn && minion.calibration?.calibrationMode === CalibrationMode.AUTO && <Fragment>
				<Tooltip title={<span>{t('dashboard.minions.calibration.tip', { minutes: minion.calibration?.calibrationCycleMinutes })}</span>} enterDelay={100}>
					<AdjustIcon style={indicatorsStyle} />
				</Tooltip>
			</Fragment>}
			{syncOn && (minion.calibration?.calibrationMode === CalibrationMode.LOCKON || minion.calibration?.calibrationMode === CalibrationMode.LOCKOFF) && <Fragment>
				<Tooltip title={<span>{t(`dashboard.minions.lock.${minion.calibration?.calibrationMode === CalibrationMode.LOCKON ? 'on' : 'off'}.tip`)}</span>} enterDelay={100}>
					<LockIcon style={indicatorsStyle} />
				</Tooltip>
			</Fragment>}
			{syncOn && minion.calibration?.calibrationMode === CalibrationMode.SHABBAT && <Fragment>
				<Tooltip title={<span>{t(`dashboard.minions.shabbat.mode.tip`, { minutes: minion.calibration?.calibrationCycleMinutes })}</span>} enterDelay={100}>
					<SvgIcon component={ShabbatIcon} style={indicatorsStyle} viewBox="0 0 1600.000000 1600.000000" />
				</Tooltip>
			</Fragment>}
		</Grid>
	</div>
}