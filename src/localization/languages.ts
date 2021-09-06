import { ViewLanguage } from "../logic/symbols/global";

/** The supported view languages, feel free to add a new one, the translation files located in 'src/localization/translation/*' */
export const supportedLanguages: ViewLanguage[] = [
	{
		langCode: 'en',
		direction: 'ltr',
		fontFamily: 'oxanium,VarelaRound'
	},
	{
		langCode: 'he',
		direction: 'rtl',
		fontFamily: 'VarelaRound,oxanium'
	}
];