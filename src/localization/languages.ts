import { LanguageDisplayInfo, ViewLanguage } from "../logic/symbols/global";
import { languagesDisplayInfoMap } from "./languages-map";

/** The supported view languages, feel free to add a new one, the translation files located in 'src/localization/translation/*' */
export const supportedLanguages: ViewLanguage[] = [
	{
		langCode: 'en',
		direction: 'ltr',
		fontFamily: 'oxanium,VarelaRound',
		langInfo: languagesDisplayInfoMap.en as LanguageDisplayInfo,
	},
	{
		langCode: 'he',
		direction: 'rtl',
		fontFamily: 'VarelaRound,oxanium',
		langInfo: languagesDisplayInfoMap.he as LanguageDisplayInfo,
	}
];