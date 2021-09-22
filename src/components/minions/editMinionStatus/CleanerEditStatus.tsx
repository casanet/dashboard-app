import { Grid, SvgIcon, Tooltip, useTheme } from "@material-ui/core";
import { Fragment } from "react";
import { getModeColor } from "../../../logic/common/themeUtils";
import { useTranslation } from "react-i18next";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { FanStrengthOptions } from "../../../infrastructure/generated/api";
import clonedeep from 'lodash.clonedeep';
import AutoIcon from '@mui/icons-material/HdrAuto';
import { TypeEditStatusProps } from "./MinionEditStatus";
import { ReactComponent as FanHighIcon } from '../../../theme/icons/fanHigh.svg';
import { ReactComponent as FanMedIcon } from '../../../theme/icons/fanMed.svg';
import { ReactComponent as FanLowIcon } from '../../../theme/icons/fanLow.svg';

export function CleanerEditStatus(props: TypeEditStatusProps) {
	const { t } = useTranslation();
	const theme = useTheme();

	const cleaner = props.minionStatus.cleaner;
	const disabled = props.disabled;

	async function changeFan(fanSpeed: FanStrengthOptions) {
		const minionStatus = clonedeep<any>(props.minionStatus);
		if (!minionStatus[props.minionType]) {
			// NEED TO BE FIXED IN BE?, ALWAYS SHOULD BE A OBJECT FULL
			minionStatus[props.minionType] = {};
		}
		minionStatus[props.minionType].fanSpeed = fanSpeed || minionStatus[props.minionType].fanSpeed;
		props.setMinionStatus(minionStatus);
	};

	return <Fragment>
		<Grid
			style={{ marginTop: `${props.smallFontRatio}px` }}
			container
			justifyContent="center"
			alignItems="center"
		>
			<ToggleButtonGroup
				disabled={disabled}
				orientation="horizontal"
				size="medium"
				value={cleaner?.fanSpeed}
				exclusive
				onChange={(e, v) => { changeFan(v); }}
			>
				<ToggleButton value={FanStrengthOptions.Auto} aria-label={t('dashboard.minions.cleaner.fan.auto')} style={{ color: getModeColor(props.isOn, theme) }}>
					<Tooltip title={<span>{t('dashboard.minions.cleaner.fan.auto')}</span>}>
						<AutoIcon style={{ fontSize: props.fontRatio * 0.8 }} />
					</Tooltip>
				</ToggleButton>
				<ToggleButton value={FanStrengthOptions.Low} aria-label={t('dashboard.minions.cleaner.fan.low')} style={{ color: getModeColor(props.isOn, theme) }}>
					<Tooltip title={<span>{t('dashboard.minions.cleaner.fan.low')}</span>}>
						<SvgIcon style={{ fontSize: props.fontRatio * 0.8 }} component={FanLowIcon} viewBox="0 0 607.000000 607.000000" />
					</Tooltip>
				</ToggleButton>
				<ToggleButton value={FanStrengthOptions.Med} aria-label={t('dashboard.minions.cleaner.fan.med')} style={{ color: getModeColor(props.isOn, theme) }}>
					<Tooltip title={<span>{t('dashboard.minions.cleaner.fan.med')}</span>}>
						<SvgIcon style={{ fontSize: props.fontRatio * 0.8 }} component={FanMedIcon} viewBox="0 0 607.000000 607.000000" />
					</Tooltip>
				</ToggleButton>
				<ToggleButton value={FanStrengthOptions.High} aria-label={t('dashboard.minions.cleaner.fan.high')} style={{ color: getModeColor(props.isOn, theme) }}>
					<Tooltip title={<span>{t('dashboard.minions.cleaner.fan.high')}</span>}>
						<SvgIcon style={{ fontSize: props.fontRatio * 0.8 }} component={FanHighIcon} viewBox="0 0 607.000000 607.000000" />
					</Tooltip>
				</ToggleButton>
			</ToggleButtonGroup>
		</Grid>
	</Fragment>;

}
