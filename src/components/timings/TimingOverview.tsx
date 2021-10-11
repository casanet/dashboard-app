import { Fragment, useEffect, useState } from "react";
import { DailySunTrigger, DailyTimeTrigger, DaysOptions, OnceTiming, SunTriggerOptions, TimeoutTiming, TimingProperties, TimingTypes } from "../../infrastructure/generated/api";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Grid, Theme, useTheme } from "@material-ui/core";
import { getModeColor, marginLeft } from "../../logic/common/themeUtils";
import { useTranslation } from "react-i18next";
import { Duration } from 'unitsnet-js';
import ModeNightIcon from '@mui/icons-material/ModeNight';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TodayIcon from '@mui/icons-material/Today';
import TimerIcon from '@mui/icons-material/Timer';
import TimerOffIcon from '@mui/icons-material/TimerOff';
import { msToHMS } from "../../logic/common/minionsUtils";
import { TFunction } from "i18next";
import { ThemeTooltip } from "../global/ThemeTooltip";

interface TimingOverviewProps {
	timingType: TimingTypes;
	timingProperties: TimingProperties;
	fontRatio: number;
	disabled?: boolean;
}

/** Build days in week toggle options */
export function daysOptions(t: TFunction, fontRatio: number, theme: Theme, disabled: boolean): JSX.Element[] {
	return [
		<ToggleButton value={DaysOptions.Sunday} aria-label={t('dashboard.timings.days.sunday')} style={{ color: getModeColor(!disabled, theme) }}>
			<ThemeTooltip title={<span>{t('dashboard.timings.days.sunday')}</span>}>
				<span style={{ fontSize: fontRatio }}>{t('dashboard.timings.days.short.sunday')}</span>
			</ThemeTooltip>
		</ToggleButton>,
		<ToggleButton value={DaysOptions.Monday} aria-label={t('dashboard.timings.days.monday')} style={{ color: getModeColor(!disabled, theme) }}>
			<ThemeTooltip title={<span>{t('dashboard.timings.days.monday')}</span>}>
				<span style={{ fontSize: fontRatio }}>{t('dashboard.timings.days.short.monday')}</span>
			</ThemeTooltip>
		</ToggleButton>,
		<ToggleButton value={DaysOptions.Tuesday} aria-label={t('dashboard.timings.days.tuesday')} style={{ color: getModeColor(!disabled, theme) }}>
			<ThemeTooltip title={<span>{t('dashboard.timings.days.tuesday')}</span>}>
				<span style={{ fontSize: fontRatio }}>{t('dashboard.timings.days.short.tuesday')}</span>
			</ThemeTooltip>
		</ToggleButton>,
		<ToggleButton value={DaysOptions.Wednesday} aria-label={t('dashboard.timings.days.wednesday')} style={{ color: getModeColor(!disabled, theme) }}>
			<ThemeTooltip title={<span>{t('dashboard.timings.days.wednesday')}</span>}>
				<span style={{ fontSize: fontRatio }}>{t('dashboard.timings.days.short.wednesday')}</span>
			</ThemeTooltip>
		</ToggleButton>,
		<ToggleButton value={DaysOptions.Thursday} aria-label={t('dashboard.timings.days.thursday')} style={{ color: getModeColor(!disabled, theme) }}>
			<ThemeTooltip title={<span>{t('dashboard.timings.days.thursday')}</span>}>
				<span style={{ fontSize: fontRatio }}>{t('dashboard.timings.days.short.thursday')}</span>
			</ThemeTooltip>
		</ToggleButton>,
		<ToggleButton value={DaysOptions.Friday} aria-label={t('dashboard.timings.days.friday')} style={{ color: getModeColor(!disabled, theme) }}>
			<ThemeTooltip title={<span>{t('dashboard.timings.days.friday')}</span>}>
				<span style={{ fontSize: fontRatio }}>{t('dashboard.timings.days.short.friday')}</span>
			</ThemeTooltip>
		</ToggleButton>,
		<ToggleButton value={DaysOptions.Saturday} aria-label={t('dashboard.timings.days.saturday')} style={{ color: getModeColor(!disabled, theme) }}>
			<ThemeTooltip title={<span>{t('dashboard.timings.days.saturday')}</span>}>
				<span style={{ fontSize: fontRatio }}>{t('dashboard.timings.days.short.saturday')}</span>
			</ThemeTooltip>
		</ToggleButton>
	];
}

