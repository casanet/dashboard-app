import { Grid, IconButton, SvgIcon, Tooltip, Typography, useTheme } from "@material-ui/core";
import { Fragment } from "react";
import { getModeColor } from "../../../logic/common/themeUtils";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTranslation } from "react-i18next";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { ACModeOptions, AirConditioning, FanStrengthOptions, MinionStatus } from "../../../infrastructure/generated/api";
import AcUnitIcon from '@material-ui/icons/AcUnit';
import WavesIcon from '@material-ui/icons/Waves';
import clonedeep from 'lodash.clonedeep';
import { ReactComponent as FanHighIcon } from '../../../theme/icons/fanHigh.svg';
import { ReactComponent as FanMedIcon } from '../../../theme/icons/fanMed.svg';
import { ReactComponent as FanLowIcon } from '../../../theme/icons/fanLow.svg';
import AutoIcon from '@mui/icons-material/HdrAuto';
import { TypeEditStatusProps } from "./MinionEditStatus";

export function EditAirConditioning(props: TypeEditStatusProps) {
	const { t } = useTranslation();
	const theme = useTheme();

	const airConditioning = props.minionStatus.airConditioning || {} as AirConditioning;
	const disabled = props.disabled;

	async function changeMode(nextMode?: ACModeOptions) {
		const minionStatus = clonedeep<MinionStatus>(props.minionStatus);
		if (!minionStatus.airConditioning) {
			// NEED TO BE FIXED IN BE?, ALWAYS SHOULD BE A OBJECT FULL
			minionStatus.airConditioning = {} as AirConditioning;
		}
		minionStatus.airConditioning.mode = nextMode || minionStatus.airConditioning.mode;
		props.setMinionStatus(minionStatus);
	};

	async function changeFan(nextFan?: FanStrengthOptions) {
		const minionStatus = clonedeep<MinionStatus>(props.minionStatus);
		if (!minionStatus.airConditioning) {
			// NEED TO BE FIXED IN BE?, ALWAYS SHOULD BE A OBJECT FULL
			minionStatus.airConditioning = {} as AirConditioning;
		}
		minionStatus.airConditioning.fanStrength = nextFan || minionStatus.airConditioning.fanStrength;
		props.setMinionStatus(minionStatus);
	};

	async function movTemperatureStep(tempStep: number) {
		const minionStatus = clonedeep<MinionStatus>(props.minionStatus);
		if (!minionStatus.airConditioning) {
			// NEED TO BE FIXED IN BE?, ALWAYS SHOULD BE A OBJECT FULL
			minionStatus.airConditioning = {} as AirConditioning;
		}
		minionStatus.airConditioning.temperature += tempStep;
		props.setMinionStatus(minionStatus);
	};

	const fanOptions = [
		<ToggleButton value={FanStrengthOptions.Auto} aria-label={t('dashboard.minions.ac.fan.auto')} style={{ color: getModeColor(props.isOn, theme) }}>
			<Tooltip title={<span>{t('dashboard.minions.ac.fan.auto')}</span>}>
				<AutoIcon />
			</Tooltip>
		</ToggleButton>,
		<ToggleButton value={FanStrengthOptions.Low} aria-label={t('dashboard.minions.ac.fan.low')} style={{ color: getModeColor(props.isOn, theme) }}>
			<Tooltip title={<span>{t('dashboard.minions.ac.fan.low')}</span>}>
				<SvgIcon component={FanLowIcon} viewBox="0 0 607.000000 607.000000" />
			</Tooltip>
		</ToggleButton>,
		<ToggleButton value={FanStrengthOptions.Med} aria-label={t('dashboard.minions.ac.fan.med')} style={{ color: getModeColor(props.isOn, theme) }}>
			<Tooltip title={<span>{t('dashboard.minions.ac.fan.med')}</span>}>
				<SvgIcon component={FanMedIcon} viewBox="0 0 607.000000 607.000000" />
			</Tooltip>
		</ToggleButton>,
		<ToggleButton value={FanStrengthOptions.High} aria-label={t('dashboard.minions.ac.fan.high')} style={{ color: getModeColor(props.isOn, theme) }}>
			<Tooltip title={<span>{t('dashboard.minions.ac.fan.high')}</span>}>
				<SvgIcon component={FanHighIcon} viewBox="0 0 607.000000 607.000000" />
			</Tooltip>
		</ToggleButton>
	];

	return <Fragment>
		<Grid
			container
			direction="column"
			justifyContent="center"
			alignItems="center"
		>
			<Grid
				container
				// Make sure to keep order in RTL view too
				direction={theme.direction === 'ltr' ? 'row' : 'row-reverse'}
				justifyContent="center"
				alignItems="center"
			>
				<div>
					<Grid
						container
						direction="column"
						justifyContent="center"
						alignItems="center"
					>
						<Tooltip title={<span>{t('dashboard.minions.ac.increase.temperature')}</span>}>
							<IconButton
								disabled={disabled || airConditioning?.temperature >= 30}
								style={{ padding: 0 }}
								onClick={() => { movTemperatureStep(1); }}
								color="inherit">
								<ArrowDropUpIcon style={{ fontSize: props.fontRatio * 1.2, color: getModeColor(props.isOn, theme) }} />
							</IconButton>
						</Tooltip>
						<Tooltip title={<span>{t('dashboard.minions.ac.decrease.temperature')}</span>}>
							<IconButton
								disabled={disabled || airConditioning?.temperature <= 16}
								style={{ padding: 0 }} // Make the 'hill' around the button smaller 
								onClick={() => { movTemperatureStep(-1); }}
								color="inherit">
								<ArrowDropDownIcon style={{ fontSize: props.fontRatio * 1.2, color: getModeColor(props.isOn, theme) }} />
							</IconButton>
						</Tooltip>
					</Grid>
				</div>
				<div style={{ marginTop: props.fontRatio * 0.2 }}>
					<Typography style={{ fontSize: props.fontRatio * 2.3, color: getModeColor(props.isOn, theme) }}>{airConditioning?.temperature}°</Typography>
				</div>
				<div style={{ margin: props.smallFontRatio * 0.6 }}>
					<Grid
						container
						direction="column"
						justifyContent="space-between"
						alignItems="flex-start"
					>
						<ToggleButtonGroup
							disabled={disabled}
							orientation="vertical"
							size="small"
							value={airConditioning?.mode}
							exclusive
							onChange={(e, v) => { changeMode(v); }}
						>
							<ToggleButton value={ACModeOptions.Hot} aria-label={t('dashboard.minions.ac.mode.hot')} style={{ color: getModeColor(props.isOn, theme) }}>
								<Tooltip title={<span>{t('dashboard.minions.ac.mode.hot')}</span>}>
									<WavesIcon style={{ transform: 'rotate(-90deg)' }} />
								</Tooltip>
							</ToggleButton>
							<ToggleButton value={ACModeOptions.Cold} aria-label={t('dashboard.minions.ac.mode.cold')} style={{ color: getModeColor(props.isOn, theme) }}>
								<Tooltip title={<span>{t('dashboard.minions.ac.mode.cold')}</span>}>
									<AcUnitIcon />
								</Tooltip>
							</ToggleButton>
						</ToggleButtonGroup>
					</Grid>
				</div>
			</Grid>
			<div style={{ marginTop: `-${props.fontRatio / 2}px`, }}>
				<ToggleButtonGroup
					disabled={disabled}
					orientation="horizontal"
					size="small"
					value={airConditioning?.fanStrength}
					exclusive
					onChange={(e, v) => { changeFan(v); }}
				>
					{theme.direction === 'ltr' ? fanOptions : fanOptions.reverse()}
				</ToggleButtonGroup>
			</div>
		</Grid>
	</Fragment>;
}
