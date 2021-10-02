import { Grid, IconButton, Tooltip, useTheme } from "@material-ui/core";
import { useState } from "react";
import { useTranslation } from "react-i18next"
import { ApiFacade } from "../../infrastructure/generated/proxies/api-proxies";
import { handleServerRestError } from "../../services/notifications.service";
import { timingsService } from "../../services/timings.service";
import clonedeep from 'lodash.clonedeep';
import CircularProgress from "@mui/material/CircularProgress";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Timing } from "../../infrastructure/generated/api";
import { AlertDialog } from "../AlertDialog";
import CloseIcon from '@material-ui/icons/Close';
import { ThemeSwitch } from "../global/ThemeSwitch";

interface TimingOverviewControlsProps {
	timing: Timing;
	fontRatio: number;
	setEditMode: (editMode: boolean) => void;
	editMode: boolean;
}

export function TimingOverviewControls(props: TimingOverviewControlsProps) {
	const { t } = useTranslation();
	const theme = useTheme();
	const [settingActive, setSettingActive] = useState<boolean>(false);
	const [deleting, setDeleting] = useState<boolean>(false);
	const [openDeleteModel, setOpenDeleteModel] = useState<boolean>(false);

	const { fontRatio, timing, editMode } = props;

	async function changeTimingActive() {
		setSettingActive(true);
		try {
			const editedTiming = clonedeep<Timing>(timing);
			editedTiming.isActive = !!!timing.isActive;
			await ApiFacade.TimingsApi.setTiming(editedTiming, editedTiming.timingId);
			// Do not fetch again, just update service
			timingsService.updateTiming(editedTiming);
		} catch (error) {
			handleServerRestError(error);
		}
		setSettingActive(false);
	}

	async function deleteTiming() {
		setDeleting(true);
		try {
			await ApiFacade.TimingsApi.deleteTiming(timing.timingId);
			// Do not fetch again, just update service
			timingsService.deleteTiming(timing);
		} catch (error) {
			handleServerRestError(error);
		}
		setDeleting(false);
	}

	return <div style={{ [theme.direction === 'ltr' ? 'marginLeft' : 'marginRight']: fontRatio * 0.25, minWidth: fontRatio * 2.5 }}>
		<AlertDialog
			open={openDeleteModel}
			cancelText={t('global.cancel')}
			submitText={t('dashboard.timings.delete.timing')}
			title={t('dashboard.timings.delete.timing.alert.title')}
			text={t('dashboard.timings.delete.timing.alert.text')}
			onCancel={() => setOpenDeleteModel(false)}
			onSubmit={() => { setOpenDeleteModel(false); deleteTiming(); }}
			submitColor={'error'}
		/>
		<Grid
			container
			direction="column"
			justifyContent="center"
			alignItems="center"
		>
			{/* The switch have fixed size, so just take the container with same dimensions */}
			<div style={{ width: '58px', height: '38px' }}>
				{!settingActive && <ThemeSwitch disabled={settingActive || deleting} checked={props.timing.isActive} size="medium" onChange={() => changeTimingActive()} />}
				{settingActive && <div style={{ [theme.direction === 'ltr' ? 'marginLeft' : 'marginRight']: fontRatio, marginTop: 10 }}>
					<CircularProgress thickness={5} size={fontRatio} />
				</div>
				}
			</div>
			<Grid
				style={{ minWidth: fontRatio * 2 }}
				container
				direction="row"
				justifyContent="center"
				alignItems="center"
			>
				{!editMode && !deleting && <div>
					<Tooltip title={<span>{t('global.edit')}</span>} >
						<IconButton
							style={{ padding: fontRatio * 0.1 }}
							onClick={() => { props.setEditMode(true); }}
							color="inherit">
							<EditIcon style={{ fontSize: fontRatio * 0.9 }} />
						</IconButton>
					</Tooltip>
				</div>}
				{editMode && <div>
					<Tooltip title={<span>{t('global.close')}</span>} >
						<IconButton
							style={{ padding: fontRatio * 0.1 }}
							onClick={() => { props.setEditMode(false); }}
							color="inherit">
							<CloseIcon style={{ fontSize: fontRatio * 0.9 }} />
						</IconButton>
					</Tooltip>
				</div>}
				{!deleting && <div>
					<Tooltip title={<span>{t('dashboard.timings.delete.timing')}</span>} >
						<IconButton
							style={{ padding: fontRatio * 0.1 }}
							onClick={() => { setOpenDeleteModel(true); }}
							color="inherit">
							<DeleteIcon style={{ fontSize: fontRatio * 0.9 }} />
						</IconButton>
					</Tooltip>
				</div>}
				{deleting && <div>
					<CircularProgress thickness={5} size={fontRatio * 0.7} />
				</div>}
			</Grid>
		</Grid>
	</div>;
}