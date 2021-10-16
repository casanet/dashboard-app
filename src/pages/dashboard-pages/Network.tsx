import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { CircularProgress, Grid, IconButton, TextField } from '@material-ui/core';
import { devicesService } from '../../services/devices.service';
import { LocalNetworkDevice } from '../../infrastructure/generated/api';
import { useEffect, useState } from 'react';
import { handleServerRestError } from '../../services/notifications.service';
import { Loader } from '../../components/Loader';
import { compareIpByDevicePart } from '../../infrastructure/utils';
import { useTranslation } from 'react-i18next';
import { ThemeTooltip } from '../../components/global/ThemeTooltip';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';
import { DEFAULT_FONT_RATION } from '../../infrastructure/consts';
import { ApiFacade } from '../../infrastructure/generated/proxies/api-proxies';
import { DashboardPageInjectProps } from '../Dashboard';

/**
 * The sort formula for sorting devices by ip -> name
 */
function sortDevicesFormula(a: LocalNetworkDevice, b: LocalNetworkDevice): number {
	if (a.ip && b.ip) {
		return compareIpByDevicePart(a.ip, b.ip);
	}

	if (a.ip) {
		return 1;
	}

	if (b.ip) {
		return -1;
	}

	return (a.name || '') < (b.name || '') ? 1 : -1;
}

const NAME_CONTROLS_WIDTH = 45;
const NAME_MIN_WIDTH = 150;
const NAME_MAX_WIDTH = 280;

export default function Network(props: DashboardPageInjectProps) {
	const { t } = useTranslation();
	const [loading, setLoading] = useState<boolean>(true);
	const [saving, setSaving] = useState<boolean>(false);
	const [devices, setDevices] = useState<LocalNetworkDevice[]>([]);
	const [filteredDevices, setFilteredDevices] = useState<LocalNetworkDevice[]>([]);
	const [editNameMode, setEditNameMode] = useState<string>('');
	const [editName, setEditName] = useState<string>('');

	useEffect(() => {
		let devicesDetacher: () => void;
		setLoading(true);
		(async () => {
			try {
				// Subscribe to the minion data feed
				devicesDetacher = await devicesService.attachDataSubs((devices) => {
					setDevices(devices.sort(sortDevicesFormula));
				});
			} catch (error) {
				await handleServerRestError(error);
			}
			setLoading(false);
		})();

		return () => {
			// unsubscribe the feed on component unmount
			devicesDetacher && devicesDetacher();
		};
	}, []);

	useEffect(() => {
		// every time the devices collection has changed or the search term changed, re-calc the filtered minions
		calcDevicesFilter(devices);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [devices, props.searchText]);

	function calcDevicesFilter(devices: LocalNetworkDevice[]) {
		const searchString = props.searchText?.trim().toLowerCase() || '';
		const filteredDevices = !searchString ? devices : devices.filter(d => {
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
		setFilteredDevices(filteredDevices);
	}

	function selectNameToEdit(device: LocalNetworkDevice) {
		setEditNameMode(device.mac);
		setEditName(device.name || '');
	}

	async function setName(device: LocalNetworkDevice) {
		setSaving(true);
		try {
			const setDevice = { ...device, name: editName || '' };
			await ApiFacade.DevicesApi.setDeviceName(setDevice, device.mac);
			// Once change succeed, update the service
			device.name = setDevice.name;
			devicesService.postNewData(devices);
		} catch (error) {
			handleServerRestError(error);
		}
		setSaving(false);
		setEditNameMode('');
	}

	if (loading) {
		return <Loader />;
	}

	return <Grid
		style={{ width: '100%', height: '100%' }}
		container
		direction="column"
		justifyContent="space-between"
		alignItems="stretch"
	>
		<TableContainer component={Paper}>
			<Table stickyHeader>
				<TableHead>
					<TableRow>
						<TableCell align="center">{t('dashboard.network.device.name')}</TableCell>
						<TableCell align="center">{t('dashboard.network.device.mac')}</TableCell>
						<TableCell align="center">{t('dashboard.network.device.ip')}</TableCell>
						<TableCell align="center">{t('dashboard.network.device.vendor')}</TableCell>
					</TableRow>
				</TableHead>
				<TableBody >
					{filteredDevices.map((device) => (
						<TableRow
							key={device.mac}
						>
							<TableCell align="center" width={NAME_MAX_WIDTH} >
								<Grid
									style={{ minWidth: NAME_MIN_WIDTH }}
									container
									direction="row"
									justifyContent="space-between"
									alignItems="center"
								>
									{editNameMode !== device.mac && <div>
										{device.name}
									</div>}
									{editNameMode === device.mac && <TextField
										style={{ width: `calc(100% - ${NAME_CONTROLS_WIDTH}px)` }}
										disabled={saving}
										variant="standard"
										value={editName}
										onChange={(e) => {
											setEditName(e.target.value);
										}}
									/>}
									{editNameMode !== device.mac && <div>
										<ThemeTooltip title={<span>{t('global.edit')}</span>} >
											<IconButton
												disabled={saving}
												onClick={() => selectNameToEdit(device)}
												color="inherit">
												<EditIcon fontSize="small" />
											</IconButton>
										</ThemeTooltip>
									</div>}
									{editNameMode === device.mac && <div>
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
														onClick={() => { setName(device); }}
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
								</Grid>
							</TableCell>
							<TableCell align="center">{device.mac}</TableCell>
							<TableCell align="center">{device.ip}</TableCell>
							<TableCell align="center">{device.vendor}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	</Grid>;
}