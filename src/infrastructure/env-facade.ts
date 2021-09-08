/* eslint-disable no-underscore-dangle */
import { getLocalStorageItem, LocalStorageKey } from './local-storage';

class EnvFacade {
	private _apiUrl?: string = '';
	private _baseDashboardUri: string = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`;

	public get apiUrl(): string {
		return this._apiUrl || '';
	}

	public get baseDashboardUri(): string {
		return this._baseDashboardUri;
	}

	public get isTokenAllowed(): boolean {
		return globalThis.device.platform !== 'Browser';
	}
}

export const envFacade = new EnvFacade();
