import { Grid, Link, TextField, Typography, useTheme } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { getLang, setLang } from "../../services/localization.service";
import { ViewLanguage } from "../../infrastructure/symbols/global";
import { supportedLanguages } from "../../localization/languages";
import Autocomplete from '@mui/material/Autocomplete';
import { SettingItem } from "../../pages/dashboard-pages/Settings";
import { DEFAULT_FONT_RATION } from "../../infrastructure/consts";
import { envFacade } from "../../infrastructure/env-facade";
import { marginLeft } from "../../logic/common/themeUtils";

const lang = getLang();

export function InterfaceSettings() {
	const { t } = useTranslation();
	const theme = useTheme();

	return <Grid
		container
		direction="column"
		justifyContent="space-between"
		alignItems="stretch"
	>
		<SettingItem title={t('dashboard.settings.interface.language')} >
			<Autocomplete
				value={lang}
				options={supportedLanguages}
				getOptionLabel={(option: ViewLanguage) => `${option.langInfo.name} (${option.langInfo.nativeName})`}
				clearText={t('global.clear')}
				closeText={t('global.close')}
				noOptionsText={t('global.no.option')}
				onChange={(e, o) => {
					if (!o) {
						return;
					}
					setLang(o.langCode);
				}}
				renderInput={(params) => (
					<TextField
						{...params}
						variant="standard"
					/>
				)}
			/>
		</SettingItem>
		{!envFacade.isMobileApp && <SettingItem title={t('dashboard.settings.interface.mobile.applications')} >
			<Grid
				style={{ marginBottom: -(DEFAULT_FONT_RATION * 1.75), marginTop: -(DEFAULT_FONT_RATION * 0.5), [marginLeft(theme)]: -(DEFAULT_FONT_RATION* 0.9) }}
				container
				direction="row"
				justifyContent="flex-start"
				alignItems="center"
			>
				<a
					href='https://play.google.com/store/apps/details?id=casa.casanet.dashboard'
					target="_blank" rel="noreferrer">
					<img
						width={'250px'} height={'90px'}
						alt='Get it on Google Play'
						src={`https://play.google.com/intl/en_us/badges/static/images/badges/${lang.langInfo.languageNameCode || lang.langInfo.code}_badge_web_generic.png`} />
				</a>
			</Grid>
		</SettingItem>}
		<SettingItem title={t('dashboard.settings.interface.lightweight.dashboard')} >
			<Grid
				container
				direction="column"
				justifyContent="center"
				alignItems="stretch"
			>
				<Link
					variant="h6"
					target="_blank"
					href={envFacade.lightweightUrl}>
					{t('dashboard.settings.interface.lightweight.dashboard')}
				</Link>
				<Typography variant="body1" style={{ color: theme.palette.text.hint, fontSize: DEFAULT_FONT_RATION * 0.7 }}>
					{t('dashboard.settings.interface.lightweight.dashboard.info')}
				</Typography>
			</Grid>
		</SettingItem>
		<SettingItem title={t('dashboard.settings.interface.v3.dashboard')} >
			<Grid
				container
				direction="column"
				justifyContent="center"
				alignItems="stretch"
			>
				<Link
					variant="h6"
					target="_blank"
					href={envFacade.v3DashboardUri}>
					{t('dashboard.settings.interface.v3.dashboard')}
				</Link>
				<Typography variant="body1" style={{ color: theme.palette.text.hint, fontSize: DEFAULT_FONT_RATION * 0.7 }}>
					{t('dashboard.settings.interface.v3.dashboard.info')}
				</Typography>
			</Grid>
		</SettingItem>
	</Grid>;
}
