import { Grid, IconButton, Link, Typography, useTheme } from "@material-ui/core";
import { getModeColor, left, marginRight } from "../../logic/common/themeUtils";
import HelpOutlineOutlined from '@material-ui/icons/HelpOutlineOutlined';
import { CONTACT_EMAIL, CONTACT_GITHUB, CONTACT_TWITTER, DASHBOARD_REPO_URL, DEFAULT_FONT_RATION, SERVER_REPO_URL } from "../../infrastructure/consts";
import LaunchIcon from '@mui/icons-material/Launch';
import { useTranslation } from "react-i18next";

export function Help() {
	const { t } = useTranslation();
	const theme = useTheme();

	const fontRatio = DEFAULT_FONT_RATION * 2.5;
	const titleTextSize = fontRatio * 0.3;
	const textSize = fontRatio * 0.32;
	const spaceSize = fontRatio * 0.4;

	return <Grid style={{ width: '100%', height: '100%', textAlign: 'center' }}
		container
		direction="column"
		justifyContent="center"
		alignItems="center"
	>
		<Grid
			style={{ width: '100%', height: '100%', marginBottom: spaceSize }}
			container
			direction="row"
			justifyContent="flex-start"
			alignItems="center"
		>
			<div style={{ [marginRight(theme)]: spaceSize }}>
				<HelpOutlineOutlined style={{ fontSize: fontRatio, color: getModeColor(false, theme) }} />
			</div>
			<div>
				<Typography style={{ fontSize: titleTextSize, color: getModeColor(false, theme) }} >{t('dashboard.help.title')}</Typography>
			</div>
		</Grid>

		<div style={{ textAlign: left(theme) }}>
			<div style={{ marginBottom: spaceSize }}>
				<div>
					<Typography style={{ fontSize: titleTextSize, color: getModeColor(false, theme) }} >{t('dashboard.help.report.issue.title')}</Typography>
				</div>
				<div style={{ display: 'flex' }}>
					<Typography style={{ fontSize: textSize }} >{t('dashboard.help.report.issue.server')}</Typography>
					<IconButton
						onClick={() => { window.open(`${SERVER_REPO_URL}/issues`, '_blank') }}
						color="inherit"
						style={{ padding: DEFAULT_FONT_RATION * 0.15, marginTop: -DEFAULT_FONT_RATION * 0.2, [marginRight(theme)]: -DEFAULT_FONT_RATION * 0.15 }}
					>
						<LaunchIcon style={{ fontSize: DEFAULT_FONT_RATION * 0.8 }} />
					</IconButton>
				</div>
				<div style={{ display: 'flex' }}>
					<Typography style={{ fontSize: textSize }} >{t('dashboard.help.report.issue.dashboard')}</Typography>
					<IconButton
						onClick={() => { window.open(`${DASHBOARD_REPO_URL}/issues`, '_blank') }}
						color="inherit"
						style={{ padding: DEFAULT_FONT_RATION * 0.15, marginTop: -DEFAULT_FONT_RATION * 0.2, [marginRight(theme)]: -DEFAULT_FONT_RATION * 0.15 }}
					>
						<LaunchIcon style={{ fontSize: DEFAULT_FONT_RATION * 0.8 }} />
					</IconButton>
				</div>
			</div>
			<div style={{ marginBottom: spaceSize }}>
				<div>
					<Typography style={{ fontSize: titleTextSize, color: getModeColor(false, theme) }} >{t('dashboard.help.contact.title')}</Typography>
				</div>
				<div>
					<Typography style={{ fontSize: textSize }} ><Link onClick={() => window.open(CONTACT_GITHUB, '_blank')}>{CONTACT_GITHUB}</Link></Typography>
				</div>
				<div>
					<Typography style={{ fontSize: textSize }} ><Link onClick={() => window.open(CONTACT_TWITTER, '_blank')}>{CONTACT_TWITTER}</Link></Typography>
				</div>
				<div>
					<Typography style={{ fontSize: textSize }} ><Link onClick={() => window.open(`mailto:${CONTACT_EMAIL}`, '_blank')}>{CONTACT_EMAIL}</Link></Typography>
				</div>
			</div>
		</div>
	</Grid>
}