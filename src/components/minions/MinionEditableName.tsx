import { CircularProgress, Grid, IconButton, TextField, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import CloseIcon from '@material-ui/icons/Close';
import '../../theme/styles/components/minions/minionEditableName.scss';
import { Fragment, useState } from "react";
import { Minion, minionsService } from "../../services/minions.service";
import { handleServerRestError } from "../../services/notifications.service";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@material-ui/icons/Save';
import { ThemeTooltip } from "../global/ThemeTooltip";
import { ApiFacade } from "../../infrastructure/generated/api/swagger/api";

interface MinionMinionEditableNameProps {
	minion: Minion;
	fontRatio: number;
}

export function MinionEditableName(props: MinionMinionEditableNameProps) {
	const { t } = useTranslation();
	const [editNameMode, setEditNameMode] = useState<boolean>(false);
	const [editingName, setEditingName] = useState<boolean>(false);
	const [editNameError, setEditNameError] = useState<boolean>(false);
	const [editName, setEditName] = useState<string>('');
	const { minion, fontRatio } = props;

	async function renameMinion() {
		if (!editName) {
			setEditNameError(true);
			return;
		}
		setEditingName(true);
		try {
			await ApiFacade.MinionsApi.renameMinion(minion.minionId || '', { name: editName });
			minion.name = editName;
			minionsService.updateMinion(minion);
		} catch (error) {
			handleServerRestError(error);
		}
		setEditingName(false);
		setEditNameMode(false);
	}


	return <Fragment>
		<Grid
			className="minion-editable-name-grid"
			container
			direction="row"
			justifyContent="center"
			alignItems="center"
		>
			{!editNameMode && <div style={{ maxWidth: `calc(100% - ${fontRatio * 0.5}px)` }}>
				<Typography className="minion-name" style={{ fontSize: fontRatio * 0.55 }}>{minion.name}</Typography>
			</div>}
			{editNameMode && <div style={{ width: `calc(100% - ${fontRatio * 1.6}px)` }}>
				<TextField
					style={{ width: `100%` }}
					disabled={editingName}
					error={editNameError}
					variant="standard"
					value={editName}
					onChange={(e) => {
						setEditNameError(false);
						setEditName(e.target.value);
					}}
				/>
			</div>}
			<div>
				{!editNameMode && !minion.readonly && <ThemeTooltip title={<span>{t('dashboard.minions.edit.name')}</span>} >
					<IconButton
						disabled={minion.readonly}
						style={{ padding: fontRatio * 0.1 }}
						onClick={() => { setEditNameMode(true); setEditName(minion.name); }}
						color="inherit">
						<EditIcon style={{ fontSize: fontRatio * 0.3 }} />
					</IconButton>
				</ThemeTooltip>}
				{editingName && <CircularProgress size={fontRatio * 0.3} thickness={10} />}
				{!editingName && editNameMode && <ThemeTooltip title={<span>{t('dashboard.minions.save.name')}</span>} >
					<IconButton
						style={{ padding: fontRatio * 0.1 }}
						onClick={renameMinion}
						color="inherit">
						<SaveIcon style={{ fontSize: fontRatio * 0.3 }} />
					</IconButton>
				</ThemeTooltip>}
				{!editingName && editNameMode && <ThemeTooltip title={<span>{t('global.cancel')}</span>} >
					<IconButton
						style={{ padding: fontRatio * 0.1 }}
						onClick={() => { setEditNameMode(false); }}
						color="inherit">
						<CloseIcon style={{ fontSize: fontRatio * 0.3 }} />
					</IconButton>
				</ThemeTooltip>}
			</div>
		</Grid>
	</Fragment>
}