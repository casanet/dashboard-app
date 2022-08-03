import { Fragment, useEffect, useState } from "react";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Grid, useTheme } from "@material-ui/core";
import { getModeColor } from "../../logic/common/themeUtils";
import { useTranslation } from "react-i18next";
import ModeNightIcon from '@mui/icons-material/ModeNight';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import TextField from "@mui/material/TextField";
import { daysOptions } from "./TimingOverview";
import DesktopTimePicker from "@mui/lab/DesktopTimePicker";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import enLocale from 'date-fns/locale/en-US';
import heLocale from 'date-fns/locale/he';

import DesktopDateTimePicker from "@mui/lab/DesktopDateTimePicker";
import { ThemeTooltip } from "../global/ThemeTooltip";
import { DaysOptions, SunTriggerOptions, TimingProperties, TimingTypes } from "../../infrastructure/generated/api/swagger/api";
import { getLang } from "../../services/localization.service";

// HACK to force desktop view for all, till this bug https://github.com/mui/mui-x/issues/5561 fix will be published
const TimePicker = DesktopTimePicker as any;
const DateTimePicker = DesktopDateTimePicker as any;

// TODO: Once this logic will be used in other component too, move to to app index
// get lang and set time picker to be shown with the correct lang
const lang = getLang();

let datePickerLocal = enLocale;

switch (lang.langCode) {
	case 'he':
		datePickerLocal = heLocale;
		break;
}

interface TimingEditProps {
	timingType: TimingTypes;
	timingProperties: TimingProperties;
	setTimingProperties: (timingProperties: TimingProperties) => void;
	fontRatio: number;
	disabled?: boolean;
}

export function DailySunTriggerEdit(props: TimingEditProps) {
	const { t } = useTranslation();
	const theme = useTheme();
	const [sunTrigger, setSunTrigger] = useState<SunTriggerOptions>(props.timingProperties?.dailySunTrigger?.sunTrigger || SunTriggerOptions.Sunrise);
	const [days, setDays] = useState<DaysOptions[]>(props.timingProperties?.dailySunTrigger?.days || []);
	const [durationMinutes, setDurationMinutes] = useState<number>(props.timingProperties?.dailySunTrigger?.durationMinutes || 0);
	const [durationInputValue, setDurationInputValue] = useState<string>(`${durationMinutes}`);

	function sendTimingProperties(durationMinutes: number, sunTrigger: SunTriggerOptions, days: DaysOptions[]) {
		props.setTimingProperties({
			dailySunTrigger: {
				durationMinutes,
				sunTrigger,
				days: [...days], // make sure to copy and not send ref
			}
		})
	}

	return <Grid
		container
		direction="column"
		justifyContent="center"
		alignItems="center"
	>
		<Grid
			style={{ marginBottom: props.fontRatio }}
			container
			direction="row"
			justifyContent="center"
			alignItems="center"
		>
			<ToggleButtonGroup
				disabled={props.disabled}
				orientation="horizontal"
				size="small"
				value={sunTrigger}
				onChange={(e, v) => {
					if (!v) {
						return;
					}
					setSunTrigger(v);
					sendTimingProperties(durationMinutes, v, days);
				}}
				exclusive
			>
				<ToggleButton value={SunTriggerOptions.Sunrise} aria-label={t('global.sunrise')} style={{ color: getModeColor(true, theme) }}>
					<ThemeTooltip title={<span>{t('global.sunrise')}</span>}>
						<WbTwilightIcon />
					</ThemeTooltip>
				</ToggleButton>
				<ToggleButton value={SunTriggerOptions.Sunset} aria-label={t('global.sunset')} style={{ color: getModeColor(true, theme) }}>
					<ThemeTooltip title={<span>{t('global.sunset')}</span>}>
						<ModeNightIcon />
					</ThemeTooltip>
				</ToggleButton>
			</ToggleButtonGroup>
			{/* Put some distance between */}
			<div style={{ width: props.fontRatio * 2 }}></div>
			<TextField
				disabled={props.disabled}
				style={{ width: props.fontRatio * 6 }}
				variant="standard"
				id="outlined-number"
				label={t('dashboard.timings.sun.trigger.minutes.duration.label')}
				type="number"
				value={durationInputValue}
				InputLabelProps={{
					shrink: true,
				}}
				onChange={(e) => {
					const rawValue = e.target.value;
					setDurationInputValue(rawValue);
					const newDuration = parseInt(rawValue, 10);
					if (isNaN(newDuration)) {
						return;
					}
					setDurationMinutes(newDuration);
					sendTimingProperties(newDuration, sunTrigger, days);
				}}
			/>
		</Grid>
		<ToggleButtonGroup
			disabled={props.disabled}
			orientation="horizontal"
			size="small"
			value={days}
			exclusive
			onChange={(e, v) => {
				let newDays: DaysOptions[];
				if (!days.includes(v)) {
					newDays = [...days, v];
				} else {
					newDays = days.filter(d => d !== v);
				}
				setDays(newDays);
				sendTimingProperties(durationMinutes, sunTrigger, newDays);
			}}
		>
			{daysOptions(t, props.fontRatio * 0.73, theme, false)}
		</ToggleButtonGroup>
	</Grid>;
}

