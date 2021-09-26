import { MenuItem, Select } from "@material-ui/core";
import { supportedLanguages } from "../../localization/languages";
import { getLang, setLang } from "../../services/localization.service";
import { LangCode } from "../../infrastructure/symbols/global";
import { V3Redirection } from "../../components/V3Redirection";

export default function Settings() {

	const currLang = getLang().langCode;

	const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		setLang(event.target.value as LangCode);
	};

	return <div style={{ width: '100%', height: '100%' }}>
		<div style={{ position: 'fixed' }}>
			<Select
				value={currLang}
				onChange={handleChange}
			>
				{supportedLanguages.map(l => <MenuItem value={l.langCode}>{`${l.langInfo.name} (${l.langInfo.nativeName})`}</MenuItem>)}
			</Select>
		</div>
		<V3Redirection v3Page="/auth/minions" fontRatio={20} />
	</div>
}