export function DailySunTriggerOverview(props: TimingOverviewProps) {
	const { t } = useTranslation();
	const theme = useTheme();

	const dailySunTrigger = props.timingProperties.dailySunTrigger as DailySunTrigger;
	const disabled = !!props.disabled;
	const fontRatio = props.fontRatio;

	const SubEventIcon = dailySunTrigger?.sunTrigger === SunTriggerOptions.Sunrise ? WbTwilightIcon : ModeNightIcon;
	return <Fragment>
		<Grid
			container
			direction="column"
			justifyContent="flex-start"
			alignItems="flex-start"
		>
			<div style={{ marginBottom: props.fontRatio * 0.2 }}>
				<ThemeTooltip title={<span>{t('dashboard.timings.sun.trigger.tip', {
					minutes: Math.abs(dailySunTrigger.durationMinutes),
					relation: dailySunTrigger.durationMinutes <= 0 ? t('global.before') : t('global.after'),
					event: dailySunTrigger.sunTrigger === SunTriggerOptions.Sunrise ? t('global.sunrise') : t('global.sunset')
				})}</span>}>
					<Grid
						container
						direction="row"
						justifyContent="flex-start"
						alignItems="flex-start"
					>
						<SubEventIcon style={{ fontSize: fontRatio, color: getModeColor(!disabled, theme) }} />
						<span style={{ [marginLeft(theme)]: props.fontRatio * 0.5, color: getModeColor(!disabled, theme) }} >{dailySunTrigger.durationMinutes < 0 ? '-' : '+'}{Math.abs(dailySunTrigger.durationMinutes)} {t('global.minutes')}</span>
					</Grid>
				</ThemeTooltip>
			</div>
			<ToggleButtonGroup
				disabled={true}
				orientation="horizontal"
				size="small"
				value={dailySunTrigger?.days}
				exclusive
			>
				{daysOptions(t, fontRatio * 0.4, theme, disabled)}
			</ToggleButtonGroup>
		</Grid>
	</Fragment>;
}

export function DailyTimeTriggerOverview(props: TimingOverviewProps) {
	const { t } = useTranslation();
	const theme = useTheme();

	const dailyTimeTrigger = props.timingProperties.dailyTimeTrigger as DailyTimeTrigger;
	const disabled = !!props.disabled;
	const fontRatio = props.fontRatio;

	return <Fragment>
		<Grid
			container
			direction="column"
			justifyContent="flex-start"
			alignItems="flex-start"
		>
			<div style={{ marginBottom: props.fontRatio * 0.2 }}>
				<Grid
					container
					direction="row"
					justifyContent="flex-start"
					alignItems="flex-start"
				>
					<ScheduleIcon style={{ fontSize: fontRatio, color: getModeColor(!disabled, theme) }} />
					<span style={{ [marginLeft(theme)]: props.fontRatio * 0.5, color: getModeColor(!disabled, theme) }} >{dailyTimeTrigger.hour}:{`${dailyTimeTrigger.minutes}`.padStart(2, '0')}</span>
				</Grid>
			</div>
			<ToggleButtonGroup
				disabled={true}
				orientation="horizontal"
				size="small"
				value={dailyTimeTrigger?.days}
				exclusive
			>
				{daysOptions(t, fontRatio * 0.4, theme, disabled)}
			</ToggleButtonGroup>
		</Grid>
	</Fragment>;
}

