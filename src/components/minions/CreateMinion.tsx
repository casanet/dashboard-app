import { Button, Grid, TextField, useTheme } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { DashboardRoutes, SERVER_REPO_URL, SIDE_CONTAINER_DEFAULT_FONT_SIZE } from "../../infrastructure/consts";
import '../../theme/styles/components/minions/minionFullInfo.scss';
import { useEffect, useState } from "react";
import { minionsService } from "../../services/minions.service";
import { handleServerRestError } from "../../services/notifications.service";
import Typography from '@mui/material/Typography';
import useMediaQuery from "@mui/material/useMediaQuery";
import { Theme } from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import { minionsKindsService } from "../../services/minions.kinds.service";
import { devicesService } from "../../services/devices.service";
import Autocomplete from '@mui/material/Autocomplete';
import '../../theme/styles/components/minions/minionFullInfo.scss';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Link from '@mui/material/Link';
import { compareIpByDevicePart } from "../../infrastructure/utils";
import { ApiFacade, DeviceKind, LocalNetworkDevice } from "../../infrastructure/generated/api/swagger/api";

const DEFAULT_FONT_SIZE = SIDE_CONTAINER_DEFAULT_FONT_SIZE;

/**
 * The sort formula for sorting devices by name -> ip -> mac
 */
function sortDevicesFormula(a: LocalNetworkDevice, b: LocalNetworkDevice): number {
	if (a.name && b.name) {
		return a.name < b.name ? 1 : -1;
	}

	if (a.name) {
		return 1;
	}

	if (b.name) {
		return -1;
	}

	if (a.ip && b.ip) {
		return compareIpByDevicePart(a.ip, b.ip);
	}

	if (a.ip) {
		return 1;
	}

	if (b.ip) {
		return -1;
	}

	return a.mac < b.mac ? 1 : -1;
}

interface CreateMinionInputProps {
	children: JSX.Element;
	text: string;
	disabled?: boolean;
}

function CreateMinionInput(props: CreateMinionInputProps) {
	const theme = useTheme();

	return <div style={{ width: '100%' }}>
		<Grid
			style={{ width: '100%' }}
			container
			direction="row"
			justifyContent="space-between"
			alignItems="center"
		>
			<div style={{ color: props.disabled ? theme.palette.text.hint : undefined }}>{props.text}{!props.disabled && '*'}</div>
			<div style={{ width: '75%' }} >{props.children}</div>
		</Grid>
	</div>;
}