export function DailyTimeTriggerEdit(props: TimingEditProps) {
	const { t } = useTranslation();
	const theme = useTheme();
	const [days, setDays] = useState<DaysOptions[]>(props.timingProperties?.dailyTimeTrigger?.days || []);
	const [time, setTime] = useState<Date>(new Date(0, 0, 0, props.timingProperties?.dailyTimeTrigger?.hour || 0, props.timingProperties?.dailyTimeTrigger?.minutes || 0, 0, 0));

	function sendTimingProperties(hour: number, minutes: number, days: DaysOptions[]) {
		props.setTimingProperties({
			dailyTimeTrigger: {
				hour,
				minutes,
				days: [...days], // make sure to copy and not send the ref
			}
		})
	}

	return <Grid
		container
		direction="column"
		justifyContent="center"
		alignItems="center"
	>
		<Grid
			style={{ marginBottom: props.fontRatio }}
			container
			direction="row"
			justifyContent="center"
			alignItems="center"
		>
			{/* Use french time, since they use 24 hours clock */}
			<LocalizationProvider dateAdapter={AdapterDateFns} locale={datePickerLocal}>
				<TimePicker
					cancelText={t('global.cancel')}
					okText={t('global.apply')}
					clearText={t('dashboard.timings.clear-time')}
					todayText={t('dashboard.timings.today')}
					toolbarTitle={t('dashboard.timings.select.time')}
					disabled={props.disabled}
					value={time}
					onChange={(newTime: Date) => {
						if (!newTime) {
							return;
						}
						setTime(newTime);
						sendTimingProperties(newTime?.getHours() || 0, newTime?.getMinutes() || 0, days);
					}}
					renderInput={(params: any) => <TextField {...params} />}
				/>
			</LocalizationProvider>
		</Grid>
		<ToggleButtonGroup
			disabled={props.disabled}
			orientation="horizontal"
			size="small"
			value={days}
			exclusive
			onChange={(e, v) => {
				let newDays: DaysOptions[];
				if (!days.includes(v)) {
					newDays = [...days, v];
				} else {
					newDays = days.filter(d => d !== v);
				}
				setDays(newDays);
				sendTimingProperties(time?.getHours() || 0, time?.getMinutes() || 0, newDays);
			}}
		>
			{daysOptions(t, props.fontRatio * 0.73, theme, false)}
		</ToggleButtonGroup>
	</Grid>;
}

