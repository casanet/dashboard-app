import { Grid, Typography, useTheme } from "@material-ui/core";
import { ACModeOptions, FanStrengthOptions, MinionStatus, MinionTypes, RollerDirection, SwitchOptions } from "../../../infrastructure/generated/api";
import { AcMode } from "./AcMode";
import { AcSpeed } from "./AcSpeed";
import { Fragment } from "react";
import '../../../theme/styles/components/minions/minionsStatusOverview.scss';
import { getModeColor } from "../../../logic/common/themeUtils";
import LightModeIcon from '@mui/icons-material/LightMode';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import PaletteIcon from '@mui/icons-material/Palette';
import { RollerDir } from "./RollerDir";
import { SwitchMode } from "./SwitchMode";
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';

interface StatusOverviewProps {
	minionStatus: MinionStatus;
	fontRatio: number;
	smallFontRatio: number;
	minionType: MinionTypes;
}

interface TypeStatusOverviewProps extends StatusOverviewProps {
	isOn: boolean;
}

interface MinionStatusOverviewProps extends StatusOverviewProps {
	showSwitches: boolean;
	disabled?: boolean;
}

interface TemperatureLightStatusOverviewProps extends TypeStatusOverviewProps {
	hideBrightness?: boolean;
}

/** The factor for the font size to increase in the main item of the overview */
const OVERVIEW_ITEM_SIZE_FACTOR = 1.4;

export function SwitchOverview(props: TypeStatusOverviewProps) {

	const toggle = props.minionStatus[props.minionType as unknown as keyof MinionStatus];

	return <Fragment>
		<Grid
			className="minion-status-overview-grid"
			container
			justifyContent="center"
			alignItems="center"
		>
			<Fragment><SwitchMode mode={toggle?.status || SwitchOptions.Off} fontRatio={props.fontRatio * OVERVIEW_ITEM_SIZE_FACTOR} isOn={props.isOn} /></Fragment>
		</Grid>
	</Fragment>;
}

function CleanerOverview(props: TypeStatusOverviewProps) {
	const theme = useTheme();

	const cleaner = props.minionStatus.cleaner;

	return <Fragment>
		<Grid
			className="minion-status-overview-grid"
			container
			direction="row"
			justifyContent="space-around"
			alignItems="center"
		>
			<Grid
				container
				direction={theme.direction === 'ltr' ? 'row' : 'row-reverse'}
				justifyContent="center"
				alignItems="center"
			>
				<CleaningServicesIcon style={{ fontSize: props.fontRatio * 1.2, color: getModeColor(props.isOn, theme), marginTop: props.fontRatio * 0.05 }} />
				<Fragment><AcSpeed speed={cleaner?.fanSpeed || FanStrengthOptions.Auto} fontRatio={props.fontRatio * OVERVIEW_ITEM_SIZE_FACTOR} isOn={props.isOn} /></Fragment>
			</Grid>
		</Grid>
	</Fragment>;
}

function RollerOverview(props: TypeStatusOverviewProps) {

	const roller = props.minionStatus.roller;

	roller?.direction as RollerDirection;
	return <Fragment>
		<Grid
			className="minion-status-overview-grid"
			container
			justifyContent="center"
			alignItems="center"
		>
			<Fragment><RollerDir direction={roller?.direction || RollerDirection.Up} fontRatio={props.fontRatio * OVERVIEW_ITEM_SIZE_FACTOR} isOn={props.isOn} /></Fragment>
		</Grid>
	</Fragment>;
}

function ColorLightOverview(props: TypeStatusOverviewProps) {
	const theme = useTheme();

	const light = props.minionStatus.colorLight;
	return <Fragment>
		<Grid
			className="minion-status-overview-grid"
			container
			direction="row"
			justifyContent="space-around"
			alignItems="center"
		>
			<div>
				<LightOverview {...props} />
			</div>
			<div>
				<TemperatureLightOverview {...props} hideBrightness={true} />
			</div>
			<div>
				<Grid
					container
					direction={theme.direction === 'ltr' ? 'row' : 'row-reverse'}
					justifyContent="center"
					alignItems="center"
				>
					<PaletteIcon style={{ fontSize: props.fontRatio * OVERVIEW_ITEM_SIZE_FACTOR, color: !props.isOn ? getModeColor(props.isOn, theme) : `rgb(${light?.red}, ${light?.green}, ${light?.blue})` }} />
				</Grid>
			</div>
		</Grid>
	</Fragment>;
}

