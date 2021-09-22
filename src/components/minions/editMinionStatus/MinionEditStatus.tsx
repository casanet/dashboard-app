import { MinionStatus, SwitchOptions } from "../../../infrastructure/generated/api";
import { MinionTypes } from "../../../infrastructure/generated/api";
import { EditAirConditioning } from "./AcEditStatus";
import '../../../theme/styles/components/minions/minionEditStatus.scss';
import { SwitchEditStatus } from "./SwitchEditStatus";
import { ToggleEditStatus } from "./ToggleEditStatus";
import { ColorLightEditStatus, LightEditStatus, TemperatureLightEditStatus } from "./LightEditStatus";
import { RollerEditStatus } from "./RollerEditStatus";
import { CleanerEditStatus } from "./CleanerEditStatus";

export interface EditStatusProps {
	minionType: MinionTypes;
	minionStatus: MinionStatus;
	setMinionStatus: (minionStatusToSet: MinionStatus) => void;
	disabled?: boolean;
	fontRatio: number;
	smallFontRatio: number;
}

export interface TypeEditStatusProps extends EditStatusProps {
	isOn: boolean;
}

export function MinionEditStatus(props: EditStatusProps) {
	const { minionStatus, minionType, disabled } = props;

	const isOn = !disabled && minionStatus[minionType as unknown as keyof MinionStatus]?.status === SwitchOptions.On;
	
	return <div className="minion-edit-status-overview-container">
		{minionType === MinionTypes.Toggle && <ToggleEditStatus {...props} isOn={isOn} />}
		{minionType === MinionTypes.Switch && <SwitchEditStatus {...props} isOn={isOn} />}
		{minionType === MinionTypes.Light && <LightEditStatus {...props} isOn={isOn} />}
		{minionType === MinionTypes.TemperatureLight && <TemperatureLightEditStatus {...props} isOn={isOn} />}
		{minionType === MinionTypes.ColorLight && <ColorLightEditStatus {...props}  isOn={isOn} />}
		{minionType === MinionTypes.AirConditioning && <EditAirConditioning {...props} isOn={isOn} />}
		{minionType === MinionTypes.Roller && <RollerEditStatus {...props} isOn={isOn} />}
		{minionType === MinionTypes.Cleaner && <CleanerEditStatus {...props} isOn={isOn} />}
	</div>
}