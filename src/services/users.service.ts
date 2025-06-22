import { DataService } from "../hooks/data-service-base";
import { ApiFacade, User } from "../infrastructure/generated/api/swagger/api";
import { LocalStorageKey, setLocalStorageItem } from "../infrastructure/local-storage";

class UsersService extends DataService<User[]> {

	constructor() {
		super([]);
	}

	fetchData(): Promise<User[]> {
		return ApiFacade.UsersApi.getUsers();
	}
}
export const usersService = new UsersService();

class RemoteRegisteredUsersService extends DataService<string[]> {

	constructor() {
		super([]);
	}

	fetchData(): Promise<string[]> {
		return ApiFacade.UsersApi.getRegisteredUsers();
	}
}
export const remoteRegisteredUsersService = new RemoteRegisteredUsersService();

class ProfileService extends DataService<User> {
	async fetchData(): Promise<User> {
		const profile = await ApiFacade.UsersApi.getProfile();
		// Make sure the local storage is up to date on each time the profile fetched from any reason
		setLocalStorageItem<User>(LocalStorageKey.Profile, profile, { itemType: 'object' });
		return profile;
	}
}
export const profileService = new ProfileService();
