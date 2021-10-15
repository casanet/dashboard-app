import { CircularProgress, Grid, IconButton, TextField, Theme, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { useTranslation } from "react-i18next"
import { CalibrationMode, Minion } from "../../../infrastructure/generated/api";
import InfoIcon from '@mui/icons-material/Info';
import { CSSProperties, useEffect, useState } from "react";
import { Duration } from 'unitsnet-js';
import { ApiFacade } from "../../../infrastructure/generated/proxies/api-proxies";
import { minionsService } from "../../../services/minions.service";
import { handleServerRestError } from "../../../services/notifications.service";
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';
import { ThemeSwitch } from "../../global/ThemeSwitch";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { getModeColor, marginLeft } from "../../../logic/common/themeUtils";
import SyncIcon from '@mui/icons-material/Sync';
import LockIcon from '@mui/icons-material/Lock';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { ThemeTooltip } from "../../global/ThemeTooltip";

interface MinionSyncProps {
	fontRatio: number;
	minion: Minion;
}

export function MinionSync(props: MinionSyncProps) {
	const { t } = useTranslation();
	const { fontRatio, minion } = props;
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
	const theme = useTheme();
	const [saving, setSaving] = useState<boolean>(false);
	const [syncMinutes, setSyncMinutes] = useState<number>(minion.calibration?.calibrationCycleMinutes || 0);
	const [calibration, setCalibration] = useState<CalibrationMode>(minion.calibration?.calibrationMode || CalibrationMode.AUTO);

	useEffect(() => {
		// Once the calibrationCycleMinutes updated from out side, re calc the sync minutes
		setSyncMinutes(minion.calibration?.calibrationCycleMinutes || 0);
	}, [minion.calibration?.calibrationCycleMinutes]);

	async function setMinionCalibration(duration: Duration) {
		setSaving(true);
		try {
			await ApiFacade.MinionsApi.setMinionCalibrate({ calibrationMode: calibration, calibrationCycleMinutes: duration.Minutes }, minion.minionId || '');
			minion.calibration = {
				calibrationCycleMinutes :  duration.Minutes,
				calibrationMode : calibration
			}
			minionsService.updateMinion(minion);
		} catch (error) {
			handleServerRestError(error);
		}
		setSaving(false);
	}

	function applyMinionSyncChanges() {
		setMinionCalibration(Duration.FromMinutes(syncMinutes));
	}

	// Detect if any calibration configured, AKA if there is a value in the calibrationCycleMinutes
	const isOff = !minion.calibration?.calibrationCycleMinutes;

	// Detect if calibration prop has been changed by use, if so, show it as edit mode
	const editMode = (minion.calibration?.calibrationCycleMinutes || 0) !== syncMinutes || (minion.calibration?.calibrationMode || CalibrationMode.AUTO) !== calibration;

	// Calibration option size
	const calibrationModeStyle: CSSProperties = { fontSize: fontRatio * 0.4 };

	return <Grid
		container
		direction="row"
		justifyContent="space-between"
		alignItems="center"
	>
		<div>
			<Grid
				container
				direction={'row'}
				justifyContent="flex-start"
				alignItems={'center'}
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
								<Typography style={{ fontSize: fontRatio * 0.3 }} >{t('dashboard.minions.advanced.settings.sync.status')}</Typography>
								<ThemeTooltip title={<span>{t('dashboard.minions.advanced.settings.sync.status.tip')}</span>}>
									<InfoIcon style={{ fontSize: fontRatio * 0.3, marginTop: fontRatio * -0.2 }} />
								</ThemeTooltip>
							</Grid>
						</div>
						<div>
							<Grid
								container
								direction="column"
								justifyContent="center"
								alignItems="flex-start"
								style={{ [marginLeft(theme)]: fontRatio * (desktopMode ? 0.6 : 0), marginTop: fontRatio * 0.2 }}
							>
								<div>
									<ToggleButtonGroup
										disabled={isOff}
										orientation="horizontal"
										size="small"
										value={calibration}
										onChange={(e, v) => {
											if (!v) {
												return;
											}
											setCalibration(v);
										}}
										exclusive
									>
										<ToggleButton value={CalibrationMode.AUTO} aria-label={t('dashboard.minions.advanced.settings.sync.auto.mode.tip')} style={{ color: getModeColor(!isOff, theme) }}>
											<ThemeTooltip title={<span>{t('dashboard.minions.advanced.settings.sync.auto.mode.tip')}</span>}>
												<SyncIcon style={calibrationModeStyle} />
											</ThemeTooltip>
										</ToggleButton>
										<ToggleButton value={CalibrationMode.LOCKON} aria-label={t('dashboard.minions.advanced.settings.sync.lock.on.tip')} style={{ color: getModeColor(!isOff, theme) }}>
											<ThemeTooltip title={<span>{t('dashboard.minions.advanced.settings.sync.lock.on.tip')}</span>}>
												<LockIcon style={calibrationModeStyle} />
											</ThemeTooltip>
										</ToggleButton>
										<ToggleButton value={CalibrationMode.LOCKOFF} aria-label={t('dashboard.minions.advanced.settings.sync.lock.off.tip')} style={{ color: getModeColor(!isOff, theme) }}>
											<ThemeTooltip title={<span>{t('dashboard.minions.advanced.settings.sync.lock.off.tip')}</span>}>
												<LockOutlinedIcon style={calibrationModeStyle} />
											</ThemeTooltip>
										</ToggleButton>
										<ToggleButton value={CalibrationMode.SHABBAT} aria-label={t('dashboard.minions.advanced.settings.sync.shabbat.tip')} style={{ color: getModeColor(!isOff, theme) }}>
											<ThemeTooltip title={<span>{t('dashboard.minions.advanced.settings.sync.rotation.tip')}</span>}>
												<RotateRightIcon style={calibrationModeStyle} />
											</ThemeTooltip>
										</ToggleButton>
									</ToggleButtonGroup>
								</div>
								<div>
									<Grid
										container
										direction={'row'}
										justifyContent="flex-start"
										alignItems="center"
									>
										<div style={{ marginTop: props.fontRatio * 0.2 }}>
											<TextField
												disabled={saving || isOff}
												style={{ width: props.fontRatio * 2.8 }}
												variant="standard"
												helperText={t('dashboard.minions.advanced.settings.sync.sync.minutes.helper')}
												type="number"
												value={syncMinutes}
												InputLabelProps={{
													shrink: true,
												}}
												onChange={(e) => {
													const rawValue = e.target.value;

													let newDuration = parseInt(rawValue, 10);
													// Allow numbers only
													if (isNaN(newDuration)) {
														newDuration = 0;
													}
													// Set positive number only
													if (newDuration < 0) {
														return;
													}
													setSyncMinutes(newDuration);
												}}
											/>
										</div>
									</Grid>
								</div>
							</Grid>
						</div>
					</Grid>
				</div>
				<div style={{ [marginLeft(theme)]: fontRatio * 0.3 }}>
					{editMode && <ThemeTooltip title={<span>{t('global.save')}</span>} >
						<IconButton
							disabled={saving}
							style={{ padding: fontRatio * 0.1 }}
							onClick={applyMinionSyncChanges}
							color="inherit">
							<SaveIcon style={{ fontSize: fontRatio * 0.3 }} />
						</IconButton>
					</ThemeTooltip>}
					{editMode && <ThemeTooltip title={<span>{t('global.cancel')}</span>} >
						<IconButton
							disabled={saving}
							style={{ padding: fontRatio * 0.1 }}
							onClick={() => { setSyncMinutes(minion.calibration?.calibrationCycleMinutes || 0); setCalibration(minion.calibration?.calibrationMode || CalibrationMode.AUTO) }}
							color="inherit">
							<CloseIcon style={{ fontSize: fontRatio * 0.3 }} />
						</IconButton>
					</ThemeTooltip>}
				</div>
			</Grid>
		</div >
		<div style={{ width: '58px', height: '38px' }}>
			{!saving && <ThemeSwitch
				color="primary"
				disabled={saving}
				checked={!isOff}
				size="medium"
				onChange={() => { setMinionCalibration(Duration.FromMinutes(!isOff ? 0 : 10)) }} />}
			{saving && <div
				style={{
					[marginLeft(theme)]: fontRatio * 0.3,
					marginTop: 8
				}}
			>
				<CircularProgress thickness={5} size={fontRatio * 0.5} />
			</div>}
		</div>
	</Grid >;
}
