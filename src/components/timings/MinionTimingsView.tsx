import { Button, Grid, Theme, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import Divider from "@mui/material/Divider";
import { useEffect, useState } from "react";
import { Minion, MinionStatus, MinionTypes, Timing } from "../../infrastructure/generated/api";
import { handleServerRestError } from "../../services/notifications.service";
import { timingsService } from "../../services/timings.service";
import { MinionStatusOverview, SwitchOverview } from "../minions/overviewMinionsStatus/MinionStatusOverview";
import { TimingOverview } from "./TimingOverview";
import { TimingOverviewControls } from "./TimingOverviewControls";
import AddIcon from '@mui/icons-material/Add';
import { CreateTiming } from "./CreateTiming";
import { EditTimingProps } from "./EditTimingProps";
import { useTranslation } from "react-i18next";
import { isOnMode } from "../../logic/common/minionsUtils";
import { getModeColor } from "../../logic/common/themeUtils";

interface MinionTimingsViewProps {
	minion: Minion;
}

const DEFAULT_FONT_RATION = 20;

export function MinionTimingsView(props: MinionTimingsViewProps) {
	const { t } = useTranslation();
	const theme = useTheme();
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
	const [minionTimings, setMinionTimings] = useState<Timing[]>([]);
	const [showAddTiming, setShowAddTiming] = useState<boolean>(false);
	const [showEditTimingId, setShowEditTimingId] = useState<string>();

	useEffect(() => {
		let minionsDetacher: () => void;

		(async () => {
			try {
				// Subscribe to the minion data feed
				minionsDetacher = await timingsService.attachDataSubs((timings) => {
					const minionTimings = timings.filter((t) => t.triggerDirectAction?.minionId === props.minion?.minionId)
					// Filter out other timings
					setMinionTimings(minionTimings);
				});
			} catch (error) {
				await handleServerRestError(error);
			}
		})();

		setShowAddTiming(false)
		return () => {
			// unsubscribe the feed on component unmount
			minionsDetacher && minionsDetacher();
		};
	}, [props.minion?.minionId]);

	return <div>
		{!minionTimings?.length && <Grid
			container
			direction="column"
			justifyContent="center"
			alignItems="center"
		>
			<Typography style={{ fontSize: DEFAULT_FONT_RATION * 0.7, color: getModeColor(false, theme) }} >{t('dashboard.timings.no.timings.set')}</Typography>
		</Grid>}
		{minionTimings.map((timing) => {
			return <div style={{ width: '100%' }}>
				<div style={{ display: 'flex' }}>
					<Grid
						style={{ width: '100%' }}
						container
						// In mobile show it on above other
						direction={desktopMode ? 'row' : 'column'}
						justifyContent="space-between"
						// In mobile align content in the start
						alignItems={desktopMode ? 'center' : 'flex-start'}
					>
						<div
							style={{
								marginTop: !desktopMode ? (DEFAULT_FONT_RATION * 0.3) : 0,
								[theme.direction === 'ltr' ? 'marginLeft' : 'marginRight']: !desktopMode ? (DEFAULT_FONT_RATION * 0.2) : 0
							}}
						>
							<TimingOverview timingType={timing.timingType} timingProperties={timing.timingProperties} fontRatio={DEFAULT_FONT_RATION} disabled={!timing.isActive} />
						</div>
						<div>
							<Grid
								container
								direction="row"
								justifyContent="center"
								alignItems={'center'}
							>
								{/* For every complex minion show in addition the simple on/off option beside the advanced props */}
								{props.minion.minionType !== MinionTypes.Toggle && props.minion.minionType !== MinionTypes.Switch && <div>
									<SwitchOverview
										minionType={props.minion.minionType}
										minionStatus={timing.triggerDirectAction?.minionStatus as MinionStatus}
										fontRatio={DEFAULT_FONT_RATION}
										smallFontRatio={DEFAULT_FONT_RATION * 0.5}
										isOn={timing.isActive && isOnMode(props.minion.minionType, timing.triggerDirectAction?.minionStatus)}
									/>
								</div>}
								<MinionStatusOverview
									minionType={props.minion.minionType}
									minionStatus={timing.triggerDirectAction?.minionStatus as MinionStatus}
									fontRatio={DEFAULT_FONT_RATION}
									smallFontRatio={DEFAULT_FONT_RATION * 0.5}
									showSwitches={true}
									disabled={!timing.isActive}
								/>
							</Grid>
						</div>
					</Grid>
					<Grid
						style={{ maxWidth: DEFAULT_FONT_RATION * 2.5, marginBottom: DEFAULT_FONT_RATION * 0.3 }}
						container
						direction={'row'}
						justifyContent="space-between"
						alignItems="center"
					>
						<TimingOverviewControls
							fontRatio={DEFAULT_FONT_RATION}
							timing={timing}
							editMode={showEditTimingId === timing.timingId}
							setEditMode={(editMode) => { setShowEditTimingId(editMode ? timing.timingId : undefined); setShowAddTiming(false); }}
						/>
					</Grid>
				</div>
				{showEditTimingId === timing.timingId && <div style={{ margin: DEFAULT_FONT_RATION }}>
					<EditTimingProps minion={props.minion} timing={timing} onDone={() => setShowEditTimingId(undefined)} fontRatio={DEFAULT_FONT_RATION} />
				</div>}
				<Divider variant={'fullWidth'} flexItem />
			</div>;
		})}
		<div style={{ marginTop: DEFAULT_FONT_RATION, width: '100%' }}>
			{showAddTiming && <CreateTiming minion={props.minion} onDone={() => setShowAddTiming(false)} fontRatio={DEFAULT_FONT_RATION} />}
			{!showAddTiming && <Grid
				container
				direction="column"
				justifyContent="center"
				alignItems="stretch"
			>
				<Button onClick={() => { setShowAddTiming(true); setShowEditTimingId(undefined); }} variant='contained' startIcon={<AddIcon />}>
					{t('dashboard.timings.create.timing')}
				</Button>
			</Grid>}
		</div>
	</div>
}