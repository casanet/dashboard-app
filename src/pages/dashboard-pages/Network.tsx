import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { CircularProgress, Grid, IconButton, TextField, Theme, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { devicesService } from '../../services/devices.service';
import { ComponentType, useEffect, useState } from 'react';
import { handleServerRestError } from '../../services/notifications.service';
import { Loader } from '../../components/Loader';
import { compareIpByDevicePart } from '../../infrastructure/utils';
import { useTranslation } from 'react-i18next';
import { ThemeTooltip } from '../../components/global/ThemeTooltip';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';
import { DEFAULT_FONT_RATION } from '../../infrastructure/consts';
import { DashboardPageInjectProps } from '../Dashboard';
import { NoContent } from '../../components/NoContent';
import RouterIcon from '@material-ui/icons/Router';
import { marginLeft } from '../../logic/common/themeUtils';
import { useData } from '../../hooks/useData';
import { PageLayout } from '../../components/layouts/PageLayout';
import { ApiFacade, LocalNetworkDevice } from '../../infrastructure/generated/api/swagger/api';
import { textSearchService } from '../../services/text.serach.service';

/**
 * The sort formula for sorting devices by ip -> name
 */
function sortDevicesFormula(a: LocalNetworkDevice, b: LocalNetworkDevice): number {
	if (a.ip && b.ip) {
		return compareIpByDevicePart(a.ip, b.ip);
	}

	if (a.ip) {
		return -1;
	}

	if (b.ip) {
		return 1;
	}

	return (a.name || '') < (b.name || '') ? -1 : 1;
}

const NAME_CONTROLS_WIDTH = 45;
const NAME_MOBILE_WIDTH = DEFAULT_FONT_RATION * 8;
const NAME_DESKTOP_WIDTH = DEFAULT_FONT_RATION * 15;

interface NetworkComponentProps {
	device: LocalNetworkDevice;
}

interface NetworkComponent {
	title: string;
	content: ComponentType<NetworkComponentProps>;
}

interface NetworkLayoutProps {
	devices: LocalNetworkDevice[];
	name: NetworkComponent;
	mac: NetworkComponent;
	ip: NetworkComponent;
	vendor: NetworkComponent;
}

/**
 * The network devices page desktop layout
 */
function NetworkDesktopLayout(props: NetworkLayoutProps) {
	return <TableContainer component={Paper}>
		<Table stickyHeader>
			<TableHead>
				<TableRow>
					<TableCell >{props.name.title}</TableCell>
					<TableCell align="center">{props.mac.title}</TableCell>
					<TableCell align="center">{props.ip.title}</TableCell>
					<TableCell align="center">{props.vendor.title}</TableCell>
				</TableRow>
			</TableHead>
			<TableBody >
				{props.devices.map((device) => (
					<TableRow
						key={device.mac}
					>
						<TableCell ><props.name.content device={device} /></TableCell>
						<TableCell align="center"><props.mac.content device={device} /></TableCell>
						<TableCell align="center"><props.ip.content device={device} /></TableCell>
						<TableCell align="center"><props.vendor.content device={device} /></TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	</TableContainer>
}

/**
 * The network devices page mobile layout
 */
function NetworkMobileLayout(props: NetworkLayoutProps) {
	const theme = useTheme();

	const titleFontSize = DEFAULT_FONT_RATION * 0.5;
	const textFontSize = DEFAULT_FONT_RATION * 0.7;

	return <Grid
		container
		direction="column"
		justifyContent="center"
		alignItems="stretch"
	>
		{props.devices.map(device =>
			<Paper elevation={3} style={{ margin: DEFAULT_FONT_RATION }}>
				<Grid
					style={{ padding: DEFAULT_FONT_RATION }}
					container
					direction="column"
					justifyContent="center"
					alignItems="stretch"
				>
					{/* On the first row, show the editable device name */}
					<Grid
						style={{ width: '100%', marginBottom: DEFAULT_FONT_RATION * 0.5 }}
						container
						direction="row"
						justifyContent="flex-start"
						alignItems="center"
					>
						<Typography style={{ fontSize: titleFontSize, width: '100%', color: theme.palette.text.hint }} >{props.name.title}</Typography>
						<div style={{ fontSize: textFontSize, width: '100%' }} ><props.name.content device={device} /></div>
					</Grid>
					{/* On the second row, show the mac & IP */}
					<Grid
						style={{ width: '100%', marginBottom: DEFAULT_FONT_RATION * 0.5 }}
						container
						direction="row"
						justifyContent="space-between"
						alignItems="flex-end"
					>
						<div>
							<Grid
								container
								direction="column"
								justifyContent="center"
								alignItems="flex-start"
							>
								<div>
									<Typography style={{ fontSize: titleFontSize, color: theme.palette.text.hint }} >{props.ip.title}</Typography>
								</div>
								<div>
									<Typography style={{ fontSize: textFontSize }} ><props.ip.content device={device} /></Typography>
								</div>
							</Grid>
						</div>
						<div>
							<Grid
								container
								direction="column"
								justifyContent="center"
								alignItems="flex-start"
							>
								<div>
									<Typography style={{ fontSize: titleFontSize, color: theme.palette.text.hint }} >{props.mac.title}</Typography>
								</div>
								<div>
									<Typography style={{ fontSize: textFontSize }} ><props.mac.content device={device} /></Typography>
								</div>
							</Grid>
						</div>
					</Grid>
					{/* On the last row, show the vendor name */}
					<Grid
						style={{ width: '100%' }}
						container
						direction="row"
						justifyContent="flex-start"
						alignItems="center"
					>
						<Typography style={{ fontSize: titleFontSize, width: '100%', color: theme.palette.text.hint }} >{props.vendor.title}</Typography>
						<Typography style={{ fontSize: textFontSize }} ><props.vendor.content device={device} /></Typography>
					</Grid>
				</Grid>
			</Paper>
		)
		}
	</Grid >
}

export default function Network(props: DashboardPageInjectProps) {
	const { t } = useTranslation();
	const theme = useTheme();
	const wideDesktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
	const [devices, loading] = useData(devicesService);
	const [searchText] = useData(textSearchService)

	const [saving, setSaving] = useState<boolean>(false);
	const [filteredDevices, setFilteredDevices] = useState<LocalNetworkDevice[]>([]);
	const [editNameMode, setEditNameMode] = useState<string>('');

	useEffect(() => {
		// every time the devices collection has changed or the search term changed, re-calc the filtered minions
		calcDevicesFilter(devices);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [devices, searchText]);

	function calcDevicesFilter(devices: LocalNetworkDevice[]) {
		const searchString = searchText?.trim().toLowerCase() || '';
		// In case of empty search term, "clone" collection anyway to avoid sort cache issue
		const filteredDevices = !searchString ? [...devices] : devices.filter(d => {
			// If the name match, return true
			if (d.name?.toLowerCase().includes(searchString)) {
				return true;
			}
			if (d.mac?.toLowerCase().includes(searchString)) {
				return true;
			}
			if (d.ip?.toLowerCase().includes(searchString)) {
				return true;
			}
			if (d.vendor?.toLowerCase().includes(searchString)) {
				return true;
			}
			return false;
		});

		setFilteredDevices(filteredDevices.sort(sortDevicesFormula));
	}

	function selectNameToEdit(device: LocalNetworkDevice) {
		setEditNameMode(device.mac);
	}

	async function setName(device: LocalNetworkDevice, name: string) {
		setSaving(true);
		const lastName = device.name;
		try {
			// Create "new" device instance with the new name
			const setDevice = { ...device, name };
			// Update current view device name
			device.name = setDevice.name;
			await ApiFacade.DevicesApi.setDeviceName(device.mac, setDevice);
			devicesService.postNewData(devices);
		} catch (error) {
			// Once change failure, revert the name change
			device.name = lastName;
			handleServerRestError(error);
		}
		setSaving(false);
		// Reset edit name input
		setEditNameMode('');
	}

	if (loading) {
		return <Loader fancy={{ text: t('dashboard.loading.data', { data: t('global.network').toLowerCase() }) }}/>;
	}

	// If there are no any device, show proper message
	if (devices.length === 0) {
		return <NoContent Icon={RouterIcon} message={t('dashboard.network.no.devices.message')} />
	}

	// If there are no any device match the search, show proper message
	if (filteredDevices.length === 0) {
		return <NoContent Icon={RouterIcon} message={t('dashboard.network.no.devices.match.message')} />
	}


	function NameComponent(props: NetworkComponentProps) {
		const [editName, setEditName] = useState<string>();

		const nameCellWidth = wideDesktopMode ? NAME_DESKTOP_WIDTH : NAME_MOBILE_WIDTH;

		return <Grid
			id="network-page-container"
			style={{ minWidth: nameCellWidth, width: '100%' }}
			container
			direction="row"
			justifyContent="flex-start"
			alignItems="center"
		>
			{editNameMode !== props.device.mac && <div style={{
				// Show all over the width, but give some space for the edit button
				width: `calc(100% - ${NAME_CONTROLS_WIDTH}px)`,
			}}>
				<Typography style={{
					width: wideDesktopMode ? nameCellWidth - NAME_CONTROLS_WIDTH : '100%',
					textOverflow: 'clip',
					overflowWrap: 'break-word'
				}}>
					{props.device.name}
				</Typography>
			</div>}
			{/* On edit mode, show the name within the text input */}
			{editNameMode === props.device.mac && <TextField
				// Show all over the width, but give some space for the save/cancel/loading
				style={{ width: `calc(100% - ${NAME_CONTROLS_WIDTH}px)` }}
				disabled={saving}
				variant="standard"
				value={editName === undefined ? props.device.name : editName}
				onChange={(e) => {
					setEditName(e.target.value);
				}}
			/>}
			{/* The edit button, show when not in edit mode */}
			{editNameMode !== props.device.mac && <div>
				<ThemeTooltip title={<span>{t('global.edit')}</span>} >
					<IconButton
						disabled={saving}
						onClick={() => selectNameToEdit(props.device)}
						color="inherit">
						<EditIcon fontSize="small" />
					</IconButton>
				</ThemeTooltip>
			</div>}
			{/* On edit mode, the edit controls container (edit, save, loading etc) */}
			{editNameMode === props.device.mac && <div
				style={{ [marginLeft(theme)]: DEFAULT_FONT_RATION * 0.4 }}
			>
				{saving && <CircularProgress size={DEFAULT_FONT_RATION * 1.85} thickness={8} />}
				{!saving && <Grid
					container
					direction="column"
					justifyContent="center"
					alignItems="center"
				>
					<div>
						<ThemeTooltip title={<span>{t('global.save')}</span>} >
							<IconButton
								style={{ padding: DEFAULT_FONT_RATION * 0.15 }}
								onClick={() => { setName(props.device, editName || ''); }}
								color="inherit">
								<SaveIcon style={{ fontSize: DEFAULT_FONT_RATION * 0.8 }} />
							</IconButton>
						</ThemeTooltip>
					</div>
					<div>
						<ThemeTooltip title={<span>{t('global.cancel')}</span>} >
							<IconButton
								style={{ padding: DEFAULT_FONT_RATION * 0.15 }}
								onClick={() => { setEditNameMode(''); }}
								color="inherit">
								<CloseIcon style={{ fontSize: DEFAULT_FONT_RATION * 0.8 }} />
							</IconButton>
						</ThemeTooltip>
					</div>
				</Grid>}
			</div>}
		</Grid>;
	}

	function MACComponent(props: NetworkComponentProps) {
		return <div>{props.device.mac}</div>;
	}

	function IPComponent(props: NetworkComponentProps) {
		return <div>{props.device.ip}</div>;
	}

	function VendorComponent(props: NetworkComponentProps) {
		return <div>{props.device.vendor}</div>;
	}

	const NetworkLayout = wideDesktopMode ? NetworkDesktopLayout : NetworkMobileLayout;

	return <PageLayout>
		<NetworkLayout
			devices={filteredDevices}
			name={{
				title: t('dashboard.network.device.name'),
				content: NameComponent
			}}
			mac={{
				title: t('dashboard.network.device.mac'),
				content: MACComponent
			}}
			ip={{
				title: t('dashboard.network.device.ip'),
				content: IPComponent
			}}
			vendor={{
				title: t('dashboard.network.device.vendor'),
				content: VendorComponent
			}}
		/>
	</PageLayout>;
}