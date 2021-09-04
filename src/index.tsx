import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: {
      en: {
        translation: {
          "Welcome to React": "Welcome to React and react-i18next"
        }
      },
			he: {
        translation: {
          "Welcome to React": "ברוכים הבאים ל React ו react-i18next"
        }
      }
    },
    lng: "he", // if you're using a language detector, do not define the lng option
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    }
  });

const root = document.getElementById('root');
root?.setAttribute('dir', 'rtl');
const startApp = () => {
	// console.log(device.cordova);
  ReactDOM.render(
    <React.StrictMode>
      <App />
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

if(window.cordova) {
  document.addEventListener('deviceready', startApp, false);
} else {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	globalThis.device = { platform : 'Browser' } as Device;
  startApp();
}
