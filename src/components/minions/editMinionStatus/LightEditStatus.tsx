import { Grid, IconButton, Slider, Tooltip, Typography, useTheme } from "@material-ui/core";
import { Fragment, useEffect, useState } from "react";
import { getModeColor } from "../../../logic/common/themeUtils";
import { useTranslation } from "react-i18next";
import clonedeep from 'lodash.clonedeep';
import { TypeEditStatusProps } from "./MinionEditStatus";
import LightModeIcon from '@mui/icons-material/LightMode';
import { Stack } from "@mui/material";
import BrightnessHighIcon from '@mui/icons-material/BrightnessHigh';
import BrightnessLowIcon from '@mui/icons-material/BrightnessLow';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import InvertColorsOffIcon from '@mui/icons-material/InvertColorsOff';
import { ColorPicker, useColor, Color, toColor } from "react-color-palette";
import "react-color-palette/lib/css/styles.css";

const presentsMarks = [
	{
		value: 1,
		label: '1%',
	},
	{
		value: 20,
		label: '20%',
	},
	{
		value: 40,
		label: '40%',
	},
	{
		value: 60,
		label: '60%',
	},
	{
		value: 80,
		label: '80%',
	},
	{
		value: 100,
		label: '100%',
	},
];

export function ColorLightEditStatus(props: TypeEditStatusProps) {
	const [color, setColor] = useColor("hex", "#000000");

	const colorLight = props.minionStatus.colorLight;

	useEffect(() => {
		// Once the minionStatus was updated, re-set the color picker
		setColor(toColor('rgb', { r: colorLight?.red || 0, g: colorLight?.green || 0, b: colorLight?.blue || 0 }));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [colorLight?.blue, colorLight?.green, colorLight?.red]);

	const disabled = !!props.disabled;

	async function changeColor(color: Color) {
		if (disabled) {
			return;
		}
		// If in edit mode, just simply keep the change
		setColor(color);
	};

	async function commitColor() {
		if (disabled) {
			return;
		}
		// Once the change committed, send color selection update
		const minionStatus = clonedeep<any>(props.minionStatus);
		if (!minionStatus[props.minionType]) {
			// NEED TO BE FIXED IN BE?, ALWAYS SHOULD BE A OBJECT FULL
			minionStatus[props.minionType] = {};
		}
		minionStatus[props.minionType].red = color.rgb.r;
		minionStatus[props.minionType].green = color.rgb.g;
		minionStatus[props.minionType].blue = color.rgb.b;
		props.setMinionStatus(minionStatus);
	};

	return <Fragment>
		{/* First show the light regular selections (temp & bright) */}
		<TemperatureLightEditStatus {...props} />
		<Grid
			style={{ marginTop: `${props.smallFontRatio / 2}px` }}
			container
			direction="row"
			justifyContent="center"
			alignItems="center"
		>
			{/* Commit changes only when the mouseup (or touch out in mobile), and *do not* commit while still clicking and selecting the color  */}
			<div onMouseUp={() => commitColor()}>
				<ColorPicker width={props.fontRatio * 6} height={props.fontRatio * 2} color={color} onChange={(c) => changeColor(c as Color)} hideHSV hideHEX hideRGB dark />
			</div>
		</Grid>
	</Fragment>;

}

export function TemperatureLightEditStatus(props: TypeEditStatusProps) {
	const { t } = useTranslation();
	const theme = useTheme();
	const [tempSlide, setTempSlide] = useState<number>(0);

	const temperatureLight = props.minionStatus.temperatureLight || props.minionStatus.colorLight;
	const disabled = !!props.disabled;

	useEffect(() => {
		// Once the temp. changed. update the view
		setTempSlide(temperatureLight?.temperature || 0);
	}, [temperatureLight?.temperature]);


	function handleSliderChange(event: any, newValue: number | number[]) {
		setTempSlide(newValue as number);
	};

	function onSliderChangeCommitted(event: any, newValue: number | number[]) {
		changeTemperature(newValue as number);
	};

	async function changeTemperature(temperature: number) {
		const minionStatus = clonedeep<any>(props.minionStatus);

		if (!minionStatus[props.minionType]) {
			// NEED TO BE FIXED IN BE?, ALWAYS SHOULD BE A OBJECT FULL
			minionStatus[props.minionType] = {};
		}
		minionStatus[props.minionType].temperature = temperature;
		props.setMinionStatus(minionStatus);
	};

	return <Fragment>
		{/* First show the light bright */}
		<LightEditStatus {...props} />
		<Grid
			container
			justifyContent="center"
			alignItems="center"
		>
			<Grid
				container
				direction={theme.direction === 'ltr' ? 'row' : 'row-reverse'}
				justifyContent="center"
				alignItems="center"
			>
				<div>
					<Typography style={{ fontSize: props.fontRatio * 1.3, color: getModeColor(props.isOn && !disabled, theme) }}>{temperatureLight?.temperature}</Typography>
				</div>
				<div style={{ margin: props.smallFontRatio * 0.2 }}>
					<Grid
						container
						direction="column"
						justifyContent="space-between"
						alignItems="flex-start"
					>
						<InvertColorsIcon style={{ fontSize: props.smallFontRatio * 0.9, color: getModeColor(props.isOn && !disabled, theme) }} />
						<Typography style={{ fontSize: props.smallFontRatio * 0.9, color: getModeColor(props.isOn && !disabled, theme) }}>%</Typography>
					</Grid>
				</div>
			</Grid>

			<div style={{ width: '80%', marginTop: `-${props.smallFontRatio}px`, height: `${props.fontRatio * 1.2}px` }}>
				<Stack spacing={2} direction="row" alignItems="center">
					<Tooltip title={<span>{t('dashboard.minions.light.decrease.temperature')}</span>}>
						<IconButton
							disabled={disabled}
							onClick={() => tempSlide > 1 && changeTemperature(tempSlide - 1)}
							style={{ padding: props.smallFontRatio * 0.1, color: getModeColor(props.isOn, theme) }}
							color="inherit">
							<InvertColorsOffIcon />
						</IconButton>
					</Tooltip>
					<Slider disabled={disabled} marks={presentsMarks} aria-label={t('dashboard.minions.light.slide.temperature')} min={1} max={100} style={{ color: getModeColor(props.isOn, theme) }} value={tempSlide} onChangeCommitted={onSliderChangeCommitted} onChange={handleSliderChange} />
					<Tooltip title={<span>{t('dashboard.minions.light.increase.temperature')}</span>}>
						<IconButton
							disabled={disabled}
							onClick={() => tempSlide < 100 && changeTemperature(tempSlide + 1)}
							style={{ padding: props.smallFontRatio * 0.1, color: getModeColor(props.isOn, theme) }}
							color="inherit">
							<InvertColorsIcon />
						</IconButton>
					</Tooltip>
				</Stack>
			</div>
		</Grid>
	</Fragment>;

}

export function LightEditStatus(props: TypeEditStatusProps) {
	const { t } = useTranslation();
	const theme = useTheme();
	const [brightSlide, setBrightSlide] = useState<number>(0);

	const light = props.minionStatus.light || props.minionStatus.temperatureLight || props.minionStatus.colorLight;
	const disabled = !!props.disabled;

	useEffect(() => {
		// Once the bright changed. update the view
		setBrightSlide(light?.brightness || 0);
	}, [light?.brightness]);


	function handleSliderChange(event: any, newValue: number | number[]) {
		setBrightSlide(newValue as number);
	};

	function onSliderChangeCommitted(event: any, newValue: number | number[]) {
		changeBrightness(newValue as number);
	};

	async function changeBrightness(brightness: number) {
		const minionStatus = clonedeep<any>(props.minionStatus);
		if (!minionStatus[props.minionType]) {
			// NEED TO BE FIXED IN BE?, ALWAYS SHOULD BE A OBJECT FULL
			minionStatus[props.minionType] = {};
		}
		minionStatus[props.minionType].brightness = brightness;
		props.setMinionStatus(minionStatus);
	};

	return <Fragment>
		<Grid
			container
			justifyContent="center"
			alignItems="center"
		>
			<Grid
				container
				direction={theme.direction === 'ltr' ? 'row' : 'row-reverse'}
				justifyContent="center"
				alignItems="center"
			>
				<div>
					<Typography style={{ fontSize: props.fontRatio * 1.3, color: getModeColor(props.isOn && !disabled, theme) }}>{light?.brightness}</Typography>
				</div>
				<div style={{ margin: props.smallFontRatio * 0.2 }}>
					<Grid
						container
						direction="column"
						justifyContent="space-between"
						alignItems="flex-start"
					>
						<LightModeIcon style={{ fontSize: props.smallFontRatio * 0.9, color: getModeColor(props.isOn && !disabled, theme) }} />
						<Typography style={{ fontSize: props.smallFontRatio * 0.9, color: getModeColor(props.isOn && !disabled, theme) }}>%</Typography>
					</Grid>
				</div>
			</Grid>

			<div style={{ width: '80%', marginTop: `-${props.smallFontRatio}px`, height: `${props.fontRatio * 1.2}px` }}>
				<Stack spacing={2} direction="row" alignItems="center">
					<Tooltip title={<span>{t('dashboard.minions.light.decrease.brightness')}</span>}>
						<IconButton
							disabled={disabled}
							onClick={() => brightSlide > 1 && changeBrightness(brightSlide - 1)}
							style={{ padding: props.smallFontRatio * 0.1, color: getModeColor(props.isOn, theme) }}
							color="inherit">
							<BrightnessLowIcon />
						</IconButton>
					</Tooltip>
					<Slider disabled={disabled} marks={presentsMarks} aria-label={t('dashboard.minions.light.slide.brightness')} min={1} max={100} style={{ color: getModeColor(props.isOn, theme) }} value={brightSlide} onChangeCommitted={onSliderChangeCommitted} onChange={handleSliderChange} />
					<Tooltip title={<span>{t('dashboard.minions.light.increase.brightness')}</span>} >
						<IconButton
							disabled={disabled}
							onClick={() => brightSlide < 100 && changeBrightness(brightSlide + 1)}
							style={{ padding: props.smallFontRatio * 0.1, color: getModeColor(props.isOn, theme) }}
							color="inherit">
							<BrightnessHighIcon />
						</IconButton>
					</Tooltip>
				</Stack>
			</div>
		</Grid>
	</Fragment>;
}
