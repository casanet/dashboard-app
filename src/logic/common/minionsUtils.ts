import { MinionTypes } from "../../infrastructure/generated/api";

/** Map minions type to the display name i18n key */
export const mapMMinionTypeToDisplay: { [key in MinionTypes]: string } = {
	[MinionTypes.Toggle]: 'dashboard.minions.toggle',
	[MinionTypes.Switch]: 'dashboard.minions.toggle',
	[MinionTypes.AirConditioning]: 'dashboard.minions.air.conditioning',
	[MinionTypes.Light]: 'dashboard.minions.light',
	[MinionTypes.TemperatureLight]: 'dashboard.minions.temperature.light',
	[MinionTypes.ColorLight]: 'dashboard.minions.color.light',
	[MinionTypes.Cleaner]: 'dashboard.minions.cleaner',
	[MinionTypes.Roller]: 'dashboard.minions.roller',
}

interface HMS {
	hours: number;
	minutes: number;
	seconds: number;
}

/**
 * Get ms time duration separated to seconds, minutes and hours.
 * @param timeMs The duration in ms
 * @returns The DMS object
 */
export function msToHMS(timeMs?: number): HMS {
	if (!timeMs) {
		return {
			seconds: 0,
			minutes: 0,
			hours: 0,
		};
	}
	return {
		// To get seconds, remove the ms from the num and than get the first 60 - remove seconds fraction (the seconds in one minute only)
		seconds: (Math.floor(timeMs / 100) / 10) % 60,
		// To get minutes get the number of minutes in the ms - remove minutes fraction, and get the first 60 (the minutes in one hour)
		minutes: Math.floor(timeMs * 0.00001667) % 60,
		// Get the total number of hours in the ms - remove hours fraction
		hours: Math.floor(timeMs * 2.8e-7),
	};
};