import { Grid, Theme, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { useTranslation } from "react-i18next"
import { Minion } from "../../infrastructure/generated/api/swagger/api";

interface MinionTechInfoProps {
	fontRatio: number;
	minion: Minion;
}

interface MinionInfoLineProps {
	fontRatio: number;
	title: string;
	value?: string;
}

function MinionInfoLine(props: MinionInfoLineProps) {
	const { fontRatio, title, value } = props;
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

	const theme = useTheme();

	return <Grid
		style={{ width: '100%', marginBottom: fontRatio * 0.15 }}
		container
		direction="row"
		justifyContent="flex-start"
		alignItems="center"
	>
		<Typography style={{ fontSize: fontRatio * 0.25, width: desktopMode ?  `${fontRatio * 4}px` : '100%', color: theme.palette.text.hint }} >{title}</Typography>
		<Typography style={{ fontSize: fontRatio * 0.3 }} >{value ?? '-' }</Typography>
	</Grid>;
}

export function MinionTechInfo(props: MinionTechInfoProps) {
	const { t } = useTranslation();
	const { fontRatio, minion } = props;
	return <Grid
		style={{ width: '100%', height: '100%' }}
		container
		direction="column"
		justifyContent="center"
		alignItems="center"
	>
		<MinionInfoLine fontRatio={fontRatio} title={t('dashboard.minions.tech.info.minion.id')} value={minion.minionId} />
		<MinionInfoLine fontRatio={fontRatio} title={t('dashboard.minions.tech.info.device.name')} value={minion.device.pysicalDevice.name} />
		<MinionInfoLine fontRatio={fontRatio} title={t('dashboard.minions.tech.info.device.model')} value={minion.device.model} />
		<MinionInfoLine fontRatio={fontRatio} title={t('dashboard.minions.tech.info.device.brand')} value={minion.device.brand} />
		<MinionInfoLine fontRatio={fontRatio} title={t('dashboard.minions.tech.info.device.deviceId')} value={minion.device.deviceId} />
		<MinionInfoLine fontRatio={fontRatio} title={t('dashboard.minions.tech.info.device.ip.address')} value={minion.device.pysicalDevice.ip} />
		<MinionInfoLine fontRatio={fontRatio} title={t('dashboard.minions.tech.info.device.mac.address')} value={minion.device.pysicalDevice.mac} />
		<MinionInfoLine fontRatio={fontRatio} title={t('dashboard.minions.tech.info.device.vendor')} value={minion.device.pysicalDevice.vendor} />
	</Grid>;
}
