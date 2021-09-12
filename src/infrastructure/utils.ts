import { Duration } from 'unitsnet-js';

/**
 * Sleep for a given duration time, this will not block the NODD's event loop
 * @param duration The time to sleep
 */
export async function sleep(duration: Duration): Promise<void> {
	return new Promise<void>((res) => {
		setTimeout(() => {
			res();
		}, duration.Milliseconds);
	});
}

/**
 * Check string if it's a valid HTTP one
 * @param string The string to check
 * @returns True if it's a valid one
 */
export function isValidHttpUrl(string: string): boolean {
	let url;
	try {
		url = new URL(string);
	} catch (_) {
		return false;
	}

	return url.protocol === "http:" || url.protocol === "https:";
}