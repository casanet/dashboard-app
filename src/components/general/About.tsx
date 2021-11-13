import { Grid, Link, Typography, useTheme } from "@material-ui/core";
import { Trans, useTranslation } from "react-i18next";
import { PROJECT_URL, SERVER_REPO_URL } from "../../infrastructure/consts";
import { getModeColor, left, marginRight } from "../../logic/common/themeUtils";
import casanetLogo from '../../static/logo-app.png';

interface NoContentProps {
	fontRatio?: number;
}

export function About(props: NoContentProps) {
	const { t } = useTranslation();
	const theme = useTheme();

	const fontRatio = props.fontRatio || 50;
	const textSize = fontRatio * 0.32;
	const spaceSize = fontRatio * 0.4;

	return <Grid
		style={{ width: '100%', height: '100%', textAlign: 'center' }}
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
			<div style={{ [marginRight(theme)]: fontRatio * 0.5 }}>
				<img width={fontRatio} height={fontRatio} alt="casanet-logo" src={casanetLogo} />
			</div>
			<div>
				<Typography style={{ fontSize: fontRatio * 0.6, color: getModeColor(false, theme) }} >{t('dashboard.about.title')}</Typography>
			</div>
		</Grid>

		<div style={{ textAlign: left(theme) }}>
			<div style={{ marginBottom: spaceSize }}>
				<div>
					<Typography style={{ fontSize: textSize }} >{t('dashboard.about.body.text')}</Typography>
				</div>
			</div>
			<div style={{ marginBottom: spaceSize }}>
				<div>

					<Typography style={{ fontSize: textSize }} >
						<Trans i18nKey="dashboard.about.github.page.text">
							Casanet Project <Link onClick={() => window.open(PROJECT_URL, '_blank')}> GitHub Page</Link>
						</Trans>
					</Typography>
				</div>
			</div>
			<div style={{ marginBottom: spaceSize }}>
				<div>
					<Typography style={{ fontSize: textSize }} >
						<Trans i18nKey="dashboard.about.documentation.text">
							For full information & documentation see  <Link onClick={() => window.open(`${SERVER_REPO_URL}/blob/development/README.md`, '_blank')}> casanet-server </Link>
						</Trans>
					</Typography>
				</div>
			</div>
		</div>
		<div>
			<Typography style={{ fontSize: textSize }} >{t('dashboard.about.made.by.text')}</Typography>
		</div>
	</Grid>
}
