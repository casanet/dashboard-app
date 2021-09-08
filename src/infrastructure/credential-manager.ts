import { envFacade } from './env-facade';
import { getLocalStorageItem, LocalStorageKey, setLocalStorageItem } from './local-storage';

class CredentialsManager {
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
}

export const credentialsManager = new CredentialsManager();
