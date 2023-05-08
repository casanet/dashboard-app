import { DEFAULT_FONT_RATION } from "../../../infrastructure/consts";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RestrictionType, RestrictionItem, AuthScopes } from "../../../infrastructure/generated/api/swagger/api";
import { FormControl, Grid, MenuItem, Select } from "@mui/material";
import { Minion } from "../../../services/minions.service";
import { usersService } from "../../../services/users.service";
import { useData } from "../../../hooks/useData";
import LoadingButton from "@mui/lab/LoadingButton";
import { Button } from "@material-ui/core";
import { mapRestrictionsTypeToDisplay } from "../../../logic/common/minionsUtils";

export interface AddRestrictionProps {
	minion: Minion;
	saving: boolean;
	onFinished: (restriction?: RestrictionItem) => void;
}

export function AddRestriction(props: AddRestrictionProps) {
	const { t } = useTranslation();
	const [restriction, setRestriction] = useState<RestrictionType>();
	const [userEmail, setUserEmail] = useState<string>('');

	const [users, loading] = useData(usersService);

	const emails = props?.minion?.restrictions?.map(r => r.userEmail) || []
	const relevantUsers = users?.filter(u => u.scope !== AuthScopes.AdminAuth && !emails.includes(u.email)) || [];

	return <div style={{}}>
		<FormControl variant="standard" sx={{ m: 1, minWidth: DEFAULT_FONT_RATION * 12, maxWidth: DEFAULT_FONT_RATION * 12 }}>
			<Select
				disabled={loading}
				value={userEmail}
				onChange={(e) => {
					const r = e.target.value as RestrictionType;
					setUserEmail(r);
				}}
			>
				{relevantUsers.map(user => <MenuItem value={user.email}>{user.email}</MenuItem>)}
			</Select>
		</FormControl>
		<FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
			<Select
				value={restriction}
				onChange={(e) => {
					const r = e.target.value as RestrictionType;
					setRestriction(r);
				}}
			>
				<MenuItem value={RestrictionType.Block}>{t(mapRestrictionsTypeToDisplay[RestrictionType.Block])}</MenuItem>
			<MenuItem value={RestrictionType.Read}>{t(mapRestrictionsTypeToDisplay[RestrictionType.Read])}</MenuItem>
			<MenuItem value={RestrictionType.Write}>{t(mapRestrictionsTypeToDisplay[RestrictionType.Write])}</MenuItem>
			</Select>
		</FormControl>
		<Grid
			style={{ marginTop: DEFAULT_FONT_RATION * 0.7 }}
			container
			direction="row"
			justifyContent="space-between"
			alignItems="flex-end"
		>
			<Button variant="contained" onClick={() => { props.onFinished(); }}>
				{t('global.cancel')}
			</Button>
			<LoadingButton
				style={{ minWidth: DEFAULT_FONT_RATION ? 200 : 0 }}
				loading={props.saving}
				loadingPosition={DEFAULT_FONT_RATION ? 'start' : 'center'}
				disabled={!restriction || !userEmail}
				variant="contained"
				color={'primary'}
				onClick={() => {
					props.onFinished({ userEmail, restrictionType: restriction as RestrictionType });
					setUserEmail('');
				}}>
				{t(`dashboard.restrictions.add.restriction`)}
			</LoadingButton>
		</Grid>
	</div>
}