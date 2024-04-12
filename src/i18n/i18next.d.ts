declare module 'virtual:i18next-loader' {
  import en_common from '@/i18n/locales/en/common.json';
  import en_exporter from '@/i18n/locales/en/exporter.json';

  export type LocaleResources = {
    en: {
      common: typeof en_common;
      exporter: typeof en_exporter;
    };
  };

  export type TranslationKey =
    | keyof LocaleResources['en']['common']
    | keyof LocaleResources['en']['exporter'];

  const resources: LocaleResources;
  export default resources;
}
