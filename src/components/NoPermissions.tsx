import { Grid, Theme, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { getModeColor } from "../logic/common/themeUtils";
import BlockIcon from '@mui/icons-material/Block';
import { useTranslation } from "react-i18next";
import { AuthScopes } from "../infrastructure/generated/api";
import { sessionManager } from "../infrastructure/session-manager";

interface NoPermissionsProps {
	fontRatio?: number;
}

/**
 * Generic 'no permission' component to show in case of forbidden access
 */
export function NoPermissions(props: NoPermissionsProps) {
	const { t } = useTranslation();
	const theme = useTheme();
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

	const fontRatio = props.fontRatio || (desktopMode ? 50 : 35);

	return <Grid
		style={{ width: '100%', height: '100%', textAlign: 'center' }}
		container
		direction="column"
		justifyContent="center"
		alignItems="center"
	>
		<div>
			<BlockIcon style={{ fontSize: fontRatio * 5, color: getModeColor(false, theme) }} />
		</div>
		<Typography style={{ fontSize: fontRatio * 0.9, marginTop: fontRatio * 0.5, color: getModeColor(false, theme) }} >{t('You dont have permission to see this content')}</Typography>
	</Grid>
}

interface SensitiveContentProps {
	requiredScopes: AuthScopes[];
	children: JSX.Element;
}

/**
 * A simple component to wrap sensitives components and make sure the components renders only with the correct session scope.
 * Otherwise, only a 'NoPermissions' component will be shown 
 * @param props 
 * @returns 
 */
export function SensitiveContent(props: SensitiveContentProps) {
	if (!props.requiredScopes.includes(sessionManager.scope)) {
		return <NoPermissions />;
	}
	return props.children;
}

