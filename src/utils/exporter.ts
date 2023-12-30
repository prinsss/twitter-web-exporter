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

export type DataType = Record<string, any>;

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
export async function exportData(data: DataType[], format: ExportFormatType, filename: string) {
  try {
    let content = '';
    logger.info(`Exporting to ${format} file: ${filename}`);

    switch (format) {
      case EXPORT_FORMAT.JSON:
        content = await jsonExporter(data);
        break;
      case EXPORT_FORMAT.HTML:
        content = await htmlExporter(data);
        break;
      case EXPORT_FORMAT.CSV:
        content = await csvExporter(data);
        break;
    }

    saveFile(filename, content);
  } catch (err) {
    logger.errorWithBanner('Failed to export file', err as Error);
  }
}

export async function jsonExporter(data: DataType[]) {
  const content = JSON.stringify(data, undefined, '  ');
  return content;
}

export async function htmlExporter(data: DataType[]) {
  const content = '<html></html>';
  return content;
}

export async function csvExporter(data: DataType[]) {
  const content = 'id,name';
  return content;
}