export function CreateMinion() {
	const { t } = useTranslation();
	const history = useHistory();
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

	const [creating, setCreating] = useState<boolean>();
	/** A tree of the minions kind, map by brand -> model -> @see DeviceKind object */
	const [minionsKindsTree, setMinionsKindsTree] = useState<{ [key: string]: { [key: string]: DeviceKind } }>({});
	const [devices, setDevices] = useState<LocalNetworkDevice[]>([]);
	const [name, setName] = useState<string>();
	const [nameError, setNameError] = useState<boolean>();
	const [brand, setBrand] = useState<string>();
	const [brandError, setBrandError] = useState<boolean>();
	const [model, setModel] = useState<string>();
	const [modelError, setModelError] = useState<boolean>();
	const [device, setDevice] = useState<LocalNetworkDevice>();
	const [deviceError, setDeviceError] = useState<boolean>();
	const [deviceId, setDeviceId] = useState<string>();
	const [deviceIdError, setDeviceIdError] = useState<boolean>();
	const [token, setToken] = useState<string>();
	const [tokenError, setTokenError] = useState<boolean>();

	useEffect(() => {
		// Fetch minions kinds, and the devices collection
		(async () => {
			try {
				// First get all devices, sort and keep them
				const devices = await devicesService.getData();
				const sortedDevices = devices.sort(sortDevicesFormula);
				setDevices(sortedDevices);

				// Then, get minions kinds, and build the tree
				const minionsKinds = await minionsKindsService.getData();
				// Build the minionsKinds tree/map
				const minionsKindsBuilder: typeof minionsKindsTree = {};
				for (const minionsKind of minionsKinds) {
					if (!minionsKindsBuilder[minionsKind.brand]) {
						minionsKindsBuilder[minionsKind.brand] = {};
					}
					minionsKindsBuilder[minionsKind.brand][minionsKind.model] = minionsKind;
				}
				setMinionsKindsTree(minionsKindsBuilder);
			} catch (error) {
				handleServerRestError(error);
			}
		})();
	}, []);

	/**
	 * Verify the minion is ready for creation
	 * @returns True when ever all required fields are OK 
	 */
	function validateInputs(): boolean {
		let validated = true;

		if (!name) {
			validated = false;
			setNameError(true);
		}

		if (!device) {
			validated = false;
			setDeviceError(true);
		}

		if (!brand) {
			validated = false;
			setBrandError(true);
		}

		if (!model) {
			validated = false;
			setModelError(true);
		}

		if (!brand || !model) {
			return validated;
		}

		const deviceKind = minionsKindsTree[brand][model];

		if (deviceKind.isIdRequired && !deviceId) {
			validated = false;
			setDeviceIdError(true);
		}

		if (deviceKind.isTokenRequired && !token) {
			validated = false;
			setTokenError(true);
		}
		return validated;
	}

	/**
	 * Create the new minion
	 */
	async function createMinion() {
		// If not ready, abort
		if (!validateInputs()) {
			return;
		}

		setCreating(true);

		// For lint only (the validateInputs passed)
		if (!device || !name || !brand || !model) {
			return;
		}

		try {
			await ApiFacade.MinionsApi.createMinion({
				name,
				minionStatus: {},
				minionType: minionsKindsTree[brand][model].supportedMinionType,
				device: {
					brand,
					model,
					deviceId,
					token,
					pysicalDevice: {
						mac: device.mac
					}
				}
			});
			await minionsService.forceFetchData();
			// Once it's succeed, close create minion view
			close();
		} catch (error) {
			handleServerRestError(error);
		}
		setCreating(false);

	}

	/** Close create minion view  */
	function close() {
		history.push(DashboardRoutes.minions.path);
	}

	// Hold selected minion kind to create (if selected)
	const selectedMinionKind = brand && model ? minionsKindsTree[brand][model] : undefined;

	return <div className="page-full-info-area">
		<Grid
			className={'page-full-info-container'}
			style={{ padding: DEFAULT_FONT_SIZE * 0.4 }}
			container
			direction="column"
			justifyContent="space-between"
			alignItems="stretch"
		>
			<div style={{ width: '100%', textAlign: 'center' }}>
				<Typography variant="h4" >{t('dashboard.minions.create.new.title')}</Typography>
			</div>
			<div style={{ width: '100%', maxHeight: 'calc(100% - 100px)', overflowY: 'auto', overflowX: 'hidden' }}>
				<Grid
					style={{ width: '100%', height: '100%', minHeight: DEFAULT_FONT_SIZE * 8 }}
					container
					direction="column"
					justifyContent="space-evenly"
					alignItems="center"
				>
					<CreateMinionInput text={t('dashboard.minions.create.new.name')}>
						<TextField
							style={{ width: `100%` }}
							disabled={creating}
							error={nameError}
							variant="standard"
							value={name}
							placeholder={t('dashboard.minions.create.new.name.placeholder')}
							onChange={(e) => {
								setNameError(false);
								setName(e.target.value);
							}}
						/>
					</CreateMinionInput>
					<CreateMinionInput text={t('dashboard.minions.create.new.device')}>
						<Autocomplete
							options={devices}
							disabled={creating}
							getOptionLabel={(option: LocalNetworkDevice) => {
								// If name is not empty or default value, show only it
								if (option.name && option.name !== '------------') {
									return option.name;
								}
								return `${option.ip} - ${option.mac}`;
							}}
							clearText={t('global.clear')}
							closeText={t('global.close')}
							noOptionsText={t('global.no.option')}
							onChange={(e, o) => {
								setDeviceError(false);
								setDevice(o as LocalNetworkDevice);
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									placeholder={t('dashboard.minions.create.new.device.placeholder')}
									disabled={creating}
									error={deviceError}
									variant="standard"

								/>
							)}
						/>
					</CreateMinionInput>
					<CreateMinionInput text={t('dashboard.minions.create.new.brand')}>
						<Autocomplete
							options={Object.keys(minionsKindsTree).sort()}
							clearText={t('global.clear')}
							closeText={t('global.close')}
							noOptionsText={t('global.no.option')}
							disabled={creating}
							onChange={(e, o) => {
								setBrandError(false);
								setBrand(o as string);
								// Once brand has changed, reset model selection
								setModel(undefined);
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									placeholder={t('dashboard.minions.create.new.brand.placeholder')}
									disabled={creating}
									error={brandError}
									variant="standard"

								/>
							)}
						/>
					</CreateMinionInput>
					<CreateMinionInput text={t('dashboard.minions.create.new.model')}>
						<Autocomplete
							// Once brand has changed, force component reset
							key={brand}
							options={brand ? Object.keys(minionsKindsTree[brand]).sort() : []}
							clearText={t('global.clear')}
							closeText={t('global.close')}
							noOptionsText={t('global.no.option')}
							disabled={creating || !brand}
							onChange={(e, o) => {
								setModelError(false);
								setModel(o as string);
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									placeholder={t('dashboard.minions.create.new.model.placeholder')}
									disabled={creating || !brand}
									error={modelError}
									variant="standard"
								/>
							)}
						/>
					</CreateMinionInput>
					<CreateMinionInput
						text={t('dashboard.minions.create.new.device.id')}
						disabled={creating || !selectedMinionKind?.isIdRequired}
					>
						<TextField
							style={{ width: `100%` }}
							disabled={creating || !selectedMinionKind?.isIdRequired}
							error={selectedMinionKind?.isIdRequired && deviceIdError}
							variant="standard"
							value={selectedMinionKind?.isIdRequired ? deviceId : ''}
							placeholder={t('dashboard.minions.create.new.device.id.placeholder')}
							onChange={(e) => {
								setDeviceIdError(false);
								setDeviceId(e.target.value);
							}}
						/>
					</CreateMinionInput>
					<CreateMinionInput
						text={t('dashboard.minions.create.new.token')}
						disabled={creating || !selectedMinionKind?.isTokenRequired}
					>
						<TextField
							style={{ width: `100%` }}
							disabled={creating || !selectedMinionKind?.isTokenRequired}
							error={selectedMinionKind?.isTokenRequired && tokenError}
							variant="standard"
							value={selectedMinionKind?.isTokenRequired ? token : ''}
							placeholder={t('dashboard.minions.create.new.token.placeholder')}
							onChange={(e) => {
								setTokenError(false);
								setToken(e.target.value);
							}}
						/>
					</CreateMinionInput>
				</Grid>
			</div>
			<div style={{ marginBottom: DEFAULT_FONT_SIZE * 0.7 }}>
				<Grid
					style={{ width: `100%` }}
					container
					direction="row"
					justifyContent="space-around"
					alignItems="center"
				>
					<div>
						<HelpOutlineIcon />
					</div>
					<div style={{ width: `80%` }}>
						<Trans i18nKey="dashboard.minions.create.minion.info">
							For more information about the supported devices, connect a device to the local network and troubleshooting see
							<Link
								style={{ marginLeft: 3, marginRight: 3 }}
								target="_blank"
								href={`${SERVER_REPO_URL}/tree/development/backend/src/modules#how-to-connect-my-device-to-the-local-network-and-how-to-add-it-to-be-managed-by-the-casanet-server`}>
								casanet modules documentation
							</Link>
						</Trans>
					</div>
				</Grid>
			</div>
			<div style={{ width: '100%' }}>
				<Grid
					container
					direction="row"
					justifyContent="space-between"
					alignItems="flex-end"
				>
					<Button disabled={creating} variant="contained" onClick={close}>{t('global.cancel')}</Button>
					<LoadingButton
						style={{ minWidth: desktopMode ? 200 : 0 }}
						loading={creating}
						disabled={creating}
						loadingPosition={desktopMode ? 'start' : 'center'}
						variant="contained"
						color={'primary'}
						onClick={createMinion}>
						{t('dashboard.minions.create.minion')}
					</LoadingButton>
				</Grid>
			</div>
		</Grid>
	</div>;
}
