import { readFile, writeFile } from 'node:fs/promises';

import { jsonExporter } from '../src/utils/exporter';
import { extractXquikTweetRecords, toTwitterWebExporterRows } from '../src/utils/xquik-import';

const [, , inputPath, outputPath = 'twitter-web-exporter-records.json'] = Bun.argv;

if (!inputPath) {
  throw new Error(
    'Usage: bun run import:xquik -- <xquik-response.json> [twitter-web-exporter-records.json]',
  );
}

let input: unknown;
try {
  input = JSON.parse(await readFile(inputPath, 'utf8')) as unknown;
} catch (error) {
  if (error instanceof SyntaxError) {
    throw new Error(`Invalid JSON in ${inputPath}. Export the Xquik response as JSON first.`);
  }

  throw error;
}

const records = extractXquikTweetRecords(input);

if (records.length === 0) {
  throw new Error('No tweets found. Pass a Search Tweets response or its tweets array.');
}

const rows = toTwitterWebExporterRows(records);
await writeFile(outputPath, await jsonExporter(rows), 'utf8');
process.stdout.write(`Wrote ${rows.length} records to ${outputPath}\n`);
