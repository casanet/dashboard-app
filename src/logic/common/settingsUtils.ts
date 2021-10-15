import { RemoteConnectionStatus } from "../../infrastructure/generated/api";

export const remoteConnectionDisplayKey: { [key in RemoteConnectionStatus]: string } = {
	[RemoteConnectionStatus.ConnectionOK]: 'dashboard.toolbar.remote.connection.ok',
	[RemoteConnectionStatus.LocalServerDisconnected]: 'dashboard.toolbar.remote.connection.local.server.disconnected',
	[RemoteConnectionStatus.NotConfigured]: 'dashboard.toolbar.remote.connection.not.configured',
	[RemoteConnectionStatus.CantReachRemoteServer]: 'dashboard.toolbar.remote.connection.cant.access.remote.server',
	[RemoteConnectionStatus.AuthorizationFail]: 'dashboard.toolbar.remote.connection.auth.failed',
}