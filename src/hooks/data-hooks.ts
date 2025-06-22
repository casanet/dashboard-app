import { useEffect, useState } from 'react';
import { DataService } from './data-service-base';

export interface DataHookOptions {
	/** Don't show toast message on data fetch failure */
	skipErrorToastOnFailure?: boolean;
    /** In case of fetching data error, call this callback with the error as a parameter */
    errorHandler?: (error: any) => void;
}

/**
 * Data hook, used to get the latest data and rerender in case of data update and also give the fetching mode.
 * Under the hood it's subscribe to the service data on mount and unsubscribe on unmount.
 * @param dataService The data service to get.
 * @param options The hook options
 * @returns A a collection of data and the loading mode, as [data, loading, error].
 */
export function useData<T>(dataService: DataService<T>, options: DataHookOptions = {}): [T, boolean, boolean] {
	// The data state, init with default value of not fetched yet
	const [data, setData] = useState(dataService.data);
	// The loading state
	const [loading, setLoading] = useState<boolean>(true);
	// The error flag in case of fetch issue
	const [error, setError] = useState<boolean>(false);

	useEffect(() => {
		let dataDetacher: () => void;
		// Mark as "loading"
		setLoading(true);
		(async () => {
			try {
				// Subscribe to the data
				dataDetacher = await dataService.attachDataSubs((data) => {
					setError(false);
					setData(data);
				});
			} catch (error) {
				// Mark as error accrue
				setError(true);
				console.error(`[useData] failed to load data ${JSON.stringify(error)}`);
				if (!options.skipErrorToastOnFailure && options.errorHandler) {
					options.errorHandler(error);
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
	return [data, loading, error];
}