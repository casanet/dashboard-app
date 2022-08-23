import { getLocalStorageItem, LocalStorageKey, setLocalStorageItem } from "./local-storage";
import { Platform } from "./symbols/global";
import packageJson from "../../package.json";

class EnvFacade {

	/** The local server API URL */
	private _serverUrl = getLocalStorageItem<string>(LocalStorageKey.ServerURL, { itemType: 'string' }) || process.env.REACT_APP_API_URL || '';

	private _mockMode = (!!process.env.REACT_APP_MOCK_API_URL) && (getLocalStorageItem<boolean>(LocalStorageKey.MockMode, { itemType: 'boolean' }) ?? true);

	private _mockModeConst = (!!process.env.REACT_APP_MOCK_MODE) || ((!!process.env.REACT_APP_MOCK_API_URL) && !this.isMobileApp);

	/** The current dashboard URI */
	private _baseDashboardUri: string = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`;

	/** The V3 dashboard path, see https://github.com/casanet/frontend-v3 */
	private _v3DashboardUri: string = process.env.REACT_APP_V3_URL || `/v3`;

	/** The lightweight dashboard path, see https://github.com/casanet/lightweight-dashboard */
	private _lightweightUrl: string = process.env.REACT_APP_LIGHTWEIGHT_URL || `/light-app/index.html`;

	private _localIP = getLocalStorageItem<string>(LocalStorageKey.LocalIP, { itemType: 'string' }) ?? '';

	private _remoteConnection = getLocalStorageItem<boolean>(LocalStorageKey.RemoteConnection, { itemType: 'boolean' }) ?? false;

	private _useLocalConnection = getLocalStorageItem<boolean>(LocalStorageKey.UseLocalConnection, { itemType: 'boolean' }) ?? false;


	public set apiServerBaseUrl(serverUrl: string) {
		// Keep the server URL in mobile apps for farther use
		setLocalStorageItem<string>(LocalStorageKey.ServerURL, serverUrl, { itemType: 'string' });
		this._serverUrl = serverUrl;
	}

	public set mockMode(mockMode: boolean) {
		if (!process.env.REACT_APP_MOCK_API_URL) {
			console.warn(`[EnvFacade.mockMode] Unable to set mock mode, not mock API URL provided via REACT_APP_MOCK_API_URL`);
			return;
		}
		setLocalStorageItem<boolean>(LocalStorageKey.MockMode, mockMode, { itemType: 'boolean' });
		this._mockMode = mockMode;
	}

	public set localIP(localIP: string) {
		if (!this.isMobileApp) {
			console.warn(`[EnvFacade.mockMode] Unable to set local mode in non application`);
			return;
		}
		this._localIP = localIP;
		setLocalStorageItem<string>(LocalStorageKey.LocalIP, localIP, { itemType: 'string' });
	}

	public set remoteConnection(remoteConnection: boolean) {
		this._remoteConnection = remoteConnection;
		setLocalStorageItem<boolean>(LocalStorageKey.RemoteConnection, remoteConnection, { itemType: 'boolean' });
	}

	public set useLocalConnection(useLocalConnection: boolean) {
		if (!this.isMobileApp) {
			console.warn(`[EnvFacade.mockMode] Unable to set useLocalConnection in non application`);
			return;
		}
		this._useLocalConnection = useLocalConnection;
		setLocalStorageItem<boolean>(LocalStorageKey.UseLocalConnection, useLocalConnection, { itemType: 'boolean' });
	}

	public get apiServerBaseUrl(): string {
		// Communicate with the local service directly
		if (this._localIP && this._remoteConnection && this._useLocalConnection) {
			return `http://${this._localIP}/`;
		}

		if (this._mockMode || this._mockModeConst) {
			return process.env.REACT_APP_MOCK_API_URL || '';
		}

		// Use 'this._serverUrl' only edit URL is allowed 
		if (this.allowSetApiServiceURL) {
			return this._serverUrl;
		}
		return process.env.REACT_APP_API_URL || '';
	}

	/**
	 * The API V1 URL
	 */
	public get apiUrl(): string {
		return `${this.apiServerBaseUrl}/API`;
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
		return this._mockMode || this._mockModeConst;
	}

	public get mockModeAvailable(): boolean {
		return !!process.env.REACT_APP_MOCK_API_URL;
	}

	/** Force use only mock, block any attempt to use other URL */
	public get mockModeConst(): boolean {
		return this._mockModeConst;
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

	/** 
	 * Whenever the current Server URL is the Demo URL.
	 * used only on Application that shipped out to the apps store with default API_URL of a mock server
	 */
	public get isDemoApiUrl(): boolean {
		// If it's a mobile app, and the server URL doesn't changed yet by the user.
		return this.isMobileApp && this.mockMode;
	}

	public get platform(): Platform {
		return globalThis.device.platform as Platform;
	}

	public get isMobileApp(): boolean {
		return this.platform !== 'Browser';
	}

	public get bundleVersion(): string {
		return packageJson.version;
	}
}

export const envFacade = new EnvFacade();
