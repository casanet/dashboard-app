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
