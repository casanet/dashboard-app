import { MenuItem, Select } from "@material-ui/core";
import { supportedLanguages } from "../../localization/languages";
import { getLang, setLang } from "../../logic/services/localization.service";
import { LangCode } from "../../logic/symbols/global";

export default function Settings() {

	const currLang = getLang().langCode;

	const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setLang(event.target.value as LangCode);
  };

	return <div>
		<Select
			value={currLang}
			onChange={handleChange}
		>
			{supportedLanguages.map(l => <MenuItem value={l.langCode}>{`${l.langInfo.name} (${l.langInfo.nativeName})`}</MenuItem>)}
		</Select>
	</div>
}