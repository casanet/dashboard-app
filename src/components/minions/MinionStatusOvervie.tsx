import { Grid, Typography, useTheme } from "@material-ui/core";
import { ACModeOptions, FanStrengthOptions, Minion, MinionStatus, MinionTypes, RollerDirection, SwitchOptions } from "../../infrastructure/generated/api";
import { AcMode } from "./AcMode";
import { AcSpeed } from "./AcSpeed";
import { Fragment } from "react";
import '../../theme/styles/components/minions/minionsStatusOverview.scss';
import { getModeColor } from "../../logic/common/themeUtils";
import LightModeIcon from '@mui/icons-material/LightMode';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import PaletteIcon from '@mui/icons-material/Palette';
import { RollerDir } from "./RollerDir";
import { SwitchMode } from "./SwitchMode";
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';

interface StatusOverviewProps {
	minion: Minion;
	fontRatio: number;
	smallFontRatio: number;
}

interface TypeStatusOverviewProps extends StatusOverviewProps {
	isOn: boolean;
}

interface MinionStatusOverviewProps extends StatusOverviewProps {
	showSwitches: boolean;
}

interface TemperatureLightStatusOverviewProps extends TypeStatusOverviewProps {
	hideBrightness?: boolean;
}

/** The factor for the font size to increase in the main item of the overview */
const OVERVIEW_ITEM_SIZE_FACTOR = 1.4;

function SwitchOverview(props: TypeStatusOverviewProps) {

	const toggle = props.minion.minionStatus.switch || props.minion.minionStatus.toggle;

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

	const cleaner = props.minion.minionStatus.cleaner;

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

	const roller = props.minion.minionStatus.roller;

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

	const light = props.minion.minionStatus.colorLight;
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

	const light = props.minion.minionStatus.temperatureLight || props.minion.minionStatus.colorLight;
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

	const light = props.minion.minionStatus.light || props.minion.minionStatus.temperatureLight || props.minion.minionStatus.colorLight;
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

	const airConditioning = props.minion.minionStatus.airConditioning;

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
	const { minion, fontRatio, smallFontRatio } = props;

	const isOn = minion.minionStatus[minion.minionType as unknown as keyof MinionStatus]?.status === SwitchOptions.On;

	return <div className="minion-status-overview-container">
		{props.showSwitches && (minion.minionType === MinionTypes.Switch || minion.minionType === MinionTypes.Toggle) && <SwitchOverview minion={minion} fontRatio={fontRatio} smallFontRatio={smallFontRatio} isOn={isOn} />}
		{minion.minionType === MinionTypes.Light && <LightOverview minion={minion} fontRatio={fontRatio} smallFontRatio={smallFontRatio} isOn={isOn} />}
		{minion.minionType === MinionTypes.TemperatureLight && <TemperatureLightOverview minion={minion} fontRatio={fontRatio} smallFontRatio={smallFontRatio} isOn={isOn} />}
		{minion.minionType === MinionTypes.ColorLight && <ColorLightOverview minion={minion} fontRatio={fontRatio} smallFontRatio={smallFontRatio} isOn={isOn} />}
		{minion.minionType === MinionTypes.AirConditioning && <AirConditioningOverview minion={minion} fontRatio={fontRatio} smallFontRatio={smallFontRatio} isOn={isOn} />}
		{minion.minionType === MinionTypes.Roller && <RollerOverview minion={minion} fontRatio={fontRatio} smallFontRatio={smallFontRatio} isOn={isOn} />}
		{minion.minionType === MinionTypes.Cleaner && <CleanerOverview minion={minion} fontRatio={fontRatio} smallFontRatio={smallFontRatio} isOn={isOn} />}
	</div>
}