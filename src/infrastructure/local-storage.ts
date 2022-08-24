export enum LocalStorageKey {
	Profile = 'PROFILE',
	ApiToken = 'API_TOKEN',
	Theme = 'THEME',
	Lang = 'LANG',
	CollapseMenu = 'COLLAPSE_MENU',
	CollapseAppToolbar = 'COLLAPSE_APP_TOOLBAR',
	CollapsePageToolbar = 'COLLAPSE_PAGE_TOOLBAR',
	MinionsCardRatio = 'MINION_CARD_RATIO',
	ServerURL = 'SERVER_URL',
	MockMode = 'MOCK_MODE',
	RemoteConnection = 'REMOTE_CONNECTION',
	LocalIP = 'LOCAL_IP',
	UseLocalConnection = 'USE_LOCAL_CONNECTION',
}

export interface LocalStorageItemOptions {
	itemType: 'number' | 'string' | 'object' | 'boolean';
}

export function getLocalStorageItem<T>(localStorageKey: LocalStorageKey, LocalStorageItemOptions: LocalStorageItemOptions): T | undefined {
	const rawItem = localStorage.getItem(localStorageKey);

	if (rawItem === null) {
		return undefined;
	}

	switch (LocalStorageItemOptions.itemType) {
		case 'string':
			return rawItem as unknown as T;
		case 'number':
			return parseFloat(rawItem) as unknown as T;
		case 'object':
			return JSON.parse(rawItem) as T;
		case 'boolean':
			return (rawItem === 'true') as unknown as T;
		default:
			return JSON.parse(rawItem) as T;
	}
}

export function setLocalStorageItem<T>(localStorageKey: LocalStorageKey, value: T, LocalStorageItemOptions: LocalStorageItemOptions): void {
	let stringToStore: string;

	switch (LocalStorageItemOptions.itemType) {
		case 'string':
			stringToStore = value as unknown as string;
			break;
		case 'number':
		case 'boolean':
			stringToStore = `${value}`;
			break;
		case 'object':
			stringToStore = JSON.stringify(value);
			break;
		default:
			stringToStore = JSON.stringify(value);
	}

	localStorage.setItem(localStorageKey, stringToStore);
}

export function removeLocalStorageItem(localStorageKey: LocalStorageKey): void {
	localStorage.removeItem(localStorageKey);
}
