class GlobalConfig {
	private baseDashboardUri = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`;

	private channelSession: string;

	public get ChannelSession(): string {
		return this.channelSession || '';
	}

	public set ChannelSession(channelSession: string) {
		this.channelSession = channelSession;
	}

	public get BaseDashboardUri(): string {
		return this.baseDashboardUri;
	}
}

export const globalConfig = new GlobalConfig();
