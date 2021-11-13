import { Divider, Grid, Link, Paper, Theme, Typography, useMediaQuery } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { GeneralSettings } from "../../components/settings/GeneralSettings";
import { ConnectivitySettings } from "../../components/settings/ConnectivitySettings";
import { InterfaceSettings } from "../../components/settings/InterfaceSettings";
import { DEFAULT_FONT_RATION, PROJECT_URL } from "../../infrastructure/consts";

interface SettingItemProps {
	title: string;
	children: JSX.Element;
}

export function SettingItem(props: SettingItemProps) {
	return <Grid
		style={{ marginTop: DEFAULT_FONT_RATION * 2 }}
		container
		direction="column"
		justifyContent="center"
		alignItems="stretch"
	>
		<div style={{ marginBottom: DEFAULT_FONT_RATION * 0.5 }} > <Typography variant={'body2'} color={'textSecondary'}>{props.title}</Typography></div>
		<div>{props.children}</div>
	</Grid>
}

interface SettingGroupProps {
	title: string;
	children: JSX.Element;
}

function SettingGroup(props: SettingGroupProps) {
	const veryWideDesktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('xl'));
	const wideDesktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

	return <Paper elevation={3} style={{
		marginBottom: DEFAULT_FONT_RATION,
		// Each settings group show take 1/3 from the screen in case of very wide screen, 1/2 in case of regular wide scree, else 1/1 of the screen width.
		width: !wideDesktopMode ? '100%' : (!veryWideDesktopMode ? '49%' : '32%')
	}}>
		<Grid
			style={{ padding: DEFAULT_FONT_RATION * 0.7 }}
			container
			direction="column"
			justifyContent="center"
			alignItems="stretch"
		>
			<div> <Typography variant={'h4'}>{props.title}</Typography></div>
			<div style={{ marginTop: DEFAULT_FONT_RATION * 0.5 }}><Divider /> </div>
			<div>{props.children}</div>
		</Grid>
	</Paper>;
}

const CREDIT_HEIGHT = 20;

export default function Settings() {
	const { t } = useTranslation();
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

	return <Grid
		style={{ width: '100%', height: '100%' }}
		container
		direction="column"
		justifyContent="space-between"
		alignItems="stretch"
	>
		<div
			className={desktopMode ? '' : 'hide-scroll'}
			style={{
			width: '100%', maxWidth: '100%',
			height: `calc(100% - ${CREDIT_HEIGHT}px)`, maxHeight: `calc(100% - ${CREDIT_HEIGHT}px)`,
			overflowX: 'hidden', overflowY: 'auto'
		}}>
			<Grid
				container
				direction="row"
				justifyContent="space-between"
				alignItems="flex-start"
			>
				<SettingGroup title={t('dashboard.settings.general')}>
					<GeneralSettings />
				</SettingGroup>
				<SettingGroup title={t('dashboard.settings.interface')}>
					<InterfaceSettings />
				</SettingGroup>
				<SettingGroup title={t('dashboard.settings.connectivity')}>
					<ConnectivitySettings />
				</SettingGroup>
			</Grid>
		</div>
		<div style={{ textAlign: 'center', maxHeight: CREDIT_HEIGHT }}>
			<Grid
				style={{ marginTop: CREDIT_HEIGHT * 0.5 }}
				container
				direction="row"
				justifyContent="center"
				alignItems="center"
			>
				<Typography>
					<Link
						style={{ marginLeft: 3, marginRight: 3 }}
						target="_blank"
						href={PROJECT_URL}>
						Casanet Project
					</Link>
					- © Haim Kastner 2019-{new Date().getFullYear()}
				</Typography>
			</Grid>
		</div>
	</Grid>;
}