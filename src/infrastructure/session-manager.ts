import { AppRoutes } from './consts';
import { envFacade } from './env-facade';
import { User } from './generated/api';
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

	public isLoggedOn(): boolean {
		return !!getLocalStorageItem(LocalStorageKey.Profile, { itemType: 'object' }) &&
			(!envFacade.isTokenAllowed || !!getLocalStorageItem(LocalStorageKey.ApiToken, { itemType: 'string' }));
	}

	public onLogin(profile: User) {
		setLocalStorageItem<User>(LocalStorageKey.Profile, profile, { itemType: 'object' });
		window.location.href = `${envFacade.baseDashboardUri}/#${AppRoutes.dashboard.path}`;
	}

	public onLogout() {
		removeLocalStorageItem(LocalStorageKey.Profile);
		removeLocalStorageItem(LocalStorageKey.ApiToken);
		window.location.href = `${envFacade.baseDashboardUri}/#${AppRoutes.login.path}`;
	}
}

export const sessionManager = new SessionManager();
