import { Button, Grid, Theme, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import Divider from "@mui/material/Divider";
import { useState } from "react";
import { MinionUnifiedStatusOverview } from "../minions/overviewMinionsStatus/MinionStatusOverview";
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from "react-i18next";
import { isOnMode } from "../../logic/common/minionsUtils";
import { getModeColor, marginLeft } from "../../logic/common/themeUtils";
import Collapse from '@mui/material/Collapse';
import { Duration } from "unitsnet-js";
import { DEFAULT_FONT_RATION } from "../../infrastructure/consts";
import { Minion } from "../../infrastructure/generated/api/swagger/api";
import { ActionOverviewControls } from "./ActionOverviewControls";
import { EditAction } from "./EditAction";
import { useData } from "../../hooks/useData";
import { actionsService } from "../../services/actions.service";
import { Loader } from "../Loader";

interface MinionTimingsViewProps {
	minion: Minion;
}

const PROPERTIES_OPEN_ANIMATION_DURATION = Duration.FromSeconds(0.8);

export default function MinionActionsView(props: MinionTimingsViewProps) {
	const { t } = useTranslation();
	const theme = useTheme();
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
	const [showAddAction, setShowAddAction] = useState<boolean>(false);
	const [showEditActionId, setShowEditActionId] = useState<string>();
	const [actions, loading] = useData(actionsService);

	if (loading) {
		return <Loader fontRatio={DEFAULT_FONT_RATION * 2} />
	}
	// Allocate all minion's actions
	const minionActions = actions.filter(a => a.minionId === props.minion?.minionId);

	return <div>
		{!minionActions?.length && <Grid
			container
			direction="column"
			justifyContent="center"
			alignItems="center"
		>
			<Typography style={{ fontSize: DEFAULT_FONT_RATION * 0.7, color: getModeColor(false, theme) }} >{t('dashboard.actions.no.actions.set')}</Typography>
		</Grid>}
		{minionActions.map((action) => {
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
								[marginLeft(theme)]: !desktopMode ? (DEFAULT_FONT_RATION * 0.2) : 0,
								fontSize: DEFAULT_FONT_RATION * 0.65,
								maxWidth: '55%',
								textOverflow: 'clip',
								color: getModeColor(action.active, theme)
							}}
						>
							{action.name}
						</div>
						<div>
							<MinionUnifiedStatusOverview
								minionType={props.minion.minionType}
								minionStatus={action?.ifStatus}
								fontRatio={DEFAULT_FONT_RATION * 0.8}
								smallFontRatio={DEFAULT_FONT_RATION * 0.5}
								showSwitches={true}
								disabled={!action.active}
								isOn={action.active && isOnMode(props.minion.minionType, action?.ifStatus)}
							/>
						</div>
					</Grid>
					<Grid
						style={{ maxWidth: DEFAULT_FONT_RATION * 2.5, marginBottom: DEFAULT_FONT_RATION * 0.3 }}
						container
						direction={'row'}
						justifyContent="space-between"
						alignItems="center"
					>
						<ActionOverviewControls
							fontRatio={DEFAULT_FONT_RATION}
							action={action}
							editMode={showEditActionId === action.actionId}
							setEditMode={(editMode) => { setShowEditActionId(editMode ? action.actionId : undefined); setShowAddAction(false); }}
						/>
					</Grid>
				</div>
				<Collapse in={showEditActionId === action.actionId} timeout={PROPERTIES_OPEN_ANIMATION_DURATION.Milliseconds}>
					<div style={{ margin: DEFAULT_FONT_RATION }}>
						<EditAction key={showEditActionId} mode={'edit'} action={action} collapse={showEditActionId !== action.actionId} minion={props.minion} onDone={() => setShowEditActionId(undefined)} fontRatio={DEFAULT_FONT_RATION} />
					</div>
				</Collapse>
				<Divider variant={'fullWidth'} flexItem />
			</div>;
		})}
		<div style={{ marginTop: DEFAULT_FONT_RATION, width: '100%' }}>
			<Collapse in={showAddAction} timeout={PROPERTIES_OPEN_ANIMATION_DURATION.Milliseconds}>
				<EditAction collapse={showAddAction} mode={'create'} minion={props.minion} onDone={() => setShowAddAction(false)} fontRatio={DEFAULT_FONT_RATION} />
			</Collapse>
			{!showAddAction && <Grid
				container
				direction="column"
				justifyContent="center"
				alignItems="stretch"
			>
				<Button onClick={() => { setShowAddAction(true); setShowEditActionId(undefined); }} variant='contained' startIcon={<AddIcon />}>
					{t('dashboard.actions.create.action')}
				</Button>
			</Grid>}
		</div>
	</div>
}