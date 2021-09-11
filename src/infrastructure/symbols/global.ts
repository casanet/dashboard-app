import { Direction } from "@material-ui/core";
import { languagesDisplayInfoMap } from "../../localization/languages-map";

/** The lang available codes (en, he, fe, etc.) */
export type LangCode = keyof typeof languagesDisplayInfoMap;

export interface LanguageDisplayInfo {
	name: string;
	/** The lang display name in the native name */
	nativeName: string;
	/** The lang code (en, he, fe, etc.) */
	code: LangCode;
}

export interface ViewLanguage {
	/** The lang code (en, he, fe, etc.) */
	langCode: LangCode;
	/** The view direction */
	direction: Direction;
	/** Fonts to use in current lang, speared by comma (fontA, fontB) */
	fontFamily?: string;
	/** The display name etc. info of the curr lang */
	langInfo: LanguageDisplayInfo;
}
