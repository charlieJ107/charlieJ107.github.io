import { ui, defaultLang } from './ui';

export function getLangFromUrl(url: URL) {
  if (!url) return defaultLang;
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: string): string {
    var keyParts = key.split('.');
    var value = ui[lang] ? ui[lang] : ui[defaultLang];
    for (var i = 0; i < keyParts.length; i++) {
      if (typeof value[keyParts[i]] === 'undefined') return key;
      value = value[keyParts[i]];
    }
    return typeof value === 'string' ? value : key;
  }
}