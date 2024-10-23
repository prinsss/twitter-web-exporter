import dayjs from 'dayjs';
import { useSignal } from '@preact/signals';
import { EntityURL } from '@/types';
import logger from './logger';

/**
 * JSON.parse with error handling.
 */
export function safeJSONParse(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    logger.error((e as Error).message);
    return null;
  }
}

/**
 * Use signal to mimic React's `useState` hook.
 */
export function useSignalState<T>(value: T) {
  const signal = useSignal(value);

  const updateSignal = (newValue: T) => {
    signal.value = newValue;
  };

  return [signal.value, updateSignal, signal] as const;
}

/**
 * A signal representing a boolean value.
 */
export function useToggle(defaultValue = false) {
  const signal = useSignal(defaultValue);

  const toggle = () => {
    signal.value = !signal.value;
  };

  return [signal.value, toggle, signal] as const;
}

/**
 * Merge CSS class names.
 * Avoid using `tailwind-merge` here since it increases bundle size.
 *
 * @example
 * cx('foo', 'bar', false && 'baz') // => 'foo bar'
 */
export function cx(...classNames: (string | boolean | undefined)[]) {
  return classNames.filter(Boolean).join(' ');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEqual(obj1: any, obj2: any) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function xssFilter(str: string) {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Replace t.co URLs in a string with real HTML links.
 *
 * @example
 * ```jsx
 * // Input:
 * strEntitiesToHtml('Verification: https://t.co/hHSWmpjfbA NASA Hubble Space Telescope', [
 *   {
 *     "display_url": "nasa.gov/socialmedia",
 *     "expanded_url": "http://nasa.gov/socialmedia",
 *     "url": "https://t.co/hHSWmpjfbA",
 *     "indices": [140, 163]
 *   }
 * ]);
 *
 * // Output:
 * <p>Verification: <a href="http://nasa.gov/socialmedia">nasa.gov/socialmedia</a> NASA Hubble Space Telescope</p>
 * ```
 */
export function strEntitiesToHTML(str: string, urls?: EntityURL[]) {
  let temp = str;

  if (!urls?.length) {
    return temp;
  }

  for (const { url, display_url, expanded_url } of urls) {
    temp = temp.replaceAll(
      url,
      `<a class="link" target="_blank" href="${xssFilter(expanded_url ?? url)}">${xssFilter(
        display_url ?? url,
      )}</a>`,
    );
  }

  return temp;
}

export function parseTwitterDateTime(str: string) {
  // "Thu Sep 28 11:07:25 +0000 2023"
  // const regex = /^\w+ (\w+) (\d+) ([\d:]+) \+0000 (\d+)$/;
  const trimmed = str.replace(/^\w+ (.*)$/, '$1');
  return dayjs(trimmed, 'MMM DD HH:mm:ss ZZ YYYY', 'en');
}

export function formatDateTime(date: string | number | dayjs.Dayjs, format?: string) {
  if (typeof date === 'number' || typeof date === 'string') {
    date = dayjs(date);
  }

  // Display in local time zone.
  return date.format(format);
}

export function formatTwitterBirthdate(arg?: { day: number; month: number; year?: number }) {
  if (!arg) {
    return null;
  }

  const { day, month, year } = arg;
  const date = dayjs()
    .set('year', year ?? 0)
    .set('month', month - 1)
    .set('date', day);

  return year ? date.format('MMM DD, YYYY') : date.format('MMM DD');
}

export function formatVideoDuration(durationInMs?: number): string {
  if (typeof durationInMs !== 'number' || Number.isNaN(durationInMs)) {
    return 'N/A';
  }

  const durationInSeconds = Math.floor(durationInMs / 1000);
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
