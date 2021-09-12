import { Direction } from "@material-ui/core";
import { languagesDisplayInfoMap } from "../../localization/languages-map";
import { Duration } from 'unitsnet-js';

/** Supported platforms */
export type Platform = 'Android' | 'Browser';

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

export interface NotificationInfo {
	/** The time duration for the notification to be shown */
	duration: Duration;
	/** An i18n key to show the content (depend on the lang) */
	messageKey: string;
}
