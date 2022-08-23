import { Grid, IconButton, useTheme } from "@material-ui/core";
import { useState } from "react";
import { useTranslation } from "react-i18next"
import { handleServerRestError } from "../../services/notifications.service";
import clonedeep from 'lodash.clonedeep';
import CircularProgress from "@mui/material/CircularProgress";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { AlertDialog } from "../AlertDialog";
import CloseIcon from '@material-ui/icons/Close';
import { ThemeSwitch } from "../global/ThemeSwitch";
import { ThemeTooltip } from "../global/ThemeTooltip";
import { marginLeft } from "../../logic/common/themeUtils";
import { Action, ApiFacade } from "../../infrastructure/generated/api/swagger/api";
import { actionsService } from "../../services/actions.service";

interface ActionOverviewControlsProps {
	action: Action;
	fontRatio: number;
	setEditMode: (editMode: boolean) => void;
	editMode: boolean;
}

export function ActionOverviewControls(props: ActionOverviewControlsProps) {
	const { t } = useTranslation();
	const theme = useTheme();
	const [settingActive, setSettingActive] = useState<boolean>(false);
	const [deleting, setDeleting] = useState<boolean>(false);
	const [openDeleteModel, setOpenDeleteModel] = useState<boolean>(false);

	const { fontRatio, action, editMode } = props;

	async function changeActionActive() {
		setSettingActive(true);
		try {
			const editedAction = clonedeep<Action>(action);
			editedAction.active = !!!action.active;
			await ApiFacade.ActionsApi.setAction(editedAction.actionId, editedAction);
			// Do not fetch again, just update service
			actionsService.updateAction(editedAction);
		} catch (error) {
			handleServerRestError(error);
		}
		setSettingActive(false);
	}

	async function deleteTiming() {
		setDeleting(true);
		try {
			await ApiFacade.ActionsApi.deleteAction(action.actionId);
			// Do not fetch again, just update service
			actionsService.deleteAction(action);
		} catch (error) {
			handleServerRestError(error);
		}
		setDeleting(false);
	}

	return <div style={{ [marginLeft(theme)]: fontRatio * 0.25, minWidth: fontRatio * 2.5 }}>
		<AlertDialog
			open={openDeleteModel}
			cancelText={t('global.cancel')}
			submitText={t('dashboard.actions.delete.action')}
			title={t('dashboard.actions.delete.action.alert.title', { name: action.name })}
			text={t('dashboard.actions.delete.action.alert.text', { name: action.name })}
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
				{!settingActive && <ThemeSwitch disabled={settingActive || deleting} checked={action.active} size="medium" onChange={() => changeActionActive()} />}
				{settingActive && <div style={{ [marginLeft(theme)]: fontRatio, marginTop: 10 }}>
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
					<ThemeTooltip title={<span>{t('global.edit')}</span>} >
						<IconButton
							style={{ padding: fontRatio * 0.1 }}
							onClick={() => { props.setEditMode(true); }}
							color="inherit">
							<EditIcon style={{ fontSize: fontRatio * 0.9 }} />
						</IconButton>
					</ThemeTooltip>
				</div>}
				{editMode && <div>
					<ThemeTooltip title={<span>{t('global.close')}</span>} >
						<IconButton
							style={{ padding: fontRatio * 0.1 }}
							onClick={() => { props.setEditMode(false); }}
							color="inherit">
							<CloseIcon style={{ fontSize: fontRatio * 0.9 }} />
						</IconButton>
					</ThemeTooltip>
				</div>}
				{!deleting && <div>
					<ThemeTooltip title={<span>{t('dashboard.actions.delete.action')}</span>} >
						<IconButton
							style={{ padding: fontRatio * 0.1 }}
							onClick={() => { setOpenDeleteModel(true); }}
							color="inherit">
							<DeleteIcon style={{ fontSize: fontRatio * 0.9 }} />
						</IconButton>
					</ThemeTooltip>
				</div>}
				{deleting && <div>
					<CircularProgress thickness={5} size={fontRatio * 0.7} />
				</div>}
			</Grid>
		</Grid>
	</div>;
}