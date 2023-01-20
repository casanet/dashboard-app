import { DataService } from 'frontal-data-manager';
import { AppRoutes } from './consts';
import { envFacade } from './env-facade';
import { AuthScopes, User } from './generated/api/swagger/api';
import { getLocalStorageItem, LocalStorageKey, removeLocalStorageItem, setLocalStorageItem } from './local-storage';

class SessionManager {

	private tokenCache: string;
	private localTokenCache: string;

	constructor() {
		// Load token, just to avoid calls to the browser API
		this.tokenCache = getLocalStorageItem<string>(LocalStorageKey.ApiToken, { itemType: 'string' }) || '';
		this.localTokenCache = getLocalStorageItem<string>(LocalStorageKey.LocalApiToken, { itemType: 'string' }) || '';
	}

	public getToken(): string {
		if (!envFacade.isTokenAllowed) {
			return '';
		}

		if (envFacade.useLocalConnection) {
			return this.getLocalToken();
		}

		return this.tokenCache;
	}

	public getLocalToken(): string {
		if (!envFacade.useLocalConnection) {
			return '';
		}
		return this.localTokenCache;
	}

	public setToken(token: string) {
		setLocalStorageItem<string>(LocalStorageKey.ApiToken, token, { itemType: 'string' });
		this.tokenCache = token;

		// If connection as local, while login to remote is available, keep the local session as well.
		if (envFacade.localConnectionAvailable) {
			// Take the JWT session from remote server, and extract the payload, within it, there is the local server session. 
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const [header, base64Payload, signature] = token.split('.');
			// Decode the JWT payload
			const payloadText = atob(base64Payload);
			// Parse it to JSON
			const payload = JSON.parse(payloadText);
			// Keep the session
			this.localTokenCache = payload.session;
			setLocalStorageItem<string>(LocalStorageKey.LocalApiToken, payload.session, { itemType: 'string' });
		}
	}

	public onLogin(profile: User) {
		setLocalStorageItem<User>(LocalStorageKey.Profile, profile, { itemType: 'object' });
	}

	public onLogout() {
		removeLocalStorageItem(LocalStorageKey.Profile);
		removeLocalStorageItem(LocalStorageKey.ApiToken);
		removeLocalStorageItem(LocalStorageKey.LocalApiToken);
		this.tokenCache = '';
		this.localTokenCache = '';
		envFacade.onLogout();
		DataService.resetAppData();
		window.location.href = `${envFacade.baseDashboardUri}/#${AppRoutes.login.path}`;
	}

	public get isLoggedOn(): boolean {
		return !!getLocalStorageItem(LocalStorageKey.Profile, { itemType: 'object' }) &&
			(!envFacade.isTokenAllowed || !!getLocalStorageItem(LocalStorageKey.ApiToken, { itemType: 'string' }));
	}

	/** 
	 * Detect whenever current session is an admin one.
	 * (P.S. this is not a real check with the BE, only and *only* for UI purpose)
	 */
	public get isAdmin(): boolean {
		return (getLocalStorageItem<User>(LocalStorageKey.Profile, { itemType: 'object' }))?.scope === AuthScopes.AdminAuth;
	}

	/**
	 * Current user session scope
	 * (P.S. this is not a real check with the BE, only and *only* for UI purpose)
	 */
	public get scope(): AuthScopes {
		return (getLocalStorageItem<User>(LocalStorageKey.Profile, { itemType: 'object' }))?.scope || AuthScopes.UserAuth;
	}
}

export const sessionManager = new SessionManager();
