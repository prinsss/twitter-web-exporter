import { Fragment } from 'preact';
import { IconSettings, IconBrandGithubFilled, IconHelp } from '@tabler/icons-preact';

import packageJson from '@/../package.json';
import { Modal } from '@/components/common';
import { useTranslation, detectBrowserLanguage, LANGUAGES_CONFIG, TranslationKey } from '@/i18n';
import { capitalizeFirstLetter, cx, useSignal, useToggle } from '@/utils/common';

import extensionManager from './extensions';
import { DEFAULT_APP_OPTIONS, options, THEMES } from './storage';

export function Settings() {
  const { t, i18n } = useTranslation();

  const currentTheme = useSignal(options.get('theme'));
  const [showSettings, toggleSettings] = useToggle(false);

  const styles = {
    subtitle: 'mb-2 text-base-content ml-4 opacity-50 font-semibold text-xs',
    block:
      'text-sm mb-2 w-full flex px-4 py-2 text-base-content bg-base-200 rounded-box justify-between',
    item: 'label cursor-pointer flex justify-between h-8 items-center p-0',
  };

  return (
    <Fragment>
      {/* Settings button. */}
      <div
        onClick={toggleSettings}
        class="w-9 h-9 mr-2 cursor-pointer flex justify-center items-center transition-colors duration-200 rounded-full hover:bg-base-200"
      >
        <IconSettings />
      </div>
      {/* Settings modal. */}
      <Modal title="Settings" show={showSettings} onClose={toggleSettings} class="max-w-lg">
        {/* Common settings. */}
        <p class={styles.subtitle}>{t('General')}</p>
        <div class={cx(styles.block, 'flex-col')}>
          <label class={styles.item}>
            <span class="label-text">{t('Theme')}</span>
            <select
              class="select select-xs"
              onChange={(e) => {
                currentTheme.value =
                  (e.target as HTMLSelectElement)?.value ?? DEFAULT_APP_OPTIONS.theme;
                options.set('theme', currentTheme.value);
              }}
            >
              {THEMES.map((theme) => (
                <option key={theme} value={theme} selected={currentTheme.value === theme}>
                  {capitalizeFirstLetter(theme)}
                </option>
              ))}
            </select>
          </label>
          <label class={styles.item}>
            <span class="label-text">{t('Language')}</span>
            <select
              class="select select-xs"
              onChange={(e) => {
                const language = (e.target as HTMLSelectElement)?.value ?? detectBrowserLanguage();
                i18n.changeLanguage(language);
                options.set('language', language);
              }}
            >
              {Object.entries(LANGUAGES_CONFIG).map(([langTag, langConf]) => (
                <option
                  key={langTag}
                  value={langTag}
                  selected={options.get('language') === langTag}
                >
                  {langConf.nameEn} - {langConf.name}
                </option>
              ))}
            </select>
          </label>
          <label class={styles.item}>
            <span class="label-text">{t('Debug')}</span>
            <input
              type="checkbox"
              class="toggle toggle-primary"
              checked={options.get('debug')}
              onChange={(e) => {
                options.set('debug', (e.target as HTMLInputElement)?.checked);
              }}
            />
          </label>
          <label class={styles.item}>
            <div class="flex items-center">
              <span class="label-text">{t('Date Time Format')}</span>
              <a
                href="https://day.js.org/docs/en/display/format"
                target="_blank"
                rel="noopener noreferrer"
                class="tooltip tooltip-bottom ml-0.5 before:max-w-40"
                data-tip={t(
                  'Click for more information. This will take effect on both previewer and exported files.',
                )}
              >
                <IconHelp size={20} />
              </a>
            </div>
            <input
              type="text"
              class="input input-bordered input-xs w-48"
              value={options.get('dateTimeFormat')}
              onChange={(e) => {
                options.set('dateTimeFormat', (e.target as HTMLInputElement)?.value);
              }}
            />
          </label>
        </div>
        {/* Enable or disable modules. */}
        <p class={styles.subtitle}>{t('Modules')}</p>
        <div class={cx(styles.block, 'flex-col')}>
          {extensionManager.getExtensions().map((extension) => (
            <label class={styles.item} key={extension.name}>
              <span>
                {t(extension.name.replace('Module', '') as TranslationKey)} {t('Module')}
              </span>
              <input
                type="checkbox"
                class="toggle toggle-secondary"
                checked={extension.enabled}
                onChange={() => {
                  extension.enabled
                    ? extensionManager.disable(extension.name)
                    : extensionManager.enable(extension.name);
                }}
              />
            </label>
          ))}
        </div>
        {/* Information about this script. */}
        <p class={styles.subtitle}>{t('About')}</p>
        <div class={styles.block}>
          <span class="label-text">
            {t('Version')} {packageJson.version}
          </span>
          <a class="btn btn-xs btn-ghost" target="_blank" href={packageJson.homepage}>
            <IconBrandGithubFilled class="[&>path]:stroke-0" />
            GitHub
          </a>
        </div>
      </Modal>
    </Fragment>
  );
}
