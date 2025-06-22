import { SyncEvent } from 'ts-events';
import clonedeep from 'lodash.clonedeep';

export enum LocalCacheMode {
    OFF = 'OFF',
    FULL = 'FULL',
    BOOT_ONLY = 'BOOT_ONLY',
}

// For non-browser env, implement the most simple cache in RAM.
const localStorageMemoryMap = {} as any;
if (!global.localStorage) {
    global.localStorage = {
        getItem: (key: string) => localStorageMemoryMap[key] ?? null,
        removeItem: (key: string) => { delete localStorageMemoryMap[key] },
        setItem: (key: string, value: string) => { localStorageMemoryMap[key] = value }
    } as any;
}

/**
 * Data service base options
 */
export interface DataServiceOptions {
    /** 
     * Local storage mode, default OFF
     * The cache is common to all instances of a class type inherits from @see DataService
     */
    localCacheMode?: LocalCacheMode;

    /**
     * In case of activating cache, use this key as data key, as default the key is the service name.
     */
    cacheKey?: string;
}

/** Implementation of base class for common data fetch and publish as event logic */
export abstract class DataService<T> {
    /**
     * Collection of all services instances, used to allow forcing reset refetch and so on for all app data
     */
    private static dataServicesInstances: DataService<any>[] = [];

    /** The data */
    protected _data!: T;

    /** The data event publisher event */
    private _dataFeed = new SyncEvent<T>();

    // The data that this service will be reset to
    private _defaultData: T;

    /** The flag to detect whenever the data already fetched from the API */
    private _fetchFlag = false;

    /** The flag to detect whenever the data started fetched process from the API */
    private _fetchStartedFlag = false;

    /** The flag to detect whenever the data started fetched process from the API */
    private _loadFromCache = false;

    /** Service options */
    private _dataServiceOptions: DataServiceOptions = {};

    constructor(defaultData: T = undefined as unknown as T, dataServiceOptions?: DataServiceOptions) {

        // Merge final options default + explicitly
        this._dataServiceOptions = { localCacheMode: LocalCacheMode.OFF, ...dataServiceOptions };

        this._defaultData = defaultData;

        // As default boot data is the default data
        let bootData = this._defaultData;
        // Start loading data sequence
        if (this._dataServiceOptions.localCacheMode !== LocalCacheMode.OFF) {
            const cachedData = this.loadFromCache();
            if (cachedData) {
                bootData = cachedData;
                this._loadFromCache = true;
                if (this._dataServiceOptions.localCacheMode === LocalCacheMode.FULL) {
                    // If full mode only, mark data as fetched
                    this._fetchFlag = true;
                    this._fetchStartedFlag = true;
                }
            }
        }

        // After all calc, set the init value
        this.setData(bootData);
        // Once services created, add it to the services collection
        DataService.dataServicesInstances.push(this);
    }

    /** Get a copy of service data AS IS (without triggering anything :) */
    public get data(): T {
        return clonedeep(this._data);
    }

    /** Get the default data */
    public get defaultData(): T {
        // Return a full copy and not the ref, to make sure the default not modified by mistake  
        return clonedeep(this._defaultData);
    }

    /** The flag to detect whenever the data already fetched from the API */
    public get fetchFlag(): boolean {
        return this._fetchFlag;
    }

    /** The flag to detect whenever the data started fetched process from the API */
    public get fetchStartedFlag(): boolean {
        return this._fetchStartedFlag;
    }

    /** The child required to implement this function, to fetch the data from the API or any other resource */
    protected abstract fetchData(): Promise<T>;

    /** Get the date, if it's not fetched yet it will be fetch */
    public async getData(): Promise<T> {
        if (this._fetchFlag) {
            return this._data;
        }
        return await this.forceFetchData();
    }

    /**
     * Force data hard refresh
     * @returns The new data
     */
    public async forceFetchData(): Promise<T> {
        try {
            this._fetchStartedFlag = true;
            // Fetch the data
            const dataResponse = await this.fetchData();
            // Mark the flag as fetched
            this._fetchFlag = true;
            // Keep the data
            this.setData(dataResponse);
            this._loadFromCache = false;
            // Publish the new data to the subscribers
            this._dataFeed.post(dataResponse);
            return dataResponse;
        } catch (error) {
            // TODO:LOG

            // Mark flag as false for next time
            this._fetchFlag = false;
            this._fetchStartedFlag = false;
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
        const detacher = this._dataFeed.attach(callback);

        if (this._loadFromCache) {
            // Load in the data in the *background* if not yet triggered
            if (!this._fetchStartedFlag) {
                this.forceFetchData();
            }
            // And anyway post the current cached data for now
            this._dataFeed.post(this.data);
        } else if (!this._fetchStartedFlag) { // Data has been never fetched, do it now, else, just post again the data for the new subscriber
            await this.forceFetchData();
        } else if (this._fetchFlag) {
            this._dataFeed.post(this.data);
        }
        return detacher;
    }

    /**
     * Trigger load, and await for it if not yet fetched
     */
    public async triggerLoad(): Promise<void> {
        // Data has been never fetched, do it now, else, just post again the data for the new subscriber
        if (!this._fetchStartedFlag && !this._fetchFlag) {
            await this.forceFetchData();
        }
    }

    /**
     * Await till the data will be fetch
     */
    public async awaitToLoad(): Promise<void> {
        return new Promise<void>((res, rej) => {
            if (this._fetchFlag) {
                res();
                return;
            }
            const detacher = this._dataFeed.attach(() => {
                detacher();
                res();
            });
        });
    }

    /**
     * Publish and update a new data
     * @param data The new data
     */
    public postNewData(data: T) {
        // Update and publish the new data
        this.setData(data);
        this._fetchFlag = true;
        this._fetchStartedFlag = true;
        this._loadFromCache = false;
        this._dataFeed.post(clonedeep(data));
    }

    /**
     * Reset data and state
     */
    public reset() {
        this.setData(this._defaultData);
        localStorage?.removeItem?.(this.getServiceCacheKey());
        this._fetchFlag = false;
        this._fetchStartedFlag = false;
        this._loadFromCache = false;
    }

    /**
     * Reset all data services
     */
    public static resetAppData() {
        for (const dataServiceInstance of DataService.dataServicesInstances) {
            dataServiceInstance.reset();
        }
    }

    /**
     * Get service instance type cache key
     */
    private getServiceCacheKey() {
        return `DataService_${this._dataServiceOptions.cacheKey || this.constructor.name}`;
    }

    /**
     * Set service data
     * @param data The data to set
     */
    private setData(data: T) {
        // First clone the object, to avoid issues in the react state when the object is the same prototype instance
        // and to make sure the changes will do affect any component state
        this._data = clonedeep(data);
        if (this._dataServiceOptions.localCacheMode !== LocalCacheMode.OFF) {
            localStorage?.setItem?.(this.getServiceCacheKey(), JSON.stringify(data));
        }
    }

    /**
     * Load data from local cache
     * @returns The data or undefined if nothing cached
     */
    private loadFromCache() {
        const rawData = localStorage?.getItem?.(this.getServiceCacheKey());
        if (rawData === null) {
            return undefined;
        }
        try {
            const cachedData = JSON.parse(rawData);
            return cachedData;
        } catch (error) {
            return undefined;
        }
    }
}