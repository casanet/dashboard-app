import { FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Tooltip, Typography, useTheme } from "@material-ui/core";
import { useTranslation } from "react-i18next"
import { CommandsRepoDevice, Minion } from "../../../infrastructure/generated/api";
import InfoIcon from '@mui/icons-material/Info';
import { useState } from "react";
import { ApiFacade } from "../../../infrastructure/generated/proxies/api-proxies";
import { handleServerRestError } from "../../../services/notifications.service";
import { getModeColor } from "../../../logic/common/themeUtils";
import PlayForWorkIcon from '@mui/icons-material/PlayForWork';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import LoadingButton from "@mui/lab/LoadingButton";
import DoneIcon from '@mui/icons-material/Done';
import { ThemeTooltip } from "../../global/ThemeTooltip";

interface MinionFetchCommandsProps {
	fontRatio: number;
	minion: Minion;
}

export function MinionFetchCommands(props: MinionFetchCommandsProps) {
	const { t } = useTranslation();
	const [fetching, setFetching] = useState<boolean>();
	const [success, setSuccess] = useState<boolean>();
	const [applying, setApplying] = useState<boolean>();
	const [message, setMessage] = useState<string>();
	const [commandsSet, setCommandsSet] = useState<CommandsRepoDevice[]>();
	const [selectedCommandsSet, setSelectedCommandsSet] = useState<CommandsRepoDevice>();
	const theme = useTheme();
	const { fontRatio, minion } = props;

	async function fetchCommands() {
		setFetching(true);
		try {
			setMessage(t('dashboard.minions.advanced.settings.fetching.commands'));
			const commandsSet = await ApiFacade.RFApi.getCommandsRepoAvailableDevices();
			// Filter out irrelevant categories, and sort collection by brand/model names
			const minionAvailableCommands = commandsSet
				.filter(c => c.category === minion.minionType)
				.sort((a, b) => {
					if (a.brand !== b.brand) {
						return a.brand > b.brand ? 1 : -1;
					}
					return a.model > b.model ? 1 : -1;
				});
			setCommandsSet(minionAvailableCommands);
		} catch (error) {
			setMessage(t('dashboard.minions.advanced.settings.fetching.commands.issue'));
			await handleServerRestError(error);
		}
		setFetching(false);
	}

	async function applyCommands() {
		if (!selectedCommandsSet) {
			return;
		}
		setApplying(true);
		try {
			await ApiFacade.RFApi.fetchDeviceCommandsToMinion(selectedCommandsSet, minion.minionId || '');
			// Show success indicator for 2.5 sec.
			setSuccess(true);
			setTimeout(() => {
				setSuccess(false);
			}, 2500);
		} catch (error) {
			await handleServerRestError(error);
		}
		setApplying(false);
	}

	return <Grid
		container
		direction="column"
		justifyContent="center"
		alignItems="stretch"
	>
		<Grid
			container
			direction="row"
			justifyContent="space-between"
			alignItems="center"
		>
			<div>
				<Grid
					container
					direction={'row'}
					justifyContent="flex-start"
					alignItems="center"
				>
					<Typography style={{ fontSize: fontRatio * 0.3 }} >{t('dashboard.minions.advanced.settings.fetch.commands.set')}</Typography>
					<Tooltip title={<span>{t('dashboard.minions.advanced.settings.fetch.commands.set.tip')}</span>}>
						<InfoIcon style={{ fontSize: fontRatio * 0.3, marginTop: fontRatio * -0.2 }} />
					</Tooltip>
				</Grid>
			</div>



			<ThemeTooltip title={<span>{t(`dashboard.minions.advanced.settings.fetch.available.commands`)}</span>} disableFocusListener >
				<IconButton
					disabled={fetching}
					onClick={fetchCommands}
					color="inherit"
				>
					{/* In case of fetching, show loader icon */}
					{fetching && <MoreHorizIcon style={{ fontSize: fontRatio * 0.6, color: getModeColor(false, theme) }} />}
					{(!fetching) && <PlayForWorkIcon style={{ fontSize: fontRatio * 0.6 }} />}
				</IconButton>
			</ThemeTooltip>
		</Grid>
		<Grid
			style={{ width: '100%' }}
			container
			direction="row"
			justifyContent="space-between"
			alignItems="flex-end"
		>
			{!commandsSet && message && <div style={{ width: '100%', textAlign: 'center', color: theme.palette.text.hint }}>
				{message}
			</div>}
			{commandsSet && <FormControl style={{ width: '65%' }} variant="outlined">
				<InputLabel id="commands.select-select-label">{t('dashboard.minions.advanced.settings.select.commands.set')}</InputLabel>
				<Select
					labelId="commands.select-select-label"
					value={selectedCommandsSet}
					label={t('dashboard.minions.advanced.settings.select.commands.set')}
					onChange={(e) => {
						// Extract the model and brand that selected, and select it
						const selection: string = e.target.value as string || ':';
						const [brand, model] = selection.split(':');
						setSelectedCommandsSet(commandsSet.find(c => c.brand === brand && c.model === model));
					}}
				>
					{
						commandsSet.map(c => <MenuItem value={`${c.brand}:${c.model}`}>{c.brand}, {c.model}</MenuItem>)
					}
				</Select>
			</FormControl>}
			{commandsSet && <LoadingButton
				style={{ minWidth: '30%' }}
				loading={applying}
				loadingPosition={'center'}
				disabled={!!!selectedCommandsSet || success}
				variant="contained"
				color={'primary'}
				onClick={applyCommands}>
				{!success ? <span>{t('global.apply')}</span> : <DoneIcon />}
			</LoadingButton>}
		</Grid>
	</Grid>;
}
