import { Button, Grid, Theme, useMediaQuery, useTheme } from "@material-ui/core";
import { useEffect, useState } from "react";
import { Minion, MinionStatus, MinionTypes, TimingProperties, TimingTypes } from "../../infrastructure/generated/api";
import { ApiFacade } from "../../infrastructure/generated/proxies/api-proxies";
import { handleServerRestError } from "../../services/notifications.service";
import { timingsService } from "../../services/timings.service";
import { useTranslation } from "react-i18next";
import { defaultMinionStatus, isOnMode } from "../../logic/common/minionsUtils";
import { TimingEdit } from "./TimingEdit";
import { MinionEditStatus } from "../minions/editMinionStatus/MinionEditStatus";
import { SwitchEditStatus } from "../minions/editMinionStatus/SwitchEditStatus";
import { defaultTimingProperties, mapTimingsTypeToDisplay } from "../../logic/common/timingsUtils";
import LoadingButton from '@mui/lab/LoadingButton';
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { getModeColor } from "../../logic/common/themeUtils";
import TimerIcon from '@mui/icons-material/Timer';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AlarmIcon from '@mui/icons-material/Alarm';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import { ThemeTooltip } from "../global/ThemeTooltip";
import clonedeep from 'lodash.clonedeep';

interface CreateTimingProps {
	minion: Minion;
	onDone: () => void;
	fontRatio: number;
	/** Whenever need to show the create timing component */
	showAddTiming: boolean;
}

export function CreateTiming(props: CreateTimingProps) {
	const { t } = useTranslation();
	const theme = useTheme();
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
	const [creating, setCreating] = useState<boolean>(false);
	const [timingType, setTimingType] = useState<TimingTypes>(TimingTypes.DailyTimeTrigger);
	const [timingProperties, setTimingProperties] = useState<TimingProperties>(defaultTimingProperties(timingType));
	const [minionStatus, setMinionStatus] = useState<MinionStatus>(defaultMinionStatus(props.minion.minionType));

	useEffect(() => {
		// In order to show current minion status as a default timing set status mode, every time 
		// The minion selected or "create timing" reopened close minion status as the default status to start from,  
		setMinionStatus(clonedeep(props.minion.minionStatus));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.minion.minionId, props.showAddTiming]);

	useEffect(() => {
		// Every time user reopened "create timing" recalculate default timing props, 
		// to make sure the inital default time is present. see https://github.com/casanet/dashboard-app/issues/49
		setTimingProperties(defaultTimingProperties(timingType));
	}, [timingType, props.showAddTiming]);

	const { fontRatio } = props;
	async function createTiming() {
		if (!timingProperties || !minionStatus) {
			return;
		}
		setCreating(true);
		try {
			await ApiFacade.TimingsApi.createTiming({
				timingProperties,
				timingType,
				timingName: 'auto',
				isActive: true,
				timingId: '',
				triggerDirectAction: {
					minionStatus,
					minionId: props.minion.minionId || '',
				}
			});
			await timingsService.forceFetchData();
			props.onDone();
		} catch (error) {
			handleServerRestError(error);
		}
		setCreating(false);
	}

	return <div style={{ width: '100%' }}>
		<Grid
			style={{ width: '100%' }}
			container
			direction="row"
			justifyContent="center"
			alignItems="center"

		>
			<ToggleButtonGroup
				disabled={creating}
				orientation="horizontal"
				size="large"
				value={timingType}
				exclusive
				onChange={(e, v) => {
					if (!v) {
						return;
					}
					const newTimingType = v as TimingTypes;
					setTimingType(newTimingType);
					setTimingProperties(defaultTimingProperties(newTimingType));
				}}
			>
				<ToggleButton value={TimingTypes.DailyTimeTrigger} aria-label={t(mapTimingsTypeToDisplay[TimingTypes.DailyTimeTrigger])} style={{ color: getModeColor(true, theme) }}>
					<ThemeTooltip title={<span>{t(mapTimingsTypeToDisplay[TimingTypes.DailyTimeTrigger])}</span>}>
						<DateRangeIcon style={{ fontSize: props.fontRatio * 1.4 }} />
					</ThemeTooltip>
				</ToggleButton>
				<ToggleButton value={TimingTypes.DailySunTrigger} aria-label={t(mapTimingsTypeToDisplay[TimingTypes.DailySunTrigger])} style={{ color: getModeColor(true, theme) }}>
					<ThemeTooltip title={<span>{t(mapTimingsTypeToDisplay[TimingTypes.DailySunTrigger])}</span>}>
						<Brightness4Icon style={{ fontSize: props.fontRatio * 1.4 }} />
					</ThemeTooltip>
				</ToggleButton>
				<ToggleButton value={TimingTypes.Once} aria-label={t(mapTimingsTypeToDisplay[TimingTypes.Once])} style={{ color: getModeColor(true, theme) }}>
					<ThemeTooltip title={<span>{t(mapTimingsTypeToDisplay[TimingTypes.Once])}</span>}>
						<AlarmIcon style={{ fontSize: props.fontRatio * 1.4 }} />
					</ThemeTooltip>
				</ToggleButton>
				<ToggleButton value={TimingTypes.Timeout} aria-label={t(mapTimingsTypeToDisplay[TimingTypes.Timeout])} style={{ color: getModeColor(true, theme) }}>
					<ThemeTooltip title={<span>{t(mapTimingsTypeToDisplay[TimingTypes.Timeout])}</span>}>
						<TimerIcon style={{ fontSize: props.fontRatio * 1.4 }} />
					</ThemeTooltip>
				</ToggleButton>
			</ToggleButtonGroup>
		</Grid>
		<div style={{ marginTop: fontRatio * 1.2, minHeight: fontRatio * 6 }}>
			<Grid
				style={{ height: '100%' }}
				container
				direction="column"
				justifyContent="center"
				alignItems="center"
			>
				{timingType && <TimingEdit disabled={creating} timingType={timingType} fontRatio={fontRatio} timingProperties={timingProperties} setTimingProperties={setTimingProperties} />}
			</Grid>
		</div>
		<div>
			<Grid
				container
				direction={desktopMode ? 'row' : 'column'}
				justifyContent="center"
				alignItems="center"
			>
				<div>
					<SwitchEditStatus disabled={creating} minionStatus={minionStatus} setMinionStatus={setMinionStatus} minionType={props.minion.minionType} fontRatio={fontRatio * 1.7} smallFontRatio={fontRatio * 1.7 * 0.5} isOn={isOnMode(props.minion.minionType, minionStatus)} />
				</div>
				<div>
					{props.minion.minionType !== MinionTypes.Toggle && props.minion.minionType !== MinionTypes.Switch &&
						<MinionEditStatus disabled={creating} minionStatus={minionStatus} setMinionStatus={setMinionStatus} minionType={props.minion.minionType} fontRatio={fontRatio * 1.7} />
					}
				</div>
			</Grid>
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
				loading={creating}
				loadingPosition={desktopMode ? 'start' : 'center'}
				disabled={!!!timingProperties}
				variant="contained"
				color={'primary'}
				onClick={createTiming}>
				{t('dashboard.timings.create.timing')}
			</LoadingButton>
		</Grid>
	</div>
}