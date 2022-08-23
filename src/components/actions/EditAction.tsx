import { Button, Grid, Theme, useMediaQuery, useTheme } from "@material-ui/core";
import { CSSProperties, useState } from "react";
import { handleServerRestError } from "../../services/notifications.service";
import { useTranslation } from "react-i18next";
import { defaultMinionStatus, isOnMode } from "../../logic/common/minionsUtils";
import { MinionEditStatus } from "../minions/editMinionStatus/MinionEditStatus";
import { SwitchEditStatus } from "../minions/editMinionStatus/SwitchEditStatus";
import LoadingButton from '@mui/lab/LoadingButton';
import { Divider, List, ListItem, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { getModeColor, marginLeft } from "../../logic/common/themeUtils";
import { ThemeTooltip } from "../global/ThemeTooltip";
import { ActionApply, ActionSet, ApiFacade, Minion, MinionStatus, MinionTypes } from "../../infrastructure/generated/api/swagger/api";
import { actionsService } from "../../services/actions.service";
import InfoIcon from '@mui/icons-material/Info';
import { Action } from "../../infrastructure/generated/api/swagger/api";
import LockIcon from '@material-ui/icons/Lock';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import { EditActionSet } from "./EditActionSet";
import cloneDeep from "lodash.clonedeep";
import AddIcon from '@mui/icons-material/Add';

interface EditActionProps {
	/** In edit mode, the action to modify */
	action?: Action;
	minion: Minion;
	onDone: () => void;
	fontRatio: number;
	/** Whenever need to show the create timing component */
	showAddAction: boolean;
	mode: 'edit' | 'create';
}

export function EditAction(props: EditActionProps) {
	const { t } = useTranslation();
	const theme = useTheme();

	// Clone the action, to make any modification here, will not affect the original action (till save)
	// Use this copy for init component on edit mode
	const actionCopy = cloneDeep(props.action);

	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
	const [saving, setSaving] = useState<boolean>(false);
	const [actionApply, setActionApply] = useState<ActionApply>((props.mode === 'edit' && actionCopy?.apply) || ActionApply.StatusChange);
	const [actionsSet, setActionsSet] = useState<ActionSet[]>((props.mode === 'edit' && actionCopy?.thenSet) || []);
	const [name, setName] = useState<string>(props.mode === 'edit' ? (actionCopy?.name || '') : `${t('dashboard.actions.default.name')} ${Math.floor(Math.random() * 1000)}`);
	const [minionStatus, setMinionStatus] = useState<MinionStatus>((props.mode === 'edit' && actionCopy?.ifStatus) || defaultMinionStatus(props.minion.minionType));

	const { fontRatio } = props;

	const applyActionStyle: CSSProperties = { fontSize: fontRatio * 0.8 };

	async function saveAction() {
		setSaving(true);
		try {
			if (props.mode === 'create') {
				await ApiFacade.ActionsApi.createAction({
					name,
					actionId: '',
					active: true,
					apply: actionApply,
					ifStatus: minionStatus,
					minionId: props.minion.minionId || '',
					thenSet: actionsSet
				});
			} else {
				await ApiFacade.ActionsApi.setAction(actionCopy?.actionId || '', {
					name,
					actionId: actionCopy?.actionId ?? '',
					active: actionCopy?.active ?? true,
					apply: actionApply,
					ifStatus: minionStatus,
					minionId: props.minion.minionId ?? '',
					thenSet: actionsSet
				});
			}
			await actionsService.forceFetchData();
			props.onDone();
		} catch (error) {
			handleServerRestError(error);
		}
		setSaving(false);
	}

	return <div style={{ width: '100%' }}>
		<div>
			<Grid
				container
				direction={desktopMode ? 'row' : 'column'}
				justifyContent="space-between"
				alignItems={'flex-start'}
				style={{ marginTop: '5%' }}
			>
				<div style={{ marginTop: '5px' }}>
					<Grid
						container
						direction={'row'}
						justifyContent="flex-start"
						alignItems="center"
					>
						<Typography style={{ fontSize: fontRatio * 0.8 }} >{t('dashboard.actions.action.name')}</Typography>
					</Grid>
				</div>
				<div style={{ width: desktopMode ? '65%' : '100%' }} >
					<Grid

						container
						direction="column"
						justifyContent="center"
						alignItems="flex-start"
						style={{ width: '100%', [marginLeft(theme)]: fontRatio * (desktopMode ? 0.6 : 0), marginTop: fontRatio * 0.2 }}
					>
						<div style={{ width: '100%' }}>
							<TextField
								style={{ width: `100%` }}
								disabled={saving}
								variant="standard"
								value={name}
								placeholder={t('dashboard.actions.action.name.placeholder')}
								onChange={(e) => {
									setName(e.target.value);
								}}
							/>
						</div>
					</Grid>
				</div>
			</Grid>
			<Grid
				container
				direction={desktopMode ? 'row' : 'column'}
				justifyContent="space-between"
				alignItems={'flex-start'}
				style={{ marginTop: '5%' }}
			>
				<div style={{ marginTop: '5px' }}>
					<Grid
						container
						direction={'row'}
						justifyContent="flex-start"
						alignItems="center"
					>
						<Typography style={{ fontSize: fontRatio * 0.8 }} >{t('dashboard.actions.action.apply.on')}</Typography>
						<ThemeTooltip title={<span>{t('dashboard.actions.action.apply.on.tip')}</span>}>
							<InfoIcon style={{ fontSize: fontRatio * 0.8, marginTop: fontRatio * -0.2 }} />
						</ThemeTooltip>
					</Grid>
				</div>
				<div style={{ width: desktopMode ? '65%' : '100%' }} >
					<Grid
						container
						direction="column"
						justifyContent="center"
						alignItems="flex-start"
						style={{ [marginLeft(theme)]: fontRatio * (desktopMode ? 0.6 : 0), marginTop: fontRatio * 0.2 }}
					>
						<div style={{ width: '100%' }}>
							<ToggleButtonGroup
								orientation="horizontal"
								size="small"
								value={actionApply}
								onChange={(e, v) => {
									if (!v) {
										return;
									}
									setActionApply(v);
								}}
								exclusive
								style={{ width: '100%' }}
							>
								<ToggleButton value={ActionApply.StatusChange} aria-label={t('dashboard.actions.action.apply.status.changed.tip')} style={{ width: '50%', color: getModeColor(true, theme) }}>
									<ThemeTooltip title={<span>{t('dashboard.actions.action.apply.status.changed.tip')}</span>}>
										<div>
											<div>
												<RadioButtonCheckedIcon style={applyActionStyle} />

											</div>
											<div>
												<Typography style={{ fontSize: fontRatio * 0.5 }} >{t('dashboard.actions.action.apply.status.changed')}</Typography>
											</div>
										</div>
									</ThemeTooltip>
								</ToggleButton>
								<ToggleButton value={ActionApply.Permanent} aria-label={t('dashboard.actions.action.apply.permanent.tip')} style={{ width: '50%', color: getModeColor(true, theme) }}>
									<ThemeTooltip title={<span>{t('dashboard.actions.action.apply.permanent.tip')}</span>}>
										<div>
											<div>
												<LockIcon style={applyActionStyle} />
											</div>
											<div>
												<Typography style={{ fontSize: fontRatio * 0.5 }} >{t('dashboard.actions.action.apply.permanent')}</Typography>
											</div>
										</div>
									</ThemeTooltip>
								</ToggleButton>
							</ToggleButtonGroup>
						</div>
					</Grid>
				</div>
			</Grid>
			<Grid
				container
				direction={desktopMode ? 'row' : 'column'}
				justifyContent="space-between"
				alignItems={'flex-start'}
				style={{ marginTop: '5%' }}
			>
				<div style={{ marginTop: '5px' }}>
					<Grid
						container
						direction={'row'}
						justifyContent="flex-start"
						alignItems="center"
					>
						<Typography style={{ fontSize: fontRatio * 0.8 }} >{t('dashboard.actions.action.trigger.status')}</Typography>
						<ThemeTooltip title={<span>{t('dashboard.actions.action.trigger.status.tip')}</span>}>
							<InfoIcon style={{ fontSize: fontRatio * 0.8, marginTop: fontRatio * -0.2 }} />
						</ThemeTooltip>
					</Grid>
				</div>
				<div style={{ width: desktopMode ? '65%' : '100%' }} >
					<Grid
						container
						direction={desktopMode ? 'row' : 'column'}
						justifyContent="center"
						alignItems="center"
					>
						<div>
							<SwitchEditStatus disabled={saving} minionStatus={minionStatus} setMinionStatus={setMinionStatus} minionType={props.minion.minionType} fontRatio={fontRatio * 1.6} smallFontRatio={fontRatio * 1.6 * 0.5} isOn={isOnMode(props.minion.minionType, minionStatus)} />
						</div>
						{props.minion.minionType !== MinionTypes.Toggle && props.minion.minionType !== MinionTypes.Switch &&
							<div>
								<MinionEditStatus disabled={saving} minionStatus={minionStatus} setMinionStatus={setMinionStatus} minionType={props.minion.minionType} fontRatio={fontRatio * 1.6} />
							</div>
						}
					</Grid>
				</div>
			</Grid>
			<Grid
				container
				direction={desktopMode ? 'row' : 'column'}
				justifyContent="space-between"
				alignItems={'flex-start'}
				style={{ marginTop: '5%' }}
			>
				<div>
					<Grid
						container
						direction={'row'}
						justifyContent="flex-start"
						alignItems="center"
					>
						<Typography style={{ fontSize: fontRatio * 0.8 }} >{t('dashboard.actions.action.set.statuses')}</Typography>
						<ThemeTooltip title={<span>{t('dashboard.actions.action.set.statuses.tip')}</span>}>
							<InfoIcon style={{ fontSize: fontRatio * 0.8, marginTop: fontRatio * -0.2 }} />
						</ThemeTooltip>
					</Grid>
				</div>
				<div style={{ width: desktopMode ? '65%' : '100%' }} >

					<Grid
						style={{ margin: desktopMode ? '7%' : '0%', width: '100%' }}
						container
						direction={'column'}
						justifyContent="center"
						alignItems="center"
					>
						{!actionsSet.length &&
							<Typography style={{ fontSize: fontRatio * 0.8, textAlign: 'center' }} >{t('dashboard.actions.action.no.actions.set')}</Typography>

						}
						<List style={{ width: '100%' }}>
							{actionsSet?.map((actionSet, index) => (<div>
								<ListItem>
									<EditActionSet key={actionsSet?.length} disable={saving} minionOwner={props.minion} actionSet={actionSet}
										onRemove={() => {
											setActionsSet(actionsSet.filter((a, i) => i !== index));
										}}
										onUpdate={() => {
											setActionsSet([...actionsSet]);
										}}
									/>
								</ListItem>
								<Divider />
							</div>))}
						</List>
						<Button
							startIcon={<AddIcon />}
							style={{ width: '60%' }}
							variant="contained"
							onClick={() => {
								setActionsSet([...actionsSet, {
									minionId: '',
									setStatus: {}
								}]);
							}}>{t('dashboard.actions.action.add.status')}</Button>

					</Grid>
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
				loading={saving}
				loadingPosition={desktopMode ? 'start' : 'center'}
				disabled={actionsSet.some(a => !a.minionId)}
				variant="contained"
				color={'primary'}
				onClick={saveAction}>
				{t(`dashboard.actions.${props.mode}.action`)}
			</LoadingButton>
		</Grid>
	</div>
}