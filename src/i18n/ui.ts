import en from "./locales/en.json";
import zh from "./locales/zh.json";

export const languages = {
    en: "English",
    zh: "中文"
};

export const defaultLang = "en";

export const ui = {
    en: en,
    zh: zh
} as const;