import { Divider, Grid } from "@material-ui/core";
import { useEffect, useState } from "react";
import { minionsKindsService } from "../../../services/minions.kinds.service";
import { MinionAutoTurnOff } from "./MinionAutoTurnOff";
import { MinionSync } from "./MinionSync";
import { MinionFetchCommands } from "./MinionFetchCommands";
import { MinionRecordCommandCommands } from "./MinionRecordCommandCommands";
import { Minion } from "../../../infrastructure/generated/api/swagger/api";

interface MinionAdvancedSettingsProps {
	fontRatio: number;
	minion: Minion;
}

export function MinionAdvancedSettings(props: MinionAdvancedSettingsProps) {
	const { fontRatio, minion } = props;
	const [isFetchCommandsAvailable, setIsFetchCommandsAvailable] = useState<boolean>();
	const [isRecordingSupported, setIsRecordingSupported] = useState<boolean>();

	useEffect(() => {
		(async () => {
			try {
				const devicesKind = await minionsKindsService.getData();
				const device = devicesKind.find(d => d.brand === minion.device.brand && d.model === minion.device.model);
				setIsFetchCommandsAvailable(device?.isFetchCommandsAvailable);
				setIsRecordingSupported(device?.isRecordingSupported)
			} catch (error) {
				// Do nothing, 
				// just the commands supported minions will not be shown the edit commands options.
			}
		})();
	}, [minion.device.brand, minion.device.model]);

	return <Grid
		style={{ width: '100%', height: '100%' }}
		container
		direction="column"
		justifyContent="center"
		alignItems="center"
	>
		<MinionAutoTurnOff minion={minion} fontRatio={fontRatio} />
		<Divider style={{ width: '100%', marginTop: fontRatio * 0.2, marginBottom: fontRatio * 0.2 }} variant={'fullWidth'} />
		<MinionSync minion={minion} fontRatio={fontRatio} />
		{isFetchCommandsAvailable && <Divider style={{ width: '100%', marginTop: fontRatio * 0.2 }} variant={'fullWidth'} />}
		{isFetchCommandsAvailable && <MinionFetchCommands minion={minion} fontRatio={fontRatio} />}
		{isRecordingSupported && <Divider style={{ width: '100%', marginTop: fontRatio * 0.2 }} variant={'fullWidth'} />}
		{isRecordingSupported && <MinionRecordCommandCommands minion={minion} fontRatio={fontRatio} />}
	</Grid>;
}
