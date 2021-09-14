import { IconButton, Tooltip, useTheme } from "@material-ui/core";
import { useState } from "react";
import { Minion, MinionStatus, SwitchOptions } from "../../infrastructure/generated/api";
import PowerSettingsNewRoundedIcon from '@material-ui/icons/PowerSettingsNewRounded';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import ErrorOutlineRoundedIcon from '@material-ui/icons/ErrorOutlineRounded';
import { ApiFacade } from "../../infrastructure/generated/proxies/api-proxies";
import { useTranslation } from "react-i18next";
import { handleServerRestError } from "../../services/notifications.service";
import { minionsService } from "../../services/minions.service";

interface MinionPowerToggleProps {
	minion: Minion;
	fontSize: number | string;
}

export function MinionPowerToggle(props: MinionPowerToggleProps) {
	const { t } = useTranslation();
	const theme = useTheme();
	const [loading, setLoading] = useState<boolean>();

	const { minion, fontSize } = props;

	// Detect minion mode, TEMP LOGIC
	const isOn = minion.minionStatus[minion.minionType as unknown as keyof MinionStatus]?.status === SwitchOptions.On;

	async function toggleMinionStatus() {
		setLoading(true);
		try {
			const newStatus: MinionStatus = { switch: { status: isOn ? SwitchOptions.Off : SwitchOptions.On } };
			await ApiFacade.MinionsApi.setMinion(newStatus, minion.minionId || '');
			minion.minionStatus = newStatus;
			minionsService.updateMinion(minion);
		} catch (error) {
			handleServerRestError(error);
		}
		setLoading(false);
	}

	// Calc power icon color, based on status and theme
	const powerIconColor = isOn ? 'inherit' : theme.palette.grey[theme.palette.type === 'light' ? 300 : 700];

	return <div className="minion-power-toggle-container" onClick={(e) => {
		e.persist();
		e.nativeEvent.stopImmediatePropagation();
		e.stopPropagation();
	}}
	 
	>
		<Tooltip title={<span>{t(`dashboard.minions.press.to.${isOn ? 'off' : 'on'}`)}</span>} enterDelay={100}>
			<IconButton
				disabled={loading}
				aria-label={t(`dashboard.minions.press.to.${isOn ? 'off' : 'on'}`)}
				onClick={toggleMinionStatus}
				color="inherit"
			>

				{/* In case of loading, show loader icon */}
				{loading && <MoreHorizIcon style={{ fontSize, color: powerIconColor }} />}
				{/* In case of communication issues, show icon indicator for that */}
				{(!loading && !minion.isProperlyCommunicated) && <ErrorOutlineRoundedIcon style={{ fontSize, color: theme.palette.warning[theme.palette.type] }} />}
				{/* In case of all is OK, show the power icon */}
				{(!loading && minion.isProperlyCommunicated) && <PowerSettingsNewRoundedIcon style={{ fontSize, color: powerIconColor }} />}
			</IconButton>
		</Tooltip>
	</div>
}