export function OnceTimingOverview(props: TimingOverviewProps) {
	const theme = useTheme();

	const onceTiming = props.timingProperties.once as OnceTiming;
	const fontRatio = props.fontRatio;
	const disabled = !!props.disabled;
	const triggerTime = new Date(onceTiming.date);

	return <Fragment>
		<Grid
			container
			direction="column"
			justifyContent="flex-start"
			alignItems="flex-start"
		>
			<div style={{ marginBottom: props.fontRatio * 0.2 }}>
				<Grid
					container
					direction="row"
					justifyContent="flex-start"
					alignItems="flex-start"
				>
					<ScheduleIcon style={{ fontSize: fontRatio, color: getModeColor(!disabled, theme) }} />
					<span style={{ [marginLeft(theme)]: props.fontRatio * 0.5, color: getModeColor(!disabled, theme) }} >{triggerTime.getHours()}:{`${triggerTime.getMinutes()}`.padStart(2, '0')}</span>
				</Grid>
			</div>
			<div>
				<Grid
					container
					direction="row"
					justifyContent="flex-start"
					alignItems="flex-start"
				>
					<TodayIcon style={{ fontSize: fontRatio, color: getModeColor(!disabled, theme) }} />
					<span style={{ [marginLeft(theme)]: props.fontRatio * 0.5, color: getModeColor(!disabled, theme) }} >{triggerTime.toLocaleDateString()}</span>
				</Grid>
			</div>
		</Grid>
	</Fragment>;
}

export function TimeoutTimingOverview(props: TimingOverviewProps) {
	const theme = useTheme();
	const [isPassed, setIsPassed] = useState<boolean>();
	const [triggerIn, setTriggerIn] = useState<Duration>();

	const timeoutTiming = props.timingProperties.timeout as TimeoutTiming;

	useEffect(() => {

		const intervalHandler = setInterval(() => {
			// Calc the time left to the timeout trigger
			const now = Duration.FromMilliseconds(new Date().getTime());
			const durationInMinutes = Duration.FromMinutes(timeoutTiming.durationInMinutes);
			const startDate = Duration.FromMilliseconds(timeoutTiming.startDate);
			const triggerDate = startDate.add(durationInMinutes);

			// Update state only if something has been changed
			const calcTriggerIn = triggerDate.subtract(now);
			if (!triggerIn || !triggerIn.equals(calcTriggerIn)) {
				setTriggerIn(calcTriggerIn);
			}
			const calcIsPassed = now.compareTo(triggerDate) === 1;
			if (isPassed !== calcIsPassed) {
				setIsPassed(calcIsPassed);
			}
		}, 1000);

		return () => {
			intervalHandler && clearInterval(intervalHandler);
		};
	});

	const fontRatio = props.fontRatio;
	const TimeoutIcon = isPassed ? TimerOffIcon : TimerIcon;
	const displayDuration = msToHMS(triggerIn?.Milliseconds || 0);
	const disabled = !!props.disabled;

	// startDate.add

	return <Fragment>
		<Grid
			container
			direction="column"
			justifyContent="flex-start"
			alignItems="flex-start"
		>
			<div>
				<Grid
					container
					direction="row"
					justifyContent="flex-start"
					alignItems="flex-start"
				>
					<TimeoutIcon style={{ fontSize: fontRatio, color: getModeColor(!disabled, theme) }} />
					<span style={{ [marginLeft(theme)]: props.fontRatio * 0.5, color: getModeColor(!disabled, theme) }} >{isPassed
						? <span>--:--:--</span>
						// Show the time left, but in the last second, dont show seconds left, since the server trigger is in sensitivity of minutes and not seconds
						: <span>{`${displayDuration.hours}`.padStart(2, '0')}:{`${displayDuration.minutes}`.padStart(2, '0')}:{`${displayDuration.minutes ? displayDuration.seconds : 0}`.padStart(2, '0')}</span>
					}</span>
				</Grid>
			</div>
		</Grid>
	</Fragment>;
}

export function TimingOverview(props: TimingOverviewProps) {
	const { timingType } = props;
	return <div>
		{timingType === TimingTypes.DailySunTrigger && <DailySunTriggerOverview {...props} />}
		{timingType === TimingTypes.DailyTimeTrigger && <DailyTimeTriggerOverview {...props} />}
		{timingType === TimingTypes.Once && <OnceTimingOverview {...props} />}
		{timingType === TimingTypes.Timeout && <TimeoutTimingOverview {...props} />}
	</div>;
}