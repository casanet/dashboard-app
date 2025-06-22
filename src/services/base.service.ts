import { DataService, DataServiceOptions, LocalCacheMode } from "../hooks/data-service-base";
import { envFacade } from "../infrastructure/env-facade";

export interface DashboardServiceOptions extends DataServiceOptions {
    useDashboardCache?: boolean;
}

export abstract class DashboardService<T> extends DataService<T> {
    constructor(defaultData: T, options?: DashboardServiceOptions) {
        // As default, use local cache for Mobile Application mode only 
        const defaultCacheMode: LocalCacheMode = (options?.useDashboardCache && envFacade.isMobileApp) ? LocalCacheMode.BOOT_ONLY : LocalCacheMode.OFF;
        super(defaultData, {
            localCacheMode: defaultCacheMode,
            ...options,
        });
    }
}