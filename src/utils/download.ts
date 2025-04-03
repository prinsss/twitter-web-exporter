import { saveAs } from 'file-saver-es';
import createWriter from './zip-stream';
import logger from './logger';

export type FileLike = { filename: string; url: string; type?: string };

export type ProgressCallback<T = unknown> = (current: number, total: number, value?: T) => void;

/**
 * Download multiple files from URL and save as a zip archive.
 *
 * @see https://github.com/jimmywarting/StreamSaver.js/issues/106
 * @param zipFilename Name of the zip archive file
 * @param files List of files to download
 * @param onProgress Callback function to track progress
 * @param rateLimit The minimum time gap between two downloads (in milliseconds)
 */
export async function zipStreamDownload(
  zipFilename: string,
  files: FileLike[],
  onProgress?: ProgressCallback<FileLike>,
  rateLimit = 1000,
) {
  // NOTE: StreamSaver.js fails on sites with strict Content-Security-Policy (CSP) such as Twitter,
  // since it uses iframe and service worker to download files. Use file-saver instead here.
  // See: https://github.com/jimmywarting/StreamSaver.js/issues/203

  // The data written to this stream will be streamed to the user's browser as a file download.
  // const writableOutputStream = streamSaver.createWriteStream(zipFilename);

  let current = 0;
  const total = files.length;
  const fileIterator = files.values();

  // Add files to zip archive stream.
  const readableZipStream: ReadableStream = createWriter({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async pull(ctrl: any) {
      const fileInfo = fileIterator.next();
      if (fileInfo.done) {
        // All files have been downloaded.
        ctrl.close();
      } else {
        // Download file and add to zip.
        const { filename, url } = fileInfo.value;

        const start = Date.now();
        logger.debug(`Start downloading ${filename} from ${url}`);
        return fetch(url)
          .then((res) => {
            ctrl.enqueue({
              name: filename,
              stream: () => res.body,
            });

            // Update progress.
            onProgress?.(++current, total, fileInfo.value);
            logger.debug(`Finished downloading ${filename} in ${Date.now() - start}ms`);
          })
          .then(() => {
            // Wait for a while to prevent rate limit.
            return new Promise((resolve) => setTimeout(resolve, rateLimit));
          });
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chunks: any[] = [];
  const writableOutputStream = new WritableStream({
    write(chunk) {
      chunks.push(chunk);
    },
    close() {
      logger.info('Zip stream closed.');
    },
  });

  // Download the zip archive.
  logger.info(`Exporting to ZIP file: ${zipFilename}`);
  await readableZipStream.pipeTo(writableOutputStream);

  const arrayBuffer = await new Blob(chunks).arrayBuffer();
  const blob = new Blob([arrayBuffer]);
  saveAs(blob, zipFilename);
}
