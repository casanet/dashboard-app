import { useEffect, useState } from 'react';
import { DataService } from "../infrastructure/data-service-base";
import { handleServerRestError } from '../services/notifications.service';

export interface DataHookOptions {
	/** Don't show toast message on data fetch failure */
	skipErrorToastOnFailure?: boolean;
}

/**
 * Data hook, used to get the latest data and rerender in case of data update and also give the fetching mode.
 * Under the hood it's subscribe to the service data on mount and unsubscribe on unmount. 
 * @param dataService The data service to get. 
 * @param defaultValue An default value to get before the data arrived from server.
 * @param options The hook options
 * @returns A a tuple of data and the loading mode, as [data, loading].
 */
export function useData<T>(dataService: DataService<T>, defaultValue?: T, options: DataHookOptions = {}): [T, boolean] {
	// The data state, init with default value of not fetched yet
	const [data, setData] = useState(!dataService.fetchFlag && defaultValue ? defaultValue : dataService.data);
	// The loading state
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		let dataDetacher: () => void;
		// Mark as "loading"
		setLoading(true);
		(async () => {
			try {
				// Subscribe to the data
				dataDetacher = await dataService.attachDataSubs(setData);
			} catch (error) {
				// In case of error, show error toast only if it's not turned off
				if (!options.skipErrorToastOnFailure) {
					await handleServerRestError(error);
				}
			}
			// Mark "loading" OFF
			setLoading(false);
		})();

		return () => {
			// unsubscribe the feed on component unmount
			dataDetacher?.();
		};
	// Run useEffect only once on the component mount
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Return the latest data and loading state 
	return [data, loading];
}
