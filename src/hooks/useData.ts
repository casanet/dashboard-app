import { handleServerRestError } from '../services/notifications.service';
import { DataService, useData as originalUseData } from 'frontal-data-manager';

export interface DataHookOptions {
	/** Don't show toast message on data fetch failure */
	skipErrorToastOnFailure?: boolean;
}

/**
 * Data hook, wrapping the @see useData from 'frontal-data-manager' package, just with injection to generic errorHandler by @see handleServerRestError
 * @param dataService The data service to get.
 * @param options The hook options
 * @returns A a collection of data and the loading mode, as [data, loading, error].
 */
export function useData<T>(dataService: DataService<T>, options: DataHookOptions = {}): [T, boolean, boolean] {
	const [data, loading, error] = originalUseData(dataService, { ...options, errorHandler: handleServerRestError });
	// Return the latest data and loading state
	return [data, loading, error];
}