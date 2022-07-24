import { Duration } from "unitsnet-js";
import { SunTriggerOptions, TimingProperties, TimingTypes } from "../../infrastructure/generated/api/swagger/api";

export const mapTimingsTypeToDisplay: { [key in TimingTypes]: string } = {
	[TimingTypes.DailySunTrigger]: 'dashboard.timings.daily.sun.trigger',
	[TimingTypes.DailyTimeTrigger]: 'dashboard.timings.daily.time.trigger',
	[TimingTypes.Once]: 'dashboard.timings.once',
	[TimingTypes.Timeout]: 'dashboard.timings.timeout',
}

/**
 * Build default timing properties
 * @param timingType The timing type to build for
 * @returns The default timing properties
 */
export function defaultTimingProperties(timingType: TimingTypes): TimingProperties {

	const timingProperties: TimingProperties = {};

	switch (timingType) {
		case TimingTypes.DailySunTrigger:
			timingProperties.dailySunTrigger = {
				days: [],
				durationMinutes: 0,
				sunTrigger: SunTriggerOptions.Sunrise,
			};
			break;
		case TimingTypes.DailyTimeTrigger:
			timingProperties.dailyTimeTrigger = {
				days: [],
				hour: 0,
				minutes: 0,
			};
			break;

		case TimingTypes.Once:
			timingProperties.once = {
				date: new Date().getTime() + Duration.FromDays(1).Milliseconds,
			};
			break;
		case TimingTypes.Timeout:
			timingProperties.timeout = {
				startDate: new Date().getTime(),
				durationInMinutes: 60,
			};
			break;
		default:
			break;
	}

	return timingProperties;
}