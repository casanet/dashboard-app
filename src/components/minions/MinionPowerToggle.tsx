import { IconButton, useTheme } from "@material-ui/core";
import { useState } from "react";
import PowerSettingsNewRoundedIcon from '@material-ui/icons/PowerSettingsNewRounded';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
// import ErrorOutlineRoundedIcon from '@material-ui/icons/ErrorOutlineRounded';
import { useTranslation } from "react-i18next";
import { handleServerRestError } from "../../services/notifications.service";
import { minionsService } from "../../services/minions.service";
import clonedeep from 'lodash.clonedeep';
import { getModeColor } from "../../logic/common/themeUtils";
import { defaultMinionStatus, isOnMode } from "../../logic/common/minionsUtils";
import { ThemeTooltip } from "../global/ThemeTooltip";
import { ApiFacade, Minion, SwitchOptions } from "../../infrastructure/generated/api/swagger/api";

interface MinionPowerToggleProps {
	minion: Minion;
	fontRatio: number;
}

export function MinionPowerToggle(props: MinionPowerToggleProps) {
	const { t } = useTranslation();
	const theme = useTheme();
	const [loading, setLoading] = useState<boolean>();

	const { minion, fontRatio } = props;

	const isOn = isOnMode(minion.minionType, minion.minionStatus);

	async function toggleMinionStatus() {
		setLoading(true);
		try {
			let minionStatus = clonedeep<any>(minion.minionStatus);
			if (!minionStatus[minion.minionType]) {
				minionStatus = defaultMinionStatus(minion.minionType);
			}
			minionStatus[minion.minionType].status = isOn ? SwitchOptions.Off : SwitchOptions.On;
			await ApiFacade.MinionsApi.setMinion(minion.minionId || '', minionStatus);
			minion.minionStatus = minionStatus;
			minionsService.updateMinion(minion);
		} catch (error) {
			handleServerRestError(error);
		}
		setLoading(false);
	}

	// Calc power icon color, based on status and theme
	const powerIconColor = getModeColor(isOn, theme);

	return <div className="minion-power-toggle-container" onClick={(e) => {
		// Stop click event propagation up, to not open the minion full info while clicking on power indicator.
		e.persist();
		e.nativeEvent.stopImmediatePropagation();
		e.stopPropagation();
	}}
	>
		<ThemeTooltip title={<span>{t(`dashboard.minions.press.to.${isOn ? 'off' : 'on'}`)}</span>} disableFocusListener >
			<IconButton
				style={{ padding: fontRatio / 5 }}
				disabled={loading}
				aria-label={t(`dashboard.minions.press.to.${isOn ? 'off' : 'on'}`)}
				onClick={toggleMinionStatus}
				color="inherit"
			>

				{/* In case of loading, show loader icon */}
				{loading && <MoreHorizIcon style={{ fontSize: fontRatio, color: powerIconColor }} />}
				{/* In case of communication issues, show icon indicator for that */}
				{/* {(!loading && !minion.isProperlyCommunicated) && <ErrorOutlineRoundedIcon style={{ fontSize: fontRatio, color: theme.palette.warning[theme.palette.type] }} />} */}
				{/* In case of all is OK, show the power icon */}
				{(!loading) && <PowerSettingsNewRoundedIcon style={{ fontSize: fontRatio, color: powerIconColor }} />}
			</IconButton>
		</ThemeTooltip>
	</div>
}