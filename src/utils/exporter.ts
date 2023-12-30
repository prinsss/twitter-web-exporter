import { Tweet, User } from '@/types';
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

export type ProgressCallback = (current: number, total: number) => void;

/**
 * Save a text file to disk.
 */
export function saveFile(filename: string, content: string) {
  const link = document.createElement('a');
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export data and download as a file.
 */
export async function exportData(
  data: Tweet[] | User[],
  format: ExportFormatType,
  filename: string,
  onProgress?: ProgressCallback,
) {
  try {
    let content = '';
    logger.info(`Exporting to ${format} file: ${filename}`);

    switch (format) {
      case EXPORT_FORMAT.JSON:
        content = await jsonExporter(data, onProgress);
        break;
      case EXPORT_FORMAT.HTML:
        content = await htmlExporter(data, onProgress);
        break;
      case EXPORT_FORMAT.CSV:
        content = await csvExporter(data, onProgress);
        break;
    }

    saveFile(filename, content);
  } catch (err) {
    logger.errorWithBanner('Failed to export file', err as Error);
  }
}

export async function jsonExporter(data: Tweet[] | User[], onProgress?: ProgressCallback) {
  const total = data.length;
  onProgress?.(Math.floor(total / 2), total);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const content = JSON.stringify(data, undefined, '  ');
  onProgress?.(total, total);
  return content;
}

export async function htmlExporter(data: Tweet[] | User[], onProgress?: ProgressCallback) {
  const total = data.length;
  const content = '<html></html>';
  onProgress?.(total, total);
  return content;
}

export async function csvExporter(data: Tweet[] | User[], onProgress?: ProgressCallback) {
  const total = data.length;
  const content = 'id,name';
  onProgress?.(total, total);
  return content;
}
