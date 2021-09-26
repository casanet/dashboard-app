import { Grid, Link, Typography } from "@material-ui/core";
import { Trans, useTranslation } from "react-i18next"
import { envFacade } from "../infrastructure/env-facade";

interface V3RedirectionProps {
	fontRatio: number;
	v3Page: string;
}

export function V3Redirection(props: V3RedirectionProps) {
	const { t } = useTranslation();
	const { fontRatio, v3Page } = props;
	return <Grid
		style={{ width: '100%', height: '100%', textAlign: 'center' }}
		container
		direction="column"
		justifyContent="center"
		alignItems="center"
	>
		<div>
			<Typography style={{ fontSize: fontRatio * 4 }} >🚧🚧🚧</Typography>
		</div>
		<Typography style={{ fontSize: fontRatio * 1.3 }} >{t('dashboard.v3.redirect.under.construction')}</Typography>
		<Typography style={{ fontSize: fontRatio * 1.3, marginTop: fontRatio }} >{t('dashboard.v3.redirect.under.construction.message')}</Typography>
		<Typography style={{ fontSize: fontRatio * 0.9, marginTop: fontRatio * 0.5 }} >
			<Trans i18nKey="dashboard.v3.redirect.under.construction.redirection.message">
				In the meanwhile please click <Link className="link" onClick={() => window.open(`${envFacade.v3DashboardUri}#${v3Page}`, '_blank')}>here</Link> to be redirected to the legacy V3 dashboard.
			</Trans>
		</Typography>
	</Grid>
}