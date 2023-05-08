import { Button, Grid, IconButton } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import debounce from "lodash.debounce";
import cloneDeep from "lodash.clonedeep";
import { Duration } from "unitsnet-js";
import { useTranslation } from "react-i18next";
import { DashboardRoutes, DEFAULT_FONT_RATION, SIDE_CONTAINER_DEFAULT_FONT_SIZE } from "../../infrastructure/consts";
import { MinionPowerToggle } from "./MinionPowerToggle";
import CloseIcon from '@material-ui/icons/Close';
import '../../theme/styles/components/minions/minionFullInfo.scss';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { Suspense, useState } from "react";
import { Minion, minionsService } from "../../services/minions.service";
import { handleServerRestError } from "../../services/notifications.service";
import { MinionEditableName } from "./MinionEditableName";
import { MinionEditStatus } from "./editMinionStatus/MinionEditStatus";
import { AlertDialog } from "../AlertDialog";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useMediaQuery from "@mui/material/useMediaQuery";
import { Theme } from "@mui/material";
import { MinionTimingsView } from "../timings/MinionTimingsView";
import { MinionTechInfo } from "./MinionTechInfo";
import { MinionAdvancedSettings } from "./advancedSettings/MinionAdvancedSettings";
import { MinionBottomControls } from "./MinionBottomControls";
import { ThemeTooltip } from "../global/ThemeTooltip";
import React from "react";
import { Loader } from "../Loader";
import { MinionIndicators } from "./MinionIndicators";
import { MinionTimeoutOverview } from "./MinionTimeoutOverview";
import { ApiFacade, MinionStatus } from "../../infrastructure/generated/api/swagger/api";
import { MinionBatteryOverview } from "./MinionBatteryOverview";
import { sessionManager } from "../../infrastructure/session-manager";

const MinionTimeline = React.lazy(() => import('./timeline/MinionTimeline'));
const MinionActionsView = React.lazy(() => import('../actions/MinionActionsView'));
const MinionRestrictions = React.lazy(() => import('./restrictions/MinionRestrictions'));

const DEFAULT_FONT_SIZE = SIDE_CONTAINER_DEFAULT_FONT_SIZE;

interface MinionFullInfoProps {
	minion: Minion;
}

interface ApplyStatusChangeProps {
	/** The set save status pf the view component */
	setSaving: (saving: boolean) => void;
	/** The minion with the new status to set */
	minion: Minion;
	/** The original status, to set in case of failure */
	originalStatus: MinionStatus;
}

/**
 * Apply minion status change via Rest call
 */
async function applyMinionStatusChange(props: ApplyStatusChangeProps) {
	props.setSaving(true);
	try {
		await ApiFacade.MinionsApi.setMinion(props.minion.minionId || '', props.minion.minionStatus);
	} catch (error) {
		props.minion.minionStatus = props.originalStatus;
		minionsService.updateMinion(props.minion);

		handleServerRestError(error);
	}
	props.setSaving(false);
}

// In order to not apply changes immediately in case a user wants to click a few times till he gets the wanted status
// This debounce is holding his last selection till the end of the changes, then applying the change via a Rest call
const applyMinionStatusChangeDebounced = debounce(applyMinionStatusChange, Duration.FromSeconds(1).Milliseconds);

