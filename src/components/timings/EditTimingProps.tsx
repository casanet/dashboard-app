import { Button, Grid, Theme, useMediaQuery } from "@material-ui/core";
import { useState } from "react";
import { handleServerRestError } from "../../services/notifications.service";
import { timingsService } from "../../services/timings.service";
import { useTranslation } from "react-i18next";
import { defaultMinionStatus, isOnMode } from "../../logic/common/minionsUtils";
import { TimingEdit } from "./TimingEdit";
import { MinionEditStatus } from "../minions/editMinionStatus/MinionEditStatus";
import clonedeep from 'lodash.clonedeep';
import { SwitchEditStatus } from "../minions/editMinionStatus/SwitchEditStatus";
import LoadingButton from "@mui/lab/LoadingButton";
import { ApiFacade, CalibrationMode, Minion, MinionStatus, MinionTypes, Timing, TimingProperties } from "../../infrastructure/generated/api/swagger/api";
import { TimingLockControl } from "./TimingLockControl";

interface EditTimingPropsProps {
	minion: Minion;
	timing: Timing;
	onDone: () => void;
	fontRatio: number;
}



export function EditTimingProps(props: EditTimingPropsProps) {
	const { t } = useTranslation();
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
	const [editing, setEditing] = useState<boolean>(false);
	const [timingProperties, setTimingProperties] = useState<TimingProperties>(clonedeep(props.timing.timingProperties)); // make sure to only copy (not ref) the original object
	const [minionStatus, setMinionStatus] = useState<MinionStatus>(clonedeep(props.timing.triggerDirectAction?.minionStatus || defaultMinionStatus(props.minion.minionType)));
	const [lockMode, setLockMode] = useState<CalibrationMode | undefined>(props.timing.setLock);

	const { fontRatio } = props;
	async function updateTiming() {
		if (!timingProperties || !minionStatus) {
			return;
		}
		setEditing(true);
		try {
			const editedTiming = clonedeep(props.timing) as Timing;
			editedTiming.timingProperties = timingProperties;
			if (editedTiming.triggerDirectAction) {
				editedTiming.triggerDirectAction.minionStatus = minionStatus;
			} else {
				editedTiming.triggerDirectAction = { minionStatus, minionId: props.minion.minionId || '', }
			}
			editedTiming.setLock = lockMode;
			await ApiFacade.TimingsApi.setTiming(editedTiming.timingId, editedTiming);
			timingsService.updateTiming(editedTiming);
			props.onDone();
		} catch (error) {
			handleServerRestError(error);
		}
		setEditing(false);
	}

	return <div style={{ width: '100%' }}>
		<div>
			{props.timing.timingType && <TimingEdit disabled={editing} timingType={props.timing.timingType} timingProperties={timingProperties} fontRatio={fontRatio} setTimingProperties={setTimingProperties} />}
		</div>
		<div>
			<Grid
				container
				direction={desktopMode ? 'row' : 'column'}
				justifyContent="center"
				alignItems="center"
			>
				<div>
					<SwitchEditStatus
						disabled={editing}
						minionStatus={minionStatus}
						setMinionStatus={setMinionStatus}
						minionType={props.minion.minionType}
						fontRatio={fontRatio * 1.7}
						smallFontRatio={fontRatio * 1.7 * 0.5}
						isOn={isOnMode(props.minion.minionType, minionStatus)} />
				</div>
				<div>
					{props.minion.minionType !== MinionTypes.Toggle && props.minion.minionType !== MinionTypes.Switch &&
						<MinionEditStatus disabled={editing} minionStatus={minionStatus} setMinionStatus={setMinionStatus} minionType={props.minion.minionType} fontRatio={fontRatio * 1.7} />}
				</div>
			</Grid>
		</div>
		<div style={{ width: '100%' }}>
			<TimingLockControl disabled={editing} fontRatio={fontRatio} setLockMode={setLockMode} lockMode={lockMode} />
		</div>
		<Grid
			style={{ marginTop: fontRatio * 0.7 }}
			container
			direction="row"
			justifyContent="space-between"
			alignItems="flex-end"
		>
			<Button variant="contained" onClick={props.onDone}>{t('global.cancel')}</Button>
			<LoadingButton
				style={{ minWidth: desktopMode ? 200 : 0 }}
				loading={editing}
				loadingPosition={desktopMode ? 'start' : 'center'}
				disabled={!!!timingProperties}
				variant="contained"
				color={'primary'}
				onClick={updateTiming}>
				{t('dashboard.timings.update.timing')}
			</LoadingButton>
		</Grid>
	</div>
}