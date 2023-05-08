import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RestrictionType } from "../../../infrastructure/generated/api/swagger/api";
import { FormControl, MenuItem, Select } from "@mui/material";
import { mapRestrictionsTypeToDisplay } from "../../../logic/common/minionsUtils";

export interface RestrictionModeProps {
	disabled: boolean;
	restrictionType: RestrictionType;
	onRestrictionChange: (restriction: RestrictionType) => void
}

export function RestrictionMode(props: RestrictionModeProps) {
	const { t } = useTranslation();
	const [restriction, setRestriction] = useState<RestrictionType>(props.restrictionType);

	return <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
		<Select
			disabled={props.disabled}
			value={restriction}
			onChange={(e) => {
				const r = e.target.value as RestrictionType;
				setRestriction(r);
				props.onRestrictionChange(r);
			}}
		>
			<MenuItem value={RestrictionType.Block}>{t(mapRestrictionsTypeToDisplay[RestrictionType.Block])}</MenuItem>
			<MenuItem value={RestrictionType.Read}>{t(mapRestrictionsTypeToDisplay[RestrictionType.Read])}</MenuItem>
			<MenuItem value={RestrictionType.Write}>{t(mapRestrictionsTypeToDisplay[RestrictionType.Write])}</MenuItem>
		</Select>
	</FormControl>
}