export function MinionFullInfo(props: MinionFullInfoProps) {
	const { t } = useTranslation();
	const history = useHistory();
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

	const [deleting, setDeleting] = useState<boolean>(false);
	const [saving, setSaving] = useState<boolean>();
	const [openDeleteAlert, setOpenDeleteAlert] = useState<boolean>(false);

	const { minion } = props;

	async function deleteMinion() {
		setDeleting(true);
		try {
			await ApiFacade.MinionsApi.deleteMinion(minion.minionId || '');
			minionsService.deleteMinion(minion);
		} catch (error) {
			handleServerRestError(error);
		}
		setDeleting(false);
	}

	async function setMinionStatus(minionStatusToSet: MinionStatus) {
		// Copy original status, in case failure that will require a status revert.
		const originalStatus = cloneDeep(minion.minionStatus);
		// Set status in front
		minion.minionStatus = minionStatusToSet;
		minionsService.updateMinion(minion);
		// Apply changes on server only after a debounced, to allow user make few changes in the same "clicks" session.
		applyMinionStatusChangeDebounced({
			minion,
			originalStatus,
			setSaving
		});
	}

	return <div className={`page-full-info-area ${!desktopMode && 'hide-scroll'}`}>
		<Grid
			className="page-full-info-container"
			container
			direction="column"
			justifyContent="space-between"
			alignItems="stretch"
		>
			{/* Header: (status toggle, name and close) */}
			<div className="minion-full-info-part" style={{
				zIndex: 1 // The indicators, some time is higher then the overall div, and need to be shown above the other parts, to show the tooltip on over
			}}>
				<Grid
					container
					direction="row"
					justifyContent="space-between"
					alignItems="flex-start"
				>
					<div>
						<MinionPowerToggle minion={minion} fontRatio={DEFAULT_FONT_SIZE} />
						<div style={{ height: 0, width: 0 }}>
							<MinionIndicators showAsRow={false} minion={minion} fontRatio={DEFAULT_FONT_SIZE} smallFontRatio={DEFAULT_FONT_SIZE * 0.5} />
						</div>
					</div>
					<div style={{ width: `calc(100% - ${(DEFAULT_FONT_SIZE + 15) * 2}px)` }}>
						<MinionEditableName {...props} fontRatio={DEFAULT_FONT_SIZE} />
					</div>
					<div>
						<ThemeTooltip title={<span>{t('global.close')}</span>}>
							<IconButton
								onClick={() => { history.push(DashboardRoutes.minions.path); }}
								color="inherit">
								<CloseIcon style={{ fontSize: DEFAULT_FONT_SIZE * 0.70 }} />
							</IconButton>
						</ThemeTooltip>
					</div>
				</Grid>
			</div>
			{/* Minion status properties */}
			<div className="minion-full-info-part">
				<MinionEditStatus
					minionStatus={minion.minionStatus}
					minionType={minion.minionType}
					setMinionStatus={setMinionStatus}
					disabled={saving || minion.readonly}
					fontRatio={desktopMode ? DEFAULT_FONT_SIZE : DEFAULT_FONT_SIZE * 0.7}
					smallFontRatio={desktopMode ? DEFAULT_FONT_SIZE * 0.5 : DEFAULT_FONT_SIZE * 0.5 * 0.7} />
				<div style={{ padding: `${DEFAULT_FONT_SIZE * 0.3}px` }}>
					{saving && <LinearProgress color={'inherit'} />}
				</div>
			</div>
			<div className="minion-full-info-part">
				{/* Only to take a place */}
			</div>
			<div className="minion-full-info-part">
				<Grid
					container
					direction="row-reverse"
					justifyContent="space-between"
					alignItems="center"
				>
					<div>
						<MinionBottomControls minion={minion} fontRatio={DEFAULT_FONT_SIZE} />
					</div>
					<div >
						<MinionTimeoutOverview minion={minion} fontRatio={DEFAULT_FONT_SIZE * 0.25} />
					</div>
					<div>
						<MinionBatteryOverview minion={minion} fontRatio={DEFAULT_FONT_SIZE * 0.6} />
					</div>
				</Grid>
				<div className="minion-advanced-option-container">
					<Accordion>
						<AccordionSummary
							expandIcon={<ExpandMoreIcon />}
						>
							<Typography>{t('global.timings')}</Typography>
						</AccordionSummary>
						<AccordionDetails>
							{/* TODO: make it lazy loading */}
							<div className="minion-advanced-option-area">
								<MinionTimingsView minion={minion} />
							</div>
						</AccordionDetails>
					</Accordion>
					<Accordion>
						<AccordionSummary
							expandIcon={<ExpandMoreIcon />}
						>
							<Typography>{t('global.actions')}</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<div className="minion-advanced-option-area">
								<Suspense fallback={<Loader fontRatio={DEFAULT_FONT_RATION * 2} />}>
									<MinionActionsView minion={minion} />
								</Suspense>
							</div>
						</AccordionDetails>
					</Accordion>
					<Accordion TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}>
						<AccordionSummary
							expandIcon={<ExpandMoreIcon />}
						>
							<Typography>{t('dashboard.minions.timeline')}</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<div className="minion-advanced-option-area">
								<Suspense fallback={<Loader fontRatio={DEFAULT_FONT_RATION * 2} />}>
									<MinionTimeline key={minion.minionId} fontRatio={DEFAULT_FONT_SIZE} minion={minion} />
								</Suspense>
							</div>
						</AccordionDetails>
					</Accordion>
					<Accordion>
						<AccordionSummary
							expandIcon={<ExpandMoreIcon />}
						>
							<Typography>{t('global.advanced.settings')}</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<div className="minion-advanced-option-area">
								<MinionAdvancedSettings key={minion.minionId} fontRatio={DEFAULT_FONT_SIZE} minion={minion} />
							</div>
						</AccordionDetails>
					</Accordion>
					{sessionManager.isAdmin && <Accordion>
						<AccordionSummary
							expandIcon={<ExpandMoreIcon />}
						>
							<Typography>{t('global.minion.restrictions')}</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<div className="minion-advanced-option-area">
								<Suspense fallback={<Loader fontRatio={DEFAULT_FONT_RATION * 2} />}>
									<MinionRestrictions minion={minion} />
								</Suspense>
							</div>
						</AccordionDetails>
					</Accordion>}
					<Accordion>
						<AccordionSummary
							expandIcon={<ExpandMoreIcon />}
						>
							<Typography>{t('dashboard.minions.minion.tech.info')}</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<div className="minion-advanced-option-area">
								<MinionTechInfo fontRatio={DEFAULT_FONT_SIZE} minion={minion} />
							</div>
						</AccordionDetails>
					</Accordion>
				</div>
				{!minion?.readonly && <div className="minion-delete-container">
					<AlertDialog
						open={openDeleteAlert}
						cancelText={t('global.cancel')}
						submitText={t('dashboard.minions.delete.minion')}
						title={t('dashboard.minions.delete.minion.alert.title', { name: minion.name })}
						text={t('dashboard.minions.delete.minion.alert.text', { name: minion.name })}
						onCancel={() => setOpenDeleteAlert(false)}
						onSubmit={() => { setOpenDeleteAlert(false); deleteMinion(); }}
						submitColor={'error'}
					/>
					<Button disabled={deleting} variant="contained" style={{ width: '100%' }} onClick={() => setOpenDeleteAlert(true)}>
						<Box sx={{ width: '100%' }}>
							{t('dashboard.minions.delete.minion')}
							{deleting && <LinearProgress color="error" />}
						</Box>
					</Button>
				</div>}
			</div>
		</Grid>
	</div>;
}
