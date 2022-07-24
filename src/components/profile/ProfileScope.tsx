import { DEFAULT_FONT_RATION } from "../../infrastructure/consts";
import Autocomplete from '@mui/material/Autocomplete';
import { useEffect, useState } from "react";
import { mapAuthScopeToDisplay } from "../../logic/common/usersUtils";
import { useTranslation } from "react-i18next";
import TextField from '@mui/material/TextField';
import { sessionManager } from "../../infrastructure/session-manager";
import LinearProgress from '@mui/material/LinearProgress';
import { handleServerRestError } from "../../services/notifications.service";
import { ProfileItemProps } from "../../pages/dashboard-pages/Profile";
import { ApiFacade, AuthScopes, User } from "../../infrastructure/generated/api/swagger/api";

export function ProfileScope(props: ProfileItemProps) {
	const { t } = useTranslation();
	const [scope, setScope] = useState<AuthScopes>(props.profile.scope);
	const [saving, setSaving] = useState<boolean>(false);

	useEffect(() => {
		setScope(props.profile.scope);
	}, [props.profile.scope])

	async function saveNewScope(scope: AuthScopes) {
		setSaving(true);

		const previousScope = scope;
		setScope(scope);
		try {
			const newProfile = { ...props.profile, scope } as User;
			await ApiFacade.UsersApi.setUser(props.profile.email, newProfile);
			props.setProfile(newProfile);
		} catch (error) {
			// In case of error, revert back
			setScope(previousScope);
			await handleServerRestError(error);
		}
		setSaving(false);
	}

	return <Autocomplete
		style={{ width: DEFAULT_FONT_RATION * 10 }}
		// Only admins can change the scope
		disabled={!sessionManager.isAdmin || saving}
		multiple
		limitTags={1}
		options={[AuthScopes.AdminAuth, AuthScopes.UserAuth]}
		getOptionLabel={(option) => t(mapAuthScopeToDisplay[option])}
		value={scope ? [scope] : []}
		onChange={(e, o) => {
			// Select the last scope, since only one scope can set at a time, so take the newest.
			const newScope = o[o.length - 1];
			// If non selected, keep the selection, but don't save changes, since user must have scope set,
			if (!newScope) {
				setScope(newScope);
			} else {
				saveNewScope(newScope);
			}
		}}
		renderInput={(params) => (
			<div>
				<TextField
					{...params}
					error={!scope}
					variant="standard"
				/>
				{saving && <LinearProgress />}
			</div>
		)}
	/>;
}