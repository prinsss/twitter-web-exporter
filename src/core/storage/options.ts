import { Signal } from '@preact/signals';
import { isEqual, safeJSONParse } from '@/utils/common';
import logger from '@/utils/logger';
import packageJson from '@/../package.json';

/**
 * Type for global app options.
 */
export interface AppOptions {
  theme?: string;
  debug?: boolean;
  showControlPanel?: boolean;
  disabledExtensions?: string[];
  dateTimeFormat?: string;
  language?: string;
  version?: string;
}

export const DEFAULT_APP_OPTIONS: AppOptions = {
  theme: 'system',
  debug: false,
  showControlPanel: true,
  disabledExtensions: [
    'HomeTimelineModule',
    'ListTimelineModule',
    'ListSubscribersModule',
    'ListMembersModule',
  ],
  dateTimeFormat: 'YYYY-MM-DD HH:mm:ss Z',
  language: '',
  version: packageJson.version,
};

// https://daisyui.com/docs/themes/
export const THEMES = [
  'system',
  'cupcake',
  'dark',
  'emerald',
  'cyberpunk',
  'valentine',
  'lofi',
  'dracula',
  'cmyk',
  'business',
  'winter',
] as const;

const LOCAL_STORAGE_KEY = packageJson.name;

/**
 * Persist app options to browser local storage.
 */
export class AppOptionsManager {
  private appOptions: AppOptions = { ...DEFAULT_APP_OPTIONS };
  private previous: AppOptions = { ...DEFAULT_APP_OPTIONS };

  /**
   * Signal for subscribing to option changes.
   */
  public signal = new Signal(0);

  constructor() {
    this.loadAppOptions();
  }

  public get<T extends keyof AppOptions>(key: T, defaultValue?: AppOptions[T]) {
    return this.appOptions[key] ?? defaultValue;
  }

  public set<T extends keyof AppOptions>(key: T, value: AppOptions[T]) {
    this.appOptions[key] = value;
    this.saveAppOptions();
  }

  /**
   * Read app options from local storage.
   */
  private loadAppOptions() {
    this.appOptions = {
      ...this.appOptions,
      ...safeJSONParse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}'),
    };

    const oldVersion = this.appOptions.version ?? '';
    const newVersion = DEFAULT_APP_OPTIONS.version ?? '';

    // Migrate from v1.0 to v1.1.
    if (newVersion.startsWith('1.1') && oldVersion.startsWith('1.0')) {
      this.appOptions.disabledExtensions = [
        ...(this.appOptions.disabledExtensions ?? []),
        'HomeTimelineModule',
        'ListTimelineModule',
      ];
      logger.info(`App options migrated from v${oldVersion} to v${newVersion}`);
      setTimeout(() => this.saveAppOptions(), 0);
    }

    this.previous = { ...this.appOptions };
    logger.info('App options loaded', this.appOptions);
    this.signal.value++;
  }

  /**
   * Write app options to local storage.
   */
  private saveAppOptions() {
    const oldValue = this.previous;
    const newValue = {
      ...this.appOptions,
      version: packageJson.version,
    };

    if (isEqual(oldValue, newValue)) {
      return;
    }

    this.appOptions = newValue;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.appOptions));

    this.previous = { ...this.appOptions };
    logger.debug('App options saved', this.appOptions);
    this.signal.value++;
  }
}
