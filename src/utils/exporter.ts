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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataType = Record<string, any>;

/**
 * Escape characters for CSV file.
 */
export function csvEscapeStr(str: string) {
  return `"${str.replace(/"/g, '""').replace(/\n/g, '\\n').replace(/\r/g, '\\r')}"`;
}

/**
 * Save a text file to disk.
 */
export function saveFile(filename: string, content: string | Blob, prependBOM: boolean = false) {
  const link = document.createElement('a');
  let blob: Blob;

  if (content instanceof Blob) {
    blob = content;
  } else {
    blob = new Blob(prependBOM ? [new Uint8Array([0xef, 0xbb, 0xbf]), content] : [content], {
      type: 'text/plain;charset=utf-8',
    });
  }

  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export data and download as a file.
 *
 * @param data Data list to export.
 * @param format Export format. (JSON, HTML, CSV)
 * @param filename Filename to save.
 * @param translations Translations for headers.
 */
export async function exportData(
  data: DataType[],
  format: ExportFormatType,
  filename: string,
  translations: Record<string, string>,
) {
  try {
    let content = '';
    let prependBOM = false;
    logger.info(`Exporting to ${format} file: ${filename}`);

    switch (format) {
      case EXPORT_FORMAT.JSON:
        content = await jsonExporter(data);
        break;
      case EXPORT_FORMAT.HTML:
        content = await htmlExporter(data, translations);
        break;
      case EXPORT_FORMAT.CSV:
        prependBOM = true;
        content = await csvExporter(data);
        break;
    }
    saveFile(filename, content, prependBOM);
  } catch (err) {
    logger.errorWithBanner('Failed to export file', err as Error);
  }
}

export async function jsonExporter(data: DataType[]) {
  return JSON.stringify(data, undefined, '  ');
}

export async function htmlExporter(data: DataType[], translations: Record<string, string>) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  // The keys of the first row are translated and used as headers.
  const exportKeys = Object.keys(data[0] ?? {});
  const headerRow = document.createElement('tr');
  for (const exportKey of exportKeys) {
    const th = document.createElement('th');
    th.textContent = translations[exportKey] ?? exportKey;
    headerRow.appendChild(th);
  }

  thead.appendChild(headerRow);
  table.appendChild(thead);
  table.className = 'table table-striped';

  for (const row of data) {
    const tr = document.createElement('tr');
    for (const exportKey of exportKeys) {
      const td = document.createElement('td');
      const value = row[exportKey];

      if (exportKey === 'profile_image_url' || exportKey === 'profile_banner_url') {
        const img = document.createElement('img');
        img.src = value;
        img.width = 50;
        td.innerHTML = '';
        td.appendChild(img);
      } else if (exportKey === 'media') {
        if (value?.length > 0) {
          for (const media of value) {
            const img = document.createElement('img');
            img.src = media.thumbnail;
            img.width = 50;
            img.alt = media.ext_alt_text || '';
            img.title = media.ext_alt_text || '';
            const link = document.createElement('a');
            link.href = media.original;
            link.target = '_blank';
            link.style.marginRight = '0.5em';
            link.appendChild(img);
            td.appendChild(link);
          }
        }
      } else if (exportKey === 'full_text' || exportKey === 'description') {
        const p = document.createElement('p');
        p.innerHTML = value;
        p.style.whiteSpace = 'pre-wrap';
        p.style.maxWidth = '640px';
        td.appendChild(p);
      } else if (exportKey === 'metadata') {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = 'Expand';
        details.appendChild(summary);
        const pre = document.createElement('pre');
        pre.textContent = JSON.stringify(value, undefined, '  ');
        details.appendChild(pre);
        td.appendChild(details);
      } else if (exportKey === 'url') {
        const link = document.createElement('a');
        link.href = value;
        link.target = '_blank';
        link.textContent = value;
        td.appendChild(link);
      } else {
        td.textContent = typeof value === 'string' ? value : JSON.stringify(row[exportKey]);
      }

      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);

  return `
    <html>
      <head>
        <meta charset="utf-8">
        <title>Exported Data ${new Date().toISOString()}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
      </head>
      <body>
        ${table.outerHTML}
      </body>
    </html>
  `;
}

export async function csvExporter(data: DataType[]) {
  const headers = Object.keys(data[0] ?? {});
  let content = headers.join(',') + '\n';

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      if (typeof value === 'string') {
        return csvEscapeStr(value);
      }

      if (typeof value === 'object') {
        return csvEscapeStr(JSON.stringify(value));
      }

      return value;
    });
    content += values.join(',');
    content += '\n';
  }

  return content;
}
