import { User } from "../../infrastructure/generated/api";
import { useEffect, useState } from "react";
import LinearProgress from '@mui/material/LinearProgress';
import { handleServerRestError } from "../../services/notifications.service";
import { ApiFacade } from "../../infrastructure/generated/proxies/api-proxies";
import { ProfileItemProps } from "../../pages/dashboard-pages/Profile";
import { ThemeSwitch } from "../global/ThemeSwitch";

export function ProfileTFA(props: ProfileItemProps) {
	const [forceMfa, setForceMfa] = useState<boolean>(!props.profile.ignoreTfa);
	const [saving, setSaving] = useState<boolean>(false);

	useEffect(() => {
		setForceMfa(!props.profile.ignoreTfa);
	}, [props.profile.ignoreTfa])

	async function toggleMfa() {
		setSaving(true);

		const previousForceMfa = forceMfa;
		const newForceMfa = !forceMfa;
	
		// toggle the MFA switch
		setForceMfa(newForceMfa);
		try {
			const newProfile = { ...props.profile, ignoreTfa: !newForceMfa } as User;
			await ApiFacade.UsersApi.setUser(newProfile, props.profile.email);
			props.setProfile(newProfile);
		} catch (error) {
			// In case or error, revert back
			setForceMfa(previousForceMfa);
			await handleServerRestError(error);
		}
		setSaving(false);
	}

	return <div>
		<ThemeSwitch
			disabled={saving}
			checked={forceMfa}
			onChange={toggleMfa}
			inputProps={{ 'aria-label': 'controlled' }}
		/>
		{saving && <LinearProgress />}
	</div>;
}