import { CircularProgress, Grid, IconButton, TextField, Tooltip, Typography } from "@material-ui/core";
import { Minion } from "../../infrastructure/generated/api";
import { useTranslation } from "react-i18next";
import CloseIcon from '@material-ui/icons/Close';
import '../../theme/styles/components/minions/minionEditableName.scss';
import { Fragment, useState } from "react";
import { ApiFacade } from "../../infrastructure/generated/proxies/api-proxies";
import { minionsService } from "../../services/minions.service";
import { handleServerRestError } from "../../services/notifications.service";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@material-ui/icons/Save';

interface MinionMinionEditableName {
	minion: Minion;
	fontRatio: number;
}

export function MinionEditableName(props: MinionMinionEditableName) {
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
			await ApiFacade.MinionsApi.renameMinion({ name: editName }, minion.minionId || '');
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
			{!editNameMode && <div style={{ maxWidth: `calc(100% - ${fontRatio / 2}px)` }}>
				<Typography className="minion-name" style={{ fontSize: fontRatio * 0.7 }}>{minion.name}</Typography>
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
				{!editNameMode && <Tooltip title={<span>{t('dashboard.minions.edit.name')}</span>} >
					<IconButton
						style={{ padding: fontRatio * 0.1 }}
						onClick={() => { setEditNameMode(true); setEditName(minion.name); }}
						color="inherit">
						<EditIcon style={{ fontSize: fontRatio * 0.3 }} />
					</IconButton>
				</Tooltip>}
				{editingName && <CircularProgress size={fontRatio * 0.3} thickness={10} />}
				{!editingName && editNameMode && <Tooltip title={<span>{t('dashboard.minions.save.name')}</span>} >
					<IconButton
						style={{ padding: fontRatio * 0.1, marginLeft: fontRatio * 0.3 }}
						onClick={renameMinion}
						color="inherit">
						<SaveIcon style={{ fontSize: fontRatio * 0.3 }} />
					</IconButton>
				</Tooltip>}
				{!editingName && editNameMode && <Tooltip title={<span>{t('global.cancel')}</span>} >
					<IconButton
						style={{ padding: fontRatio * 0.1 }}
						onClick={() => { setEditNameMode(false); }}
						color="inherit">
						<CloseIcon style={{ fontSize: fontRatio * 0.3 }} />
					</IconButton>
				</Tooltip>}
			</div>
		</Grid>
	</Fragment>
}