import { getLocalStorageItem, LocalStorageKey, setLocalStorageItem } from "./local-storage";
import { Platform } from "./symbols/global";

class EnvFacade {

	private _serverUrl = getLocalStorageItem<string>(LocalStorageKey.ServerURL, { itemType: 'string' }) || process.env.REACT_APP_API_URL || '';
	private _baseDashboardUri: string = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`;
	private _v3DashboardUri: string = process.env.REACT_APP_V3_URL || `/v3`;

	public get apiServerUrl(): string {
		return this._serverUrl;
	}

	public set apiServerUrl(serverUrl: string) {
		// TODO: in next prod, disable it for web
		// if (!this.isMobileApp) {
		// 	// TEMP: LOG
		// 	return;
		// }
		// Keep the server URL in mobile apps for farther use
		setLocalStorageItem<string>(LocalStorageKey.ServerURL, serverUrl, { itemType: 'string' });
		this._serverUrl = serverUrl;
	}

	public get apiUrl(): string {
		return `${this._serverUrl}/API`;
	}

	public get baseDashboardUri(): string {
		return this._baseDashboardUri;
	}

	public get v3DashboardUri(): string {
		return this._v3DashboardUri;
	}

	public get isTokenAllowed(): boolean {
		return !!process.env.REACT_APP_LOCAL_DEV;
	}

	public get platform(): Platform {
		return globalThis.device.platform as Platform;
	}

	public get isMobileApp(): boolean {
		return this.platform !== 'Browser';
	}
}

export const envFacade = new EnvFacade();
