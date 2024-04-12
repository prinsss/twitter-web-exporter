export const LANGUAGES_CONFIG = {
  en: {
    name: 'English',
    nameEn: 'English',
    test: (code: string) => /^en/.test(code),
  },
  'zh-Hans': {
    name: '简体中文',
    nameEn: 'Simplified Chinese',
    test: (code: string) => /^zh/.test(code),
  },
};

/**
 * Detect the browser language.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc4646
 * @returns The detected language code.
 */
export function detectBrowserLanguage() {
  const language = window.navigator.language || 'en';

  for (const [langTag, langConf] of Object.entries(LANGUAGES_CONFIG)) {
    if (langConf.test(language)) {
      return langTag;
    }
  }

  return language;
}
