import { AppRoutes } from './consts';
import { DataService } from './data-service-base';
import { envFacade } from './env-facade';
import { AuthScopes, User } from './generated/api';
import { getLocalStorageItem, LocalStorageKey, removeLocalStorageItem, setLocalStorageItem } from './local-storage';

class SessionManager {
	public getToken(): string {
		if (envFacade.isTokenAllowed) {
			return getLocalStorageItem<string>(LocalStorageKey.ApiToken, { itemType: 'string' }) || '';
		}
		return '';
	}

	public setToken(token: string) {
		if (envFacade.isTokenAllowed) {
			setLocalStorageItem<string>(LocalStorageKey.ApiToken, token, { itemType: 'string' });
		}
	}

	public onLogin(profile: User) {
		setLocalStorageItem<User>(LocalStorageKey.Profile, profile, { itemType: 'object' });
	}

	public onLogout() {
		removeLocalStorageItem(LocalStorageKey.Profile);
		removeLocalStorageItem(LocalStorageKey.ApiToken);
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
