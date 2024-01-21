import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Storage } from "@plasmohq/storage";

const storage = new Storage({
    area: "local",
})


// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
    en: {
        translation: {
            "General": "General",
            "Theme": "Theme",
            "Auto": "Auto",
            "Light": "Light Mode",
            "Dark": "Dark Mode",
            "Language": "Language",
            "Account": "Account",
            'Meeting Agenda': 'Meeting Agenda',
        }
    },
    zh: {
        translation: {
            "General": "通用",
            "Theme": "主题",
            "Auto": "自动",
            "Light": "明亮模式",
            "Dark": "黑色模式",
            "Language": "语言",
            "Account": "账号",
        }
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