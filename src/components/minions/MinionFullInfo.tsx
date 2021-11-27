import { Button, Grid, IconButton } from "@material-ui/core";
import { Minion, MinionStatus } from "../../infrastructure/generated/api";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DashboardRoutes, DEFAULT_FONT_RATION, SIDE_CONTAINER_DEFAULT_FONT_SIZE } from "../../infrastructure/consts";
import { MinionPowerToggle } from "./MinionPowerToggle";
import CloseIcon from '@material-ui/icons/Close';
import '../../theme/styles/components/minions/minionFullInfo.scss';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { Suspense, useState } from "react";
import { ApiFacade } from "../../infrastructure/generated/proxies/api-proxies";
import { minionsService } from "../../services/minions.service";
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

const MinionTimeline = React.lazy(() => import('./timeline/MinionTimeline'));

const DEFAULT_FONT_SIZE = SIDE_CONTAINER_DEFAULT_FONT_SIZE;

interface MinionFullInfoProps {
	minion: Minion;
}

export function MinionFullInfo(props: MinionFullInfoProps) {
	const { t } = useTranslation();
	const history = useHistory();
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
	const videDesktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

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
		setSaving(true);
		try {
			await ApiFacade.MinionsApi.setMinion(minionStatusToSet, minion.minionId || '');
			minion.minionStatus = minionStatusToSet;
			minionsService.updateMinion(minion);
		} catch (error) {
			handleServerRestError(error);
		}
		setSaving(false);
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
			<div className="minion-full-info-part">
				<Grid
					container
					direction="row"
					justifyContent="space-between"
					alignItems="flex-start"
				>
					<div>
						<MinionPowerToggle minion={minion} fontRatio={DEFAULT_FONT_SIZE} />
						<MinionIndicators minion={minion} fontRatio={DEFAULT_FONT_SIZE} smallFontRatio={DEFAULT_FONT_SIZE * 0.5} />
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
					disabled={saving}
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
					direction="row"
					justifyContent="center"
					alignItems="center"
				>
					<MinionBottomControls minion={minion} fontRatio={DEFAULT_FONT_SIZE} />
					<div style={{ marginTop: videDesktopMode ? -DEFAULT_FONT_SIZE : 0}}>
						<MinionTimeoutOverview minion={minion} fontRatio={DEFAULT_FONT_SIZE * 0.25} />
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
							<div className="minion-timings-area">
								<MinionTimingsView minion={minion} />
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
							{/* Load it async by lazy */}
							<Suspense fallback={<Loader fontRatio={DEFAULT_FONT_RATION * 2} />}>
								<MinionTimeline key={minion.minionId} fontRatio={DEFAULT_FONT_SIZE} minion={minion} />
							</Suspense>
						</AccordionDetails>
					</Accordion>
					<Accordion>
						<AccordionSummary
							expandIcon={<ExpandMoreIcon />}
						>
							<Typography>{t('global.advanced.settings')}</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<MinionAdvancedSettings key={minion.minionId} fontRatio={DEFAULT_FONT_SIZE} minion={minion} />
						</AccordionDetails>
					</Accordion>
					<Accordion>
						<AccordionSummary
							expandIcon={<ExpandMoreIcon />}
						>
							<Typography>{t('dashboard.minions.minion.tech.info')}</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<MinionTechInfo fontRatio={DEFAULT_FONT_SIZE} minion={minion} />
						</AccordionDetails>
					</Accordion>
				</div>
				<div className="minion-delete-container">
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
				</div>
			</div>
		</Grid>
	</div>;
}
