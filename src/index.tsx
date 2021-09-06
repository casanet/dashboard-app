import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { create } from 'jss';
import rtl from 'jss-rtl';
import { StylesProvider, jssPreset } from '@material-ui/core/styles';

// Configure JSS
const jss = create({ plugins: [...jssPreset().plugins, rtl()] });

const lang: string = 'en';

function RTL(props: any) {
	if(lang !== 'he') {
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
				translation: {
					"global.dir" : 'ltr',
					"global.powered.by.casanet" : "Powered by Casanet",
					"Welcome to React": "Welcome to React and react-i18next",
					"general.casanet.dashboard": "Casanet Dashboard",
					"login.welcome.message": "Welcome to the <1>casanet</1> IoT dashboard",
					"login.background.credit.message": "Background from {{url}}",
					"login.sign.in": 'Sign in',
					"login.email.address": 'Email Address',
					"login.password": 'Password',
					"login.mfa.code": 'Multi-Factor code',
					"general.copyright.message": "Copyright © casanet {{year}}.",
				}
			},
			he: {
				translation: {
					"global.dir" : 'rtl',
					"global.powered.by.casanet" : "Powered by Casanet",
					"Welcome to React": "ברוכים הבאים ל React ו react-i18next",
					"general.casanet.dashboard": "Casanet Dashboard",
					"login.welcome.message": "ברוכים הבאים לממשק ניהול ה-IoT של <1>casanet</1>",
					"login.background.credit.message": "הרקע מ- {{url}}",
					"login.sign.in": 'התחברות',
					"login.email.address": 'כתובת דוא"ל',
					"login.password": 'סיסמה',
					"login.mfa.code": 'קוד אימות',
					"general.copyright.message": "Copyright © casanet {{year}}.",
				}
			}
		},
		lng: lang, // if you're using a language detector, do not define the lng option
		fallbackLng: "en",
		interpolation: {
			escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
		}
	});

if (lang === 'he') {
	const root = document.getElementById('body-root');
	root?.setAttribute('dir', 'rtl');
}

const startApp = () => {
	// console.log(device.cordova);
	ReactDOM.render(
		<React.StrictMode>
			<RTL>
				<App />
			</RTL>
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
