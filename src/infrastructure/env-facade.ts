import { getLocalStorageItem, LocalStorageKey, setLocalStorageItem } from "./local-storage";
import { Platform } from "./symbols/global";

class EnvFacade {

	/** The local server API URL */
	private _serverUrl = getLocalStorageItem<string>(LocalStorageKey.ServerURL, { itemType: 'string' }) || process.env.REACT_APP_API_URL || '';

	/** The current dashboard URI */
	private _baseDashboardUri: string = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`;

	/** The V3 dashboard path, see https://github.com/casanet/frontend-v3 */
	private _v3DashboardUri: string = process.env.REACT_APP_V3_URL || `/v3`;

	/** The lightweight dashboard path, see https://github.com/casanet/lightweight-dashboard */
	private _lightweightUrl: string = process.env.REACT_APP_LIGHTWEIGHT_URL || `/light-app/index.html`;

	public get apiServerUrl(): string {
		// Use 'this._serverUrl' only edit URL is allowed 
		if (this.allowSetApiServiceURL) {
			return this._serverUrl;
		}
		return process.env.REACT_APP_API_URL || '';
	}

	public set apiServerUrl(serverUrl: string) {
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

	public get lightweightUrl(): string {
		return this._lightweightUrl;
	}

	/** Is app running under MOCK MODE */
	public get mockMode(): boolean {
		return !!process.env.REACT_APP_MOCK_MODE;
	}

	/** Is app running under DEV MODE */
	public get devMode(): boolean {
		return !!process.env.REACT_APP_LOCAL_DEV;
	}

	public get allowSetApiServiceURL(): boolean {
		// In prod mode, only in mobile user can modify the server API URL no matter what..
		// THIS IS FOR SECURITY!!!!, NO XSS CODE WILL BE ALLOW TO CHANGE THE API URL!!!!
		return this.isMobileApp || this.devMode;
	}

	public get isTokenAllowed(): boolean {
		// For android app, since it's not same-origin the cookie not will be saved by web-kit for http requests
		// Also, the risk for XSS thieves is very low, since it's not a browser, but app with web render 
		return this.isMobileApp || this.devMode || this.mockMode;
	}

	public get platform(): Platform {
		return globalThis.device.platform as Platform;
	}

	public get isMobileApp(): boolean {
		return this.platform !== 'Browser';
	}
}

export const envFacade = new EnvFacade();
