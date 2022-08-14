import { EditAirConditioning } from "./AcEditStatus";
import '../../../theme/styles/components/minions/minionEditStatus.scss';
import { SwitchEditStatus } from "./SwitchEditStatus";
import { ToggleEditStatus } from "./ToggleEditStatus";
import { ColorLightEditStatus, LightEditStatus, TemperatureLightEditStatus } from "./LightEditStatus";
import { RollerEditStatus } from "./RollerEditStatus";
import { CleanerEditStatus } from "./CleanerEditStatus";
import { isOnMode } from "../../../logic/common/minionsUtils";
import { MinionStatus, MinionTypes } from "../../../infrastructure/generated/api/swagger/api";
import { TemperatureSensorOverview } from "../overviewMinionsStatus/MinionStatusOverview";

export interface EditStatusProps {
	minionType: MinionTypes;
	minionStatus: MinionStatus;
	setMinionStatus: (minionStatusToSet: MinionStatus) => void;
	disabled?: boolean;
	fontRatio: number;
	smallFontRatio?: number;
}

export interface TypeEditStatusProps extends EditStatusProps {
	smallFontRatio: number;
	isOn: boolean;
}

export function MinionEditStatus(props: EditStatusProps) {
	const { minionStatus, minionType, disabled, fontRatio } = props;

	const isOn = !disabled && isOnMode(minionType, minionStatus);
	const smallFontRatio = props.smallFontRatio || (fontRatio * 0.5);

	return <div className="minion-edit-status-overview-container">
		{minionType === MinionTypes.Toggle && <ToggleEditStatus {...props} isOn={isOn} smallFontRatio={smallFontRatio} />}
		{minionType === MinionTypes.Switch && <SwitchEditStatus {...props} isOn={isOn} smallFontRatio={smallFontRatio} />}
		{minionType === MinionTypes.Light && <LightEditStatus {...props} isOn={isOn} smallFontRatio={smallFontRatio} />}
		{minionType === MinionTypes.TemperatureLight && <TemperatureLightEditStatus {...props} isOn={isOn} smallFontRatio={smallFontRatio} />}
		{minionType === MinionTypes.ColorLight && <ColorLightEditStatus {...props} isOn={isOn} smallFontRatio={smallFontRatio} />}
		{minionType === MinionTypes.AirConditioning && <EditAirConditioning {...props} isOn={isOn} smallFontRatio={smallFontRatio} />}
		{minionType === MinionTypes.Roller && <RollerEditStatus {...props} isOn={isOn} smallFontRatio={smallFontRatio} />}
		{minionType === MinionTypes.Cleaner && <CleanerEditStatus {...props} isOn={isOn} smallFontRatio={smallFontRatio} />}
		{/* Temp sensor don't has ability to set so show the overview only */}
		{minionType === MinionTypes.TemperatureSensor && <TemperatureSensorOverview {...props} isOn={isOn} smallFontRatio={smallFontRatio} />}
	</div>
}