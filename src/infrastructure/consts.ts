import { Duration } from 'unitsnet-js';

export const PROJECT_URL = 'https://github.com/casanet';
export const SERVER_REPO_URL = 'https://github.com/casanet/casanet-server';
export const DASHBOARD_REPO_URL = 'https://github.com/casanet/dashboard-app';

/** The interval for checking the liveliness curr state */
export const LIVELINESS_ACK_INTERVAL = Duration.FromSeconds(15);

export const DEFAULT_ERROR_TOAST_DURATION = Duration.FromSeconds(6);

/** Grid cards ration step */
export const GRID_CARDS_RATION_STEP = 0.2;

/** The name of the authentication header  */
export const API_KEY_HEADER = 'authentication';

/** The app router routes */
export const AppRoutes = {
	login: {
		path: '/login',
	},
	dashboard: {
		path: '/dashboard',
	},
}

/** The nested dashboard router routes */
export const DashboardRoutes = {
	minions: {
		path: `${AppRoutes.dashboard.path}/minions`,
		param: 'id',
	},
	users: {
		path: `${AppRoutes.dashboard.path}/users`,
	},
	network: {
		path: `${AppRoutes.dashboard.path}/network`,
	},
	settings: {
		path: `${AppRoutes.dashboard.path}/settings`,
	},
}

/** Make routes readonly */
Object.freeze(AppRoutes);
Object.freeze(DashboardRoutes);

