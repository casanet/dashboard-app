import { useTheme } from "@material-ui/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LoadingButton from '@mui/lab/LoadingButton';
import BlockIcon from '@mui/icons-material/Block';
import { ProfileItemProps } from "../../pages/dashboard-pages/Profile";
import { ApiFacade } from "../../infrastructure/generated/proxies/api-proxies";
import { handleServerRestError } from "../../services/notifications.service";
import { AlertDialog } from "../AlertDialog";
import { inputColor } from "../../logic/common/themeUtils";

export function ProfileRevokeSession(props: ProfileItemProps) {
	const { t } = useTranslation();
	const theme = useTheme();
	const [loading, setLoading] = useState<boolean>(false);
	const [openRevokeAlert, setOpenRevokeAlert] = useState<boolean>(false);

	async function revokeSessions() {
		setLoading(true);
		try {
			await ApiFacade.AuthenticationApi.logoutSessions(props.profile.email);
		} catch (error) {
			await handleServerRestError(error);
		}

		try {
			// Try again, just to make sure that if the current user users one of logged out session, 
			// the user will get 401 in the second request, and redirect to login page
			await ApiFacade.AuthenticationApi.logoutSessions(props.profile.email);
		} catch (error) {
		}
		setLoading(false);
	}

	return <div>
		<AlertDialog
			open={openRevokeAlert}
			cancelText={t('global.cancel')}
			submitText={t('dashboard.profile.revoke.session.revoke')}
			title={t('dashboard.profile.revoke.session.revoke.alert.title', { name: props.profile.displayName })}
			text={t('dashboard.profile.revoke.session.revoke.alert.text', { name: props.profile.displayName })}
			onCancel={() => setOpenRevokeAlert(false)}
			onSubmit={() => { setOpenRevokeAlert(false); revokeSessions(); }}
			submitColor={'error'}
		/>
		<LoadingButton
			style={{ width: '100%', color: inputColor(theme) }}
			loading={loading}
			loadingPosition={'start'}
			disabled={loading}
			variant="contained"
			color={'inherit'}
			endIcon={<BlockIcon />}
			onClick={() => setOpenRevokeAlert(true)}>
			<div style={{ width: '100%' }}>
				{t('dashboard.profile.revoke.session.revoke')}
			</div>
		</LoadingButton>
	</div>;
}