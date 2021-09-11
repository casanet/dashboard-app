import React from 'react';
import ReactDOM from 'react-dom';
import './theme/styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { create } from 'jss';
import rtl from 'jss-rtl';
import { StylesProvider, jssPreset } from '@material-ui/core/styles';
import { getLang } from './services/localization.service';
import translationEN from './localization/translations/en/global.json';
import translationHE from './localization/translations/he/global.json';

// Configure JSS with RTL enables
const jss = create({ plugins: [...jssPreset().plugins, rtl()] });

const viewLanguage = getLang();

/** Direction wrapper used, to enable RTL theme for MAterial UI  */
function DirectionWrapper(props: any) {
	if (viewLanguage.direction !== 'rtl') {
		return props.children;
	}
	return (
		<StylesProvider jss={jss}>
			{props.children}
		</StylesProvider>
	);
}

i18n
	.use(initReactI18next) // passes i18n down to react-i18next
	.init({
		// the translations
		// (tip move them in a JSON file and import them,
		// or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
		resources: {
			en: {
				translation: translationEN,
			},
			he: {
				translation: translationHE
			}
		},
		lng: viewLanguage.langCode, // if you're using a language detector, do not define the lng option
		fallbackLng: "en",
		interpolation: {
			escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
		}
	});

if (viewLanguage.direction === 'rtl') {
	const root = document.getElementById('body-root');
	root?.setAttribute('dir', 'rtl');
}

const startApp = () => {
	ReactDOM.render(
		<React.StrictMode>
			<DirectionWrapper>
					<App />
			</DirectionWrapper>
		</React.StrictMode>,
		document.getElementById('root')
	);

	// If you want to start measuring performance in your app, pass a function
	// to log results (for example: reportWebVitals(console.log))
	// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
	reportWebVitals();
};

declare var window: Window & {
	cordova: unknown;
};

if (window.cordova) {
	document.addEventListener('deviceready', startApp, false);
} else {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	globalThis.device = { platform: 'Browser' } as Device;
	startApp();
}
