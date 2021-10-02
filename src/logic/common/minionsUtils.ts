import { ACModeOptions, CleanerMode, FanStrengthOptions, MinionStatus, MinionTypes, RollerDirection, SwitchOptions } from "../../infrastructure/generated/api";

/** Map minions type to the display name i18n key */
export const mapMinionTypeToDisplay: { [key in MinionTypes]: string } = {
	[MinionTypes.Toggle]: 'dashboard.minions.toggle',
	[MinionTypes.Switch]: 'dashboard.minions.switch',
	[MinionTypes.AirConditioning]: 'dashboard.minions.air.conditioning',
	[MinionTypes.Light]: 'dashboard.minions.light',
	[MinionTypes.TemperatureLight]: 'dashboard.minions.temperature.light',
	[MinionTypes.ColorLight]: 'dashboard.minions.color.light',
	[MinionTypes.Cleaner]: 'dashboard.minions.cleaner',
	[MinionTypes.Roller]: 'dashboard.minions.roller',
}

export interface HMS {
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
		seconds: Math.floor(((timeMs / 100) / 10) % 60),
		// To get minutes get the number of minutes in the ms - remove minutes fraction, and get the first 60 (the minutes in one hour)
		minutes: Math.floor(timeMs / 60000) % 60,
		// Get the total number of hours in the ms - remove hours fraction
		hours: Math.floor(timeMs / 3600000),
	};
};

/**
 * Get total ms in a @see HMS object
 * @param hms The HMS object to calc from
 * @returns The total MS
 */
export function HMStoMs(hms?: HMS): number {
	if (!hms) {
		return 0;
	}
	return (hms.hours * 3600000) + (hms.minutes * 60000) + (hms.seconds * 1000);
};

/**
 * Build default minion status properties 
 * @param minionType The minion type to build for
 * @returns THe default status properties
 */
export function defaultMinionStatus(minionType: MinionTypes): MinionStatus {

	const minionStatus: MinionStatus = {};

	switch (minionType) {
		case MinionTypes.Toggle:
			minionStatus.toggle = { status: SwitchOptions.Off };
			break;
		case MinionTypes.Switch:
			minionStatus.switch = { status: SwitchOptions.Off };
			break;
		case MinionTypes.AirConditioning:
			minionStatus.airConditioning = {
				status: SwitchOptions.On,
				fanStrength: FanStrengthOptions.Auto,
				mode: ACModeOptions.Cold,
				temperature: 16
			};
			break;
		case MinionTypes.Light:
			minionStatus.light = {
				status: SwitchOptions.On,
				brightness: 50
			};
			break;
		case MinionTypes.TemperatureLight:
			minionStatus.temperatureLight = {
				status: SwitchOptions.On,
				brightness: 50,
				temperature: 50,
			};
			break;
		case MinionTypes.ColorLight:
			minionStatus.colorLight = {
				status: SwitchOptions.On,
				brightness: 50,
				temperature: 50,
				red: 150,
				green: 100,
				blue: 50
			};
			break;
		case MinionTypes.Roller:
			minionStatus.roller = {
				status: SwitchOptions.On,
				direction: RollerDirection.Down
			};
			break;
		case MinionTypes.Cleaner:
			minionStatus.cleaner = {
				status: SwitchOptions.On,
				fanSpeed: FanStrengthOptions.Auto,
				mode: CleanerMode.Clean,
			};
			break;
	}
	return minionStatus;
}

/**
 * Detect if the given minion status is in ON mode (beside other properties)
 * @param minionType The minion type
 * @param minionStatus The full minion status 
 * @returns True if the status is @see SwitchOptions.On
 */
export function isOnMode(minionType: MinionTypes, minionStatus?: MinionStatus): boolean {
	if (!minionStatus) {
		return false;
	}
	return minionStatus[minionType as unknown as keyof MinionStatus]?.status === SwitchOptions.On;
}