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

/**
 * Export data and download as a file.
 */
export function exportData(
  data: Tweet[] | User[],
  format: ExportFormatType,
  filename: string,
  setLoading: (loading: boolean) => void,
) {
  try {
    let content = '';
    setLoading(true);

    logger.info(`Exporting to ${format} file: ${filename}`);

    switch (format) {
      case EXPORT_FORMAT.JSON:
        content = JSON.stringify(data, undefined, '  ');
        break;
      case EXPORT_FORMAT.HTML:
        content = '<html></html>';
        break;
      case EXPORT_FORMAT.CSV:
        content = 'id,name';
        break;
    }

    saveFile(filename, content);
  } catch (err) {
    logger.errorWithBanner('Failed to export file', err as Error);
  } finally {
    setLoading(false);
  }
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
