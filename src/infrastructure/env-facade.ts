class EnvFacade {
	private _apiUrl: string = (process.env.REACT_APP_API_URL || '') + '/API';
	private _baseDashboardUri: string = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`;

	public get apiUrl(): string {
		return this._apiUrl;
	}

	public get baseDashboardUri(): string {
		return this._baseDashboardUri;
	}

	public get isTokenAllowed(): boolean {
		return globalThis.device.platform !== 'Browser' || !!process.env.REACT_APP_LOCAL_DEV;
	}
}

export const envFacade = new EnvFacade();
