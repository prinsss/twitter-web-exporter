import { decodeCbor } from './cbor';
import type { EncryptedDmMedia } from './types';

/**
 * Pure parsing of an encrypted DM message's CBOR `contents` blob into media
 * attachment metadata. Kept free of browser/runtime dependencies so it can be
 * unit-tested against captured payloads.
 */

export function toUint8(value: unknown): Uint8Array | null {
  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
  return null;
}

/** Build the CDN URL of the (encrypted) media blob. */
function mediaUrl(senderId: string, mediaHashKey: string): string {
  return `https://ton.x.com/i/ton/data/xchat_media/${senderId}:${senderId}/${mediaHashKey}`;
}

/**
 * Decode the message `contents`: the original-cased `text` and any media
 * attachments. NOTE the message text is read from here, not the row's
 * `plain_text` column, because that column is lowercased (normalized for
 * search) — the cased original lives in this CBOR blob.
 */
export function parseContents(
  contents: unknown,
  senderId: string,
): { text: string | null; media: EncryptedDmMedia[] } {
  const bytes = toUint8(contents);
  if (!bytes) {
    return { text: null, media: [] };
  }

  let decoded: unknown;
  try {
    decoded = decodeCbor(bytes);
  } catch {
    return { text: null, media: [] };
  }

  // Shape: [ "<class>", { text, attachments: [ ["<class>", {..}], ... ], ... } ]
  const body = (Array.isArray(decoded) ? decoded[1] : null) as {
    text?: unknown;
    attachments?: unknown;
  } | null;

  const text = typeof body?.text === 'string' ? body.text : null;
  const attachments = body?.attachments;
  if (!Array.isArray(attachments)) {
    return { text, media: [] };
  }

  const result: EncryptedDmMedia[] = [];
  for (const attachment of attachments) {
    const fields = (Array.isArray(attachment) ? attachment[1] : null) as {
      attachmentId?: { id?: string };
      type?: string;
      filename?: string;
      size?: { width?: number; height?: number };
      fileSize?: { bytes?: number };
      mediaHashKey?: string;
      mediaHashBase64?: string;
    } | null;

    if (!fields?.mediaHashBase64 || !fields.mediaHashKey) {
      continue;
    }

    result.push({
      attachmentId: fields.attachmentId?.id ?? '',
      type: fields.type ?? '',
      filename: fields.filename ?? '',
      width: fields.size?.width,
      height: fields.size?.height,
      fileSizeBytes: fields.fileSize?.bytes,
      mediaHashKey: fields.mediaHashKey,
      mediaHashBase64: fields.mediaHashBase64,
      url: mediaUrl(senderId, fields.mediaHashKey),
    });
  }
  return { text, media: result };
}
