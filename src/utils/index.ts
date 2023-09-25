import { signal } from '@preact/signals';
import { useMemo } from 'preact/hooks';
import { EntityURL } from '@/types';
import logger from './logger';

/**
 * Supported formats of exporting.
 */
export const EXPORT_FORMAT = {
  JSON: 'JSON',
  HTML: 'HTML',
  CSV: 'CSV',
} as const;

export type ExportFormatType = (typeof EXPORT_FORMAT)[keyof typeof EXPORT_FORMAT];

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
 * Escape characters for CSV file.
 */
export function csvEscapeStr(str: string) {
  return `"${str.replace(/\"/g, '""').replace(/\n/g, '\\n').replace(/\r/g, '\\r')}"`;
}

/**
 * Save a text file to disk.
 */
export function saveFile(filename: string, content: string) {
  const link = document.createElement('a');
  link.style.display = 'none';
  document.body.appendChild(link);

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;

  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Avoid importing `useSignal` from "@preact/signals" package.
 *
 * @see https://github.com/preactjs/signals/pull/415
 */
export function useSignal<T>(value: T) {
  return useMemo(() => signal<T>(value), []);
}

/**
 * A signal representing a boolean value.
 */
export function useToggle(defaultValue = false) {
  const signal = useSignal(defaultValue);

  const toggle = () => {
    signal.value = !signal.value;
  };

  return [signal, toggle] as const;
}

/**
 * Merge CSS class names.
 * Avoid using `tailwind-merge` here since it increases bundle size.
 *
 * @example
 * cx('foo', 'bar', false && 'baz') // => 'foo bar'
 */
export function cx(...classNames: any[]) {
  return classNames.filter(Boolean).join(' ');
}

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
export function strEntitiesToHTML(str: string, urls: EntityURL[]) {
  let temp = str;

  if (!urls?.length) {
    return temp;
  }

  for (const { url, display_url, expanded_url } of urls) {
    temp = temp.replaceAll(
      url,
      `<a class="link" target="_blank" href="${xssFilter(expanded_url)}">${xssFilter(
        display_url,
      )}</a>`,
    );
  }

  return temp;
}
