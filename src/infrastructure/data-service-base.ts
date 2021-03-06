import { SyncEvent } from 'ts-events';
import clonedeep from 'lodash.clonedeep';

/** Implementation of base class for common data fetch and publish as event logic */
export abstract class DataService<T> {

	/**
		 * Collection of all services instances, used to allow forcing reset refetch and so on for all app data
		 */
	private static dataServicesInstances: DataService<any>[] = [];

	/** The data */
	protected _data: T;

	/** The data event publisher event */
	private dataFeed = new SyncEvent<T>();

	/** The lag to detect whenever the data already fetched from the API */
	public fetchFlag = false;

	constructor() {
		// Once services created, add it to the services collection
		DataService.dataServicesInstances.push(this);
	}

	/** Get service data AS IS (without triggering anything :) */
	public get data(): T {
		return this._data;
	}

	/** The child required to implement this function, to fetch the data from the API or any other resource */
	abstract fetchData(): Promise<T>;

	/** Get the date, if it's not fetched yet it will be fetch */
	public async getData(): Promise<T> {
		if (this.fetchFlag) {
			return this._data;
		}
		return await this.forceFetchData();
	}

	/**
	 * Force data hard refresh 
	 * @returns THe new data
	 */
	public async forceFetchData(): Promise<T> {
		try {
			// Fetch the data
			const dataResponse = await this.fetchData();
			// Mark the flag as fetched
			this.fetchFlag = true;
			// Keep the data
			this._data = dataResponse;
			// Publish the new data to the subscribers
			this.dataFeed.post(dataResponse);
			return dataResponse;
		} catch (error) {
			// TODO:LOG

			// Mark flag as false for next time
			this.fetchFlag = false;

			throw error;
		}

	}

	/**
	 * Add subscriber to the data feed
	 * @param callback The function to call when a new data will published
	 * @returns The unsubscribe callback for detacher
	 */
	public async attachDataSubs(callback: (data: T) => void): Promise<() => void> {
		// Add the callback to the feed event
		const detacher = this.dataFeed.attach(callback);
		// Data has been never fetched, do it now, else, just post again the data for the new subscriber
		if (!this.fetchFlag) {
			await this.forceFetchData();
		} else {
			this.dataFeed.post(this._data);
		}
		return detacher;
	}

	/**
	 * Publish and update a new data  
	 * @param data The new data
	 */
	public postNewData(data: T) {
		// First clone the object, to avoid issues in the react state when the object is the same prototype instance
		// and to make sure the changes will do affect any component state
		const clonedData = clonedeep(data);
		// Update and publish the new data
		this._data = clonedData;
		this.dataFeed.post(clonedData);
	}

	/**
	 * Reset data and state
	 */
	public reset() {
		this._data = undefined as unknown as T;
		this.fetchFlag = false;
	}

	/**
	 * Reset all data services
	 */
	public static resetAppData() {
		for (const dataServiceInstance of DataService.dataServicesInstances) {
			dataServiceInstance.reset();
		}
	}
}
