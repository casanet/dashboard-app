import { Duration } from 'unitsnet-js';

export const PROJECT_URL = 'https://github.com/casanet';
export const SERVER_REPO_URL = 'https://github.com/casanet/casanet-server';
export const DASHBOARD_REPO_URL = 'https://github.com/casanet/dashboard-app';

export const CONTACT_EMAIL = 'haim.kastner@gmail.com';
export const CONTACT_TWITTER = 'https://twitter.com/hkastnet';
export const CONTACT_GITHUB = 'https://github.com/haimkastner';

/** THe password min length */
export const PASSWORD_MIN_LENGTH = 8;

/** The remote server authentication key length */
export const REMOTE_SERVER_AUTH_KEY_LENGTH = 64;

/** The interval for checking the liveliness curr state */
export const LIVELINESS_ACK_INTERVAL = Duration.FromSeconds(15);

export const DEFAULT_ERROR_TOAST_DURATION = Duration.FromSeconds(6);

/** THe default time duration for success icon in a button */
export const DEFAULT_SUCCEED_ICON_SHOWN = Duration.FromSeconds(2.5);

/** Grid cards ration step */
export const GRID_CARDS_RATION_STEP = 0.2;

/** THe default font size */
export const DEFAULT_FONT_RATION = 20;

/** The default minions page side view font size */
export const SIDE_CONTAINER_DEFAULT_FONT_SIZE = 50;

/** The battery percentage ti show warning mode */
export const WARNING_AT_DEVICE_BATTERY_LEVEL = 20;

/** Pull minions in activation in case of SSE missing updates */
export const PULL_MINION_ACTIVATION = Duration.FromMinutes(1);

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
		param: 'id',
	},
	network: {
		path: `${AppRoutes.dashboard.path}/network`,
	},
	settings: {
		path: `${AppRoutes.dashboard.path}/settings`,
	},
	profile: {
		path: `${AppRoutes.dashboard.path}/profile`,
		param: 'id',
	},
}

/** The path for shown creation minion view */
export const CREATE_MINION_PATH = `${DashboardRoutes.minions.path}/create-new-minion`;

/** The path for shown creation user view */
export const CREATE_USER_PATH = `${DashboardRoutes.users.path}/create-new-user`;

/** Make routes readonly */
Object.freeze(AppRoutes);
Object.freeze(DashboardRoutes);
