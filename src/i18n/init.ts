import i18next, { LanguageDetectorModule, i18n } from 'i18next';
import resources, { LocaleResources } from 'virtual:i18next-loader';
import { options } from '@/core/options';
import { detectBrowserLanguage } from './detector';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: LocaleResources['en'];
  }
}

/**
 * The language detector for i18next.
 */
export const languageDetector: LanguageDetectorModule = {
  type: 'languageDetector',
  detect: function () {
    return options.get('language') || detectBrowserLanguage();
  },
};

/**
 * Initialize i18next and return the instance.
 */
export function initI18n(): i18n {
  // We will have only one instance of i18next in the app.
  if (i18next.isInitialized) {
    return i18next;
  }

  // Persist selected language to options storage.
  i18next.on('languageChanged', (lng) => {
    if (!options.get('language')) {
      options.set('language', lng);
    }
  });

  // Initialize i18next with the language detector.
  i18next.use(languageDetector).init({
    initImmediate: true,
    defaultNS: 'common',
    fallbackLng: 'en',
    nsSeparator: '::',
    debug: options.get('debug'),
    resources,
  });

  return i18next;
}
