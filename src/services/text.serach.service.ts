import { DataService } from "../hooks/data-service-base";
import { ApiFacade, User } from "../infrastructure/generated/api/swagger/api";
import { LocalStorageKey, setLocalStorageItem } from "../infrastructure/local-storage";

class TextSearchService extends DataService<string> {

	constructor() {
		super("");
	}

	async fetchData(): Promise<string> {
		return "";
	}
}
export const textSearchService = new TextSearchService();

