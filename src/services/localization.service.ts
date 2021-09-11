import { supportedLanguages } from "../localization/languages";
import { getLocalStorageItem, LocalStorageKey, setLocalStorageItem } from "../infrastructure/local-storage";
import { ViewLanguage, LangCode } from "../infrastructure/symbols/global";

/**
 * Get current user language info
 * @returns The language info
 */
export function getLang(): ViewLanguage {

	let langCode: LangCode;

	// First, try get saved lang if exists
	const savedLang = getLocalStorageItem<LangCode>(LocalStorageKey.Lang, { itemType: 'string' });
	if (savedLang) {
		// If exists, keep it
		langCode = savedLang;
	} else {
		// Else, try detect the language from the browser navigation info
		const isoLang = window.navigator.language || navigator.languages[0];
		// The lang should be an ISO (en-US for example), so split it, as default if in any parsing issue, use 'en'
		const userLang = isoLang?.split('-')[0] || 'en';
		// Keep the user's lang code
		langCode = userLang as LangCode;
	}

	// Try look for the user's lang in the supported langs
	let selectedLang = supportedLanguages.find(l => l.langCode === langCode);

	// If not found, take en as fallback
	if (!selectedLang) {
		supportedLanguages.find(l => l.langCode === 'en');
	}

	return selectedLang as ViewLanguage;
}

/**
 * Set view lang
 * @param langCode The lang to set 
 * @param apply Apply the change (require reload) true as default
 */
export function setLang(langCode: LangCode, apply: boolean = true) {
	setLocalStorageItem(LocalStorageKey.Lang, langCode, { itemType: 'string' });
	if (apply) {
		window.location.reload();
	}
}