function TemperatureLightOverview(props: TemperatureLightStatusOverviewProps) {
	const theme = useTheme();

	const light = props.minionStatus.temperatureLight || props.minionStatus.colorLight;
	return <Fragment>
		<Grid
			className="minion-status-overview-grid"
			container
			direction="row"
			justifyContent="space-around"
			alignItems="center"
		>
			{/* Show the the brightness only if not asked to not do it */}
			{!props.hideBrightness && <div>
				<LightOverview {...props} />
			</div>}
			<div>

				<Grid
					container
					direction={theme.direction === 'ltr' ? 'row' : 'row-reverse'}
					justifyContent="center"
					alignItems="center"
				>
					<div>
						<Typography style={{ fontSize: props.fontRatio * OVERVIEW_ITEM_SIZE_FACTOR, color: getModeColor(props.isOn, theme) }}>{light?.temperature}</Typography>
					</div>
					<div style={{ margin: props.smallFontRatio * 0.2 }}>
						<Grid
							container
							direction="column"
							justifyContent="space-between"
							alignItems="flex-start"
						>
							<InvertColorsIcon style={{ fontSize: props.smallFontRatio * 0.9, color: getModeColor(props.isOn, theme) }} />
							<Typography style={{ fontSize: props.smallFontRatio * 0.9, color: getModeColor(props.isOn, theme) }}>%</Typography>
						</Grid>
					</div>
				</Grid>
			</div>
		</Grid>
	</Fragment>;
}

function LightOverview(props: TypeStatusOverviewProps) {
	const theme = useTheme();

	const light = props.minionStatus.light || props.minionStatus.temperatureLight || props.minionStatus.colorLight;
	return <Fragment>
		<Grid
			className="minion-status-overview-grid"
			container
			direction={theme.direction === 'ltr' ? 'row' : 'row-reverse'}
			justifyContent="center"
			alignItems="center"
		>
			<div>
				<Typography style={{ fontSize: props.fontRatio * OVERVIEW_ITEM_SIZE_FACTOR, color: getModeColor(props.isOn, theme) }}>{light?.brightness}</Typography>
			</div>
			<div style={{ margin: props.smallFontRatio * 0.2 }}>
				<Grid
					container
					direction="column"
					justifyContent="space-between"
					alignItems="flex-start"
				>
					<LightModeIcon style={{ fontSize: props.smallFontRatio * 0.9, color: getModeColor(props.isOn, theme) }} />
					<Typography style={{ fontSize: props.smallFontRatio * 0.9, color: getModeColor(props.isOn, theme) }}>%</Typography>

				</Grid>
			</div>
		</Grid>
	</Fragment>;
}

function AirConditioningOverview(props: TypeStatusOverviewProps) {
	const theme = useTheme();

	const airConditioning = props.minionStatus.airConditioning;

	return <Fragment>
		<Grid
			className="minion-status-overview-grid"
			container
			direction={theme.direction === 'ltr' ? 'row' : 'row-reverse'}
			justifyContent="center"
			alignItems="center"
		>
			<div style={{ marginTop: props.fontRatio * 0.19 }}>
				<Typography style={{ fontSize: props.fontRatio * OVERVIEW_ITEM_SIZE_FACTOR, color: getModeColor(props.isOn, theme) }}>{airConditioning?.temperature}°</Typography>
			</div>
			<div style={{ margin: props.smallFontRatio * 0.6 }}>
				<Grid
					container
					direction="column"
					justifyContent="space-between"
					alignItems="flex-start"
				>
					<Fragment><AcMode mode={airConditioning?.mode || ACModeOptions.Cold} fontRatio={props.smallFontRatio * 1.1} isOn={props.isOn} /></Fragment>
					<Fragment><AcSpeed speed={airConditioning?.fanStrength || FanStrengthOptions.Auto} fontRatio={props.smallFontRatio * 1.1} isOn={props.isOn} /></Fragment>
				</Grid>
			</div>
		</Grid>
	</Fragment>;
}

export function MinionStatusOverview(props: MinionStatusOverviewProps) {
	const { minionStatus, minionType } = props;

	const isOn = !props.disabled && minionStatus[minionType as unknown as keyof MinionStatus]?.status === SwitchOptions.On;

	return <div className="minion-status-overview-container">
		{props.showSwitches && (minionType === MinionTypes.Switch || minionType === MinionTypes.Toggle) && <SwitchOverview {...props} isOn={isOn} />}
		{minionType === MinionTypes.Light && <LightOverview {...props} isOn={isOn} />}
		{minionType === MinionTypes.TemperatureLight && <TemperatureLightOverview {...props} isOn={isOn} />}
		{minionType === MinionTypes.ColorLight && <ColorLightOverview {...props} isOn={isOn} />}
		{minionType === MinionTypes.AirConditioning && <AirConditioningOverview {...props} isOn={isOn} />}
		{minionType === MinionTypes.Roller && <RollerOverview {...props} isOn={isOn} />}
		{minionType === MinionTypes.Cleaner && <CleanerOverview {...props} isOn={isOn} />}
	</div>
}