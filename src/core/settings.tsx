import { Fragment } from 'preact';
import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import {
  IconPalette,
  IconSettings,
  IconBrandGithubFilled,
  IconHelp,
  IconDatabaseExport,
  IconTrashX,
  IconReportAnalytics,
} from '@tabler/icons-preact';
import { GM_registerMenuCommand } from '$';

import packageJson from '@/../package.json';
import { Modal } from '@/components/common';
import { useTranslation, detectBrowserLanguage, LANGUAGES_CONFIG, TranslationKey } from '@/i18n';
import { cx, useToggle } from '@/utils/common';
import { saveFile } from '@/utils/exporter';

import { db } from './database';
import extensionManager from './extensions';
import { options } from './options';
import { Themes } from './themes';

export function Settings() {
  const { t, i18n } = useTranslation();

  const currentTheme = useSignal(options.get('theme'));
  const [showSettings, toggleSettings] = useToggle(false);
  const [showThemes, toggleThemes] = useToggle(false);

  const styles = {
    subtitle: 'mb-2 text-base-content ml-4 opacity-50 font-semibold text-xs',
    block:
      'text-sm mb-2 w-full flex px-4 py-2 text-base-content bg-base-200 rounded-box justify-between',
    item: 'label cursor-pointer flex justify-between h-8 items-center p-0',
  };

  useEffect(() => {
    GM_registerMenuCommand(`${t('Version')} ${packageJson.version}`, () => {
      window.open(packageJson.homepage, '_blank');
    });
  }, []);

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
      <Modal title={t('Settings')} show={showSettings} onClose={toggleSettings} class="max-w-lg">
        {/* Common settings. */}
        <p class={styles.subtitle}>{t('General')}</p>
        <div class={cx(styles.block, 'flex-col')}>
          <div class={styles.item}>
            <div class="flex items-center">
              <span class="label-text">{t('Theme')}</span>
            </div>
            <div>
              <button class="btn btn-xs btn-accent mr-2" onClick={toggleThemes}>
                <IconPalette size={20} />
                {currentTheme.value}
              </button>
            </div>
          </div>
          <label class={styles.item}>
            <span class="label-text">{t('Language')}</span>
            <select
              class="select select-xs w-52"
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
                class="tooltip tooltip-bottom ml-0.5 before:max-w-40!"
                data-tip={t(
                  'Click for more information. This will take effect on both previewer and exported files.',
                )}
              >
                <IconHelp size={20} />
              </a>
            </div>
            <input
              type="text"
              class="input input-bordered input-xs w-52"
              value={options.get('dateTimeFormat')}
              onChange={(e) => {
                options.set('dateTimeFormat', (e.target as HTMLInputElement)?.value);
              }}
            />
          </label>
          {/* Database operations. */}
          <div class={styles.item}>
            <div class="flex items-center">
              <span class="label-text">{t('Local Database')}</span>
            </div>
            <div>
              <button
                class="btn btn-xs btn-neutral mr-2"
                onClick={async () => {
                  let storageUsageText = 'Storage usage: N/A';
                  if (typeof navigator.storage.estimate === 'function') {
                    const { quota = 1, usage = 0 } = await navigator.storage.estimate();
                    const usageMB = (usage / 1024 / 1024).toFixed(2);
                    const quotaMB = (quota / 1024 / 1024).toFixed(2);
                    storageUsageText = `Storage usage: ${usageMB}MB / ${quotaMB}MB`;
                  }

                  const count = await db.count();
                  alert(
                    storageUsageText +
                      '\n\nIndexedDB tables count:\n' +
                      JSON.stringify(count, undefined, '  '),
                  );
                }}
              >
                <IconReportAnalytics size={20} />
                {t('Analyze DB')}
              </button>
              <button
                class="btn btn-xs btn-primary mr-2"
                onClick={async () => {
                  const blob = await db.export();
                  if (blob) {
                    saveFile(`twitter-web-exporter-${Date.now()}.json`, blob);
                  }
                }}
              >
                <IconDatabaseExport size={20} />
                {t('Export DB')}
              </button>
              <button
                class="btn btn-xs btn-warning"
                onClick={async () => {
                  if (confirm(t('Are you sure to clear all data in the database?'))) {
                    await db.clear();
                  }
                }}
              >
                <IconTrashX size={20} />
                {t('Clear DB')}
              </button>
            </div>
          </div>
        </div>
        {/* Enable or disable modules. */}
        <p class={styles.subtitle}>{t('Modules (Scroll to see more)')}</p>
        <div class={cx(styles.block, 'flex-col', 'max-h-44 overflow-scroll')}>
          {extensionManager.getExtensions().map((extension) => (
            <label class={cx(styles.item, 'shrink-0')} key={extension.name}>
              <span>
                {t(extension.name.replace('Module', '') as TranslationKey)} {t('Module')}
              </span>
              <input
                type="checkbox"
                class="toggle toggle-secondary"
                checked={extension.enabled}
                onChange={() => {
                  if (extension.enabled) {
                    extensionManager.disable(extension.name);
                  } else {
                    extensionManager.enable(extension.name);
                  }
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
      {/* Themes modal. */}
      <Themes show={showThemes} onClose={toggleThemes} />
    </Fragment>
  );
}
