import { RemoteConnectionStatus } from "../../infrastructure/generated/api/swagger/api";

export const remoteConnectionDisplayKey: { [key in RemoteConnectionStatus]: string } = {
	[RemoteConnectionStatus.ConnectionOk]: 'dashboard.toolbar.remote.connection.ok',
	[RemoteConnectionStatus.LocalServerDisconnected]: 'dashboard.toolbar.remote.connection.local.server.disconnected',
	[RemoteConnectionStatus.NotConfigured]: 'dashboard.toolbar.remote.connection.not.configured',
	[RemoteConnectionStatus.CantReachRemoteServer]: 'dashboard.toolbar.remote.connection.cant.access.remote.server',
	[RemoteConnectionStatus.AuthorizationFail]: 'dashboard.toolbar.remote.connection.auth.failed',
}