export function OnceTimingEdit(props: TimingEditProps) {
	const { t } = useTranslation();

	const [time, setTime] = useState<Date>(new Date());

	useEffect(() => {
		// Once the data has changed, set the time state
		setTime(props.timingProperties?.once?.date ? new Date(props.timingProperties?.once?.date) : new Date());
	}, [props.timingProperties?.once?.date]);

	function sendTimingProperties(date: Date) {
		props.setTimingProperties({
			once: {
				date: date.getTime()
			}
		})
	}

	return <Grid
		style={{ minHeight: props.fontRatio * 6 }}
		container
		direction="row"
		justifyContent="center"
		alignItems="center"
	>
		{/* Use french time, since they use 24 hours clock */}
		<LocalizationProvider dateAdapter={AdapterDateFns} locale={datePickerLocal}>
			<DateTimePicker
				cancelText={t('global.cancel')}
				okText={t('global.apply')}
				clearText={t('dashboard.timings.clear-time')}
				todayText={t('dashboard.timings.today')}
				toolbarTitle={t('dashboard.timings.select.date.and.time')}
				disabled={props.disabled}
				value={time}
				onChange={(newValue: Date) => {
					if (!newValue) {
						return;
					}
					setTime(newValue);
					sendTimingProperties(newValue);
				}}
				renderInput={(params: any) => <TextField {...params} />}
			/>
		</LocalizationProvider>
	</Grid>
}

export function TimeoutTimingEdit(props: TimingEditProps) {
	const { t } = useTranslation();
	const [value, setValue] = useState<Date>(new Date());
	const [durationInMinutes, setDurationInMinutes] = useState<number>(props.timingProperties?.timeout?.durationInMinutes || 1);

	useEffect(() => {
		// Once the start data has changed, set the value state
		setValue(props.timingProperties?.timeout?.startDate ? new Date(props.timingProperties?.timeout?.startDate) : new Date());
	}, [props.timingProperties?.timeout?.startDate]);

	function sendTimingProperties(startDate: Date, durationInMinutes: number) {
		props.setTimingProperties({
			timeout: {
				durationInMinutes,
				startDate: startDate.getTime(),
			}
		})
	}

	return <Grid
		container
		direction="column"
		justifyContent="center"
		alignItems="center"
	>
		<Grid
			style={{ marginBottom: props.fontRatio * 0.8 }}
			container
			direction="column"
			justifyContent="center"
			alignItems="center"
		>
			<LocalizationProvider dateAdapter={AdapterDateFns} locale={datePickerLocal}>
				<DateTimePicker
					cancelText={t('global.cancel')}
					okText={t('global.apply')}
					clearText={t('dashboard.timings.clear-time')}
					todayText={t('dashboard.timings.today')}
					toolbarTitle={t('dashboard.timings.select.date.and.timed')}
					disabled={props.disabled}
					value={value}
					onChange={(newValue: Date) => {
						if (!newValue) {
							return;
						}
						setValue(newValue);
						sendTimingProperties(newValue, durationInMinutes);
					}}
					renderInput={(params: any) => <TextField {...params} label={t('dashboard.timings.timeout.start.in.label')} />}
				/>
			</LocalizationProvider>
		</Grid>
		<TextField
			disabled={props.disabled}
			variant="standard"
			label={t('dashboard.timings.timeout.minutes.label')}
			type="number"
			value={durationInMinutes}
			inputProps={{
				min: 1
			}}
			InputLabelProps={{
				shrink: true,
			}}
			onChange={(e) => {
				const newDuration = parseInt(e.target.value, 10);
				setDurationInMinutes(newDuration);
				sendTimingProperties(value, newDuration);
			}}
		/>
	</Grid>;
}

export function TimingEdit(props: TimingEditProps) {
	const { timingType } = props;
	return <Fragment>
		{timingType === TimingTypes.DailySunTrigger && <DailySunTriggerEdit {...props} />}
		{timingType === TimingTypes.DailyTimeTrigger && <DailyTimeTriggerEdit {...props} />}
		{timingType === TimingTypes.Once && <OnceTimingEdit {...props} />}
		{timingType === TimingTypes.Timeout && <TimeoutTimingEdit {...props} />}
	</Fragment>;
}