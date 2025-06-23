import { DataService } from "../hooks/data-service-base";

class TextSearchService extends DataService<string> {

	constructor() {
		super("");
	}

	async fetchData(): Promise<string> {
		return "";
	}
}
export const textSearchService = new TextSearchService();

