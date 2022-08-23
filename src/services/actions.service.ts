import { DataService } from "../infrastructure/data-service-base";
import { Action, ApiFacade } from "../infrastructure/generated/api/swagger/api";

class ActionsService extends DataService<Action[]> {

	constructor() {
		super([]);
	}

	fetchData(): Promise<Action[]> {
		// Get the fetch data function (without activating it yet)
		return ApiFacade.ActionsApi.getActions();
	}

	public updateAction(action: Action) {
		const actionIndex = this._data.findIndex(m => m.actionId === action.actionId);
		if (actionIndex !== -1) {
			this._data[actionIndex] = action;
		}
		// Publish the update
		this.postNewData(this._data);
	}

	public createAction(action: Action) {
		this._data.push(action);
		// Publish the update
		this.postNewData(this._data);
	}

	public deleteAction(action: Action) {
		const actionIndex = this._data.findIndex(m => m.actionId === action.actionId);

		if (actionIndex !== -1) {
			this._data.splice(actionIndex, 1);
		}
		// Publish the update
		this.postNewData(this._data);
	}
}

export const actionsService = new ActionsService();
