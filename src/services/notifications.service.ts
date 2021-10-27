
import { SyncEvent } from 'ts-events';
import { DEFAULT_ERROR_TOAST_DURATION } from '../infrastructure/consts';
import { ErrorResponse } from '../infrastructure/generated/api';
import { NotificationInfo } from '../infrastructure/symbols/global';

export const notificationsFeed = new SyncEvent<NotificationInfo>();

/** Parse server response message key */
async function parseErrorResponse(errorRes: Response) {

	try {
		// Get the payload
		const payload = await errorRes.json() as ErrorResponse;
		// Make sure it's ErrorResponse json object
		if (!payload || !payload.responseCode) {
			throw errorRes;
		}
		// Return the error
		return `server:${payload.responseCode}`;
	} catch (error) {
		// As last fallback, show the HTTP error or unknown internal error
		return `server:${errorRes?.statusText || '-2'}`;
	}
}

/**
 * Handle error from the API
 * @param error The thrown error 
 * @param showNotification Whenever to show a notification, default is true
 * @returns The i18n key for error
 */
export async function handleServerRestError(error: Response | any, showNotification: boolean = true): Promise<string> {

	let messageKey = 'server:-1';

	// In case of TCP/Network failure
	if (error.message === 'Failed to fetch') {
		// Server is unreachable
		messageKey = 'server:0';
	} else {
		messageKey = await parseErrorResponse(error);
	}

	// Show notification
	if (showNotification) {
		notificationsFeed.post({
			messageKey,
			duration: DEFAULT_ERROR_TOAST_DURATION,
		});
	}

	return messageKey;
}

/**
 * Post error toast based on @see ErrorResponse error
 * @param errorResponse The @see ErrorResponse error
 */
export function postApiError(errorResponse: ErrorResponse) {
	notificationsFeed.post({
		messageKey : `server:${errorResponse.responseCode}`,
		duration: DEFAULT_ERROR_TOAST_DURATION,
	});
}
