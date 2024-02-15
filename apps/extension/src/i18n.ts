import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import EN from "../locales/en/translation.json"
import ZH from "../locales/zh/translation.json"
const resources = {
    en: {
        translation: EN
    },
    "zh": {
        translation: ZH
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en',
        interpolation: {
            escapeValue: false
        }
    });




export default i18n;