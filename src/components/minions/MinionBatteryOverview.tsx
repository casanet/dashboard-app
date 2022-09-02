import { Typography, useTheme } from "@material-ui/core";
import { CSSProperties } from "react";
import { Minion } from "../../infrastructure/generated/api/swagger/api";
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import { WARNING_AT_DEVICE_BATTERY_LEVEL } from "../../infrastructure/consts";
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';

interface MinionBatteryOverviewProps {
	minion: Minion;
	fontRatio: number;
}

export function MinionBatteryOverview(props: MinionBatteryOverviewProps) {
	const theme = useTheme();

	const { minion, fontRatio } = props;

	const subTitleColor = theme.palette.grey.A200;

	// Get physical device battery level
	const battery = minion.device?.pysicalDevice?.deviceStatus?.battery;
	const charging = minion.device?.pysicalDevice?.deviceStatus?.charging;

	const isBatteryKnown = typeof battery === 'number';

	// If there is no battery, it's OK...
	if (!isBatteryKnown && typeof charging !== 'boolean') {
		return <div></div>;
	}

	// check if battery too low
	const alertMode = isBatteryKnown && battery < WARNING_AT_DEVICE_BATTERY_LEVEL;

	// Get the correct icon to show
	const BatteryIcon = alertMode ? BatteryAlertIcon : BatteryFullIcon;

	const FinalBatteryIcon = charging ? BatteryChargingFullIcon : BatteryIcon;
	// Prepare icon props
	const indicatorsStyle: CSSProperties = { fontSize: fontRatio, marginTop: fontRatio * 0.3, color: alertMode ? 'red' : theme.palette.grey[500] };

	return <div style={{ display: 'flex' }}>
		<div style={{ marginTop: -(fontRatio * 0.7) }} >
			<FinalBatteryIcon style={indicatorsStyle} />
		</div>
		{isBatteryKnown && <Typography style={{ fontSize: fontRatio * 0.5, color: alertMode ? 'red' : subTitleColor }}>
			{battery}%
		</Typography>}
	</div>;
}
