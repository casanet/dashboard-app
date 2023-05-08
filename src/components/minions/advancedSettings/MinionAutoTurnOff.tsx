import { CircularProgress, Grid, IconButton, TextField, Theme, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { useTranslation } from "react-i18next"
import InfoIcon from '@mui/icons-material/Info';
import { useEffect, useState } from "react";
import clonedeep from 'lodash.clonedeep';
import { Duration } from 'unitsnet-js';
import { Minion, minionsService } from "../../../services/minions.service";
import { handleServerRestError } from "../../../services/notifications.service";
import { HMS, HMStoMs, msToHMS } from "../../../logic/common/minionsUtils";
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';
import { ThemeSwitch } from "../../global/ThemeSwitch";
import { ThemeTooltip } from "../../global/ThemeTooltip";
import { marginLeft } from "../../../logic/common/themeUtils";
import { ApiFacade } from "../../../infrastructure/generated/api/swagger/api";

interface MinionAutoTurnOffProps {
	fontRatio: number;
	minion: Minion;
}

export function MinionAutoTurnOff(props: MinionAutoTurnOffProps) {
	const { t } = useTranslation();
	const { fontRatio, minion } = props;
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
	const theme = useTheme();
	const [saving, setSaving] = useState<boolean>(false);
	const [turnOffIn, setTurnOffIn] = useState<HMS>(msToHMS(minion.minionAutoTurnOffMS));

	useEffect(() => {
		// Once the minionAutoTurnOffMS update, re-calc and override the turnOffIn 
		setTurnOffIn(msToHMS(minion.minionAutoTurnOffMS));
	}, [minion.minionAutoTurnOffMS]);

	async function setAutoTurnOff(duration: Duration) {
		setSaving(true);
		try {
			await ApiFacade.MinionsApi.setMinionTimeout(minion.minionId || '', { setAutoTurnOffMS: duration.Milliseconds });
			minion.minionAutoTurnOffMS = duration.Milliseconds;
			minionsService.updateMinion(minion);
		} catch (error) {
			handleServerRestError(error);
		}
		setSaving(false);
	}

	function applyTurnOffChanges() {
		setAutoTurnOff(Duration.FromMilliseconds(HMStoMs(turnOffIn)));
	}

	// Detect of the current timeout mode is off (AKA the minionAutoTurnOffMS is 0 or undefined) 
	const isOff = !minion.minionAutoTurnOffMS;
	// Detect if the turnOffIn changed by the user, if so, show it as 'edit mode'
	const editMode = HMStoMs(turnOffIn) !== (minion.minionAutoTurnOffMS || 0);

	const disableModify = saving || minion?.readonly;
	const disableModifyProps = disableModify || isOff;

	return <Grid
		container
		direction="row"
		justifyContent="space-between"
		alignItems="center"
	>
		<div>
			<Grid
				container
				direction={desktopMode ? 'row' : 'column'}
				justifyContent="flex-start"
				alignItems={desktopMode ? 'center' : 'flex-start'}
			>
				<div>
					<Grid
						container
						direction={'row'}
						justifyContent="flex-start"
						alignItems="center"
					>
						<Typography style={{ fontSize: fontRatio * 0.3 }} >{t('dashboard.minions.advanced.settings.auto.turn.off')}</Typography>
						<ThemeTooltip title={<span>{t('dashboard.minions.advanced.settings.auto.turn.off.tip')}</span>}>
							<InfoIcon style={{ fontSize: fontRatio * 0.3, marginTop: fontRatio * -0.2 }} />
						</ThemeTooltip>
					</Grid>
				</div>
				<div>
					<Grid
						container
						direction={'row'}
						justifyContent="flex-start"
						alignItems="center"
					>
						<div style={{ marginTop: props.fontRatio * 0.25, [marginLeft(theme)]: desktopMode ? props.fontRatio * 0.5 : 0 }}>
							<TextField
								disabled={disableModifyProps}
								style={{ width: props.fontRatio }}
								variant="standard"
								id="outlined-number"
								helperText={t('global.hours')}
								type="number"
								value={turnOffIn.hours}
								InputLabelProps={{
									shrink: true,
								}}
								onChange={(e) => {
									const rawValue = e.target.value;

									let newDuration = parseInt(rawValue, 10);
									
									// Don't allow non-number value
									if (isNaN(newDuration)) {
										newDuration = 0;
									}
									// Don't allow number under 0
									if (newDuration < 0) {
										return;
									}
									// Update hours (only)
									const newTurnOff = clonedeep<HMS>(turnOffIn);
									newTurnOff.hours = newDuration;
									setTurnOffIn(newTurnOff);
								}}
							/>
							<TextField
								disabled={disableModifyProps}
								style={{ width: props.fontRatio }}
								variant="standard"
								id="outlined-number"
								helperText={t('global.minutes')}
								type="number"
								value={turnOffIn.minutes}
								InputLabelProps={{
									shrink: true,
								}}
								onChange={(e) => {
									const rawValue = e.target.value;

									let newDuration = parseInt(rawValue, 10);
									// Don't allow non-number value
									if (isNaN(newDuration)) {
										newDuration = 0;
									}
									// Allow valid minutes only
									if (newDuration > 59 || newDuration < 0) {
										return;
									}
									const newTurnOff = clonedeep<HMS>(turnOffIn);
									newTurnOff.minutes = newDuration;
									setTurnOffIn(newTurnOff);
								}}
							/>
							<TextField
								disabled={disableModifyProps}
								style={{ width: props.fontRatio }}
								variant="standard"
								id="outlined-number"
								helperText={t('global.seconds')}
								type="number"
								value={turnOffIn.seconds}
								InputLabelProps={{
									shrink: true,
								}}
								onChange={(e) => {
									const rawValue = e.target.value;

									let newDuration = parseInt(rawValue, 10);
									// Don't allow non-number value
									if (isNaN(newDuration)) {
										newDuration = 0;
									}
									// Allow valid seconds only
									if (newDuration > 59 || newDuration < 0) {
										return;
									}
									const newTurnOff = clonedeep<HMS>(turnOffIn);
									newTurnOff.seconds = newDuration;
									setTurnOffIn(newTurnOff);
								}}
							/>
						</div>
						<div style={{ [marginLeft(theme)]: fontRatio * 0.3 }}>
							{editMode && <ThemeTooltip title={<span>{t('global.save')}</span>} >
								<IconButton
									disabled={disableModify}
									style={{ padding: fontRatio * 0.1 }}
									onClick={applyTurnOffChanges}
									color="inherit">
									<SaveIcon style={{ fontSize: fontRatio * 0.3 }} />
								</IconButton>
							</ThemeTooltip>}
							{editMode && <ThemeTooltip title={<span>{t('global.cancel')}</span>} >
								<IconButton
									disabled={disableModify}
									style={{ padding: fontRatio * 0.1 }}
									onClick={() => { setTurnOffIn(msToHMS(minion.minionAutoTurnOffMS)); }}
									color="inherit">
									<CloseIcon style={{ fontSize: fontRatio * 0.3 }} />
								</IconButton>
							</ThemeTooltip>}
						</div>
					</Grid>
				</div>
			</Grid>

		</div>
		<div style={{ width: '58px', height: '38px' }}>
			{!saving && <ThemeSwitch
				color="primary"
				disabled={disableModify}
				checked={!isOff}
				size="medium"
				onChange={() => { setAutoTurnOff(Duration.FromMinutes(!isOff ? 0 : 1)) }} />}
			{saving && <div
				style={{
					[marginLeft(theme)]: fontRatio * 0.3,
					marginTop: 8
				}}
			>
				<CircularProgress thickness={5} size={fontRatio * 0.5} />
			</div>
			}
		</div>
	</Grid>;
}