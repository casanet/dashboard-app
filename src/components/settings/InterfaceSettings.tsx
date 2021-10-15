import { Grid, Link, TextField, Typography, useTheme } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { getLang, setLang } from "../../services/localization.service";
import { ViewLanguage } from "../../infrastructure/symbols/global";
import { supportedLanguages } from "../../localization/languages";
import Autocomplete from '@mui/material/Autocomplete';
import { SettingItem } from "../../pages/dashboard-pages/Settings";
import { DEFAULT_FONT_RATION, LIGHTWEIGHT_DASHBOARD_PATH } from "../../infrastructure/consts";
import { envFacade } from "../../infrastructure/env-facade";

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
				value={getLang()}
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
					href={LIGHTWEIGHT_DASHBOARD_PATH}>
					{t('dashboard.settings.interface.lightweight.dashboard')}
				</Link>
				<Typography variant="body1" style={{ color: theme.palette.text.hint, fontSize: DEFAULT_FONT_RATION * 0.7  }}>
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
				<Typography variant="body1" style={{ color: theme.palette.text.hint, fontSize: DEFAULT_FONT_RATION * 0.7  }}>
					{t('dashboard.settings.interface.v3.dashboard.info')}
				</Typography>
			</Grid>
		</SettingItem>
	</Grid>;
}
