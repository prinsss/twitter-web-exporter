/**
 * Minimal CBOR decoder for the subset that kotlinx.serialization emits.
 *
 * encrypted DM stores the message `contents` as a CBOR blob (polymorphic types are
 * encoded as `[ "<class-name>", { ...fields } ]` using indefinite-length
 * arrays/maps). We only need to walk that structure to pull out attachment
 * metadata, so this covers unsigned ints, negative ints, byte/text strings,
 * (in)definite arrays and maps, and the simple values true/false/null.
 */
export function decodeCbor(bytes: Uint8Array): unknown {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let i = 0;

  const readLength = (ai: number): number | null => {
    if (ai < 24) return ai;
    if (ai === 24) {
      const v = view.getUint8(i);
      i += 1;
      return v;
    }
    if (ai === 25) {
      const v = view.getUint16(i);
      i += 2;
      return v;
    }
    if (ai === 26) {
      const v = view.getUint32(i);
      i += 4;
      return v;
    }
    if (ai === 27) {
      const v = Number(view.getBigUint64(i));
      i += 8;
      return v;
    }
    if (ai === 31) return null; // indefinite length
    throw new Error(`Unsupported CBOR length ${ai}`);
  };

  const readItem = (): unknown => {
    const initial = view.getUint8(i);
    i += 1;
    const major = initial >> 5;
    const ai = initial & 0x1f;

    switch (major) {
      case 0: // unsigned integer
        return readLength(ai);
      case 1: // negative integer
        return -1 - (readLength(ai) as number);
      case 2: {
        // byte string
        const n = readLength(ai) as number;
        const b = bytes.slice(i, i + n);
        i += n;
        return b;
      }
      case 3: {
        // text string
        const n = readLength(ai) as number;
        const s = new TextDecoder().decode(bytes.subarray(i, i + n));
        i += n;
        return s;
      }
      case 4: {
        // array
        const n = readLength(ai);
        const arr: unknown[] = [];
        if (n === null) {
          while (i < bytes.length && view.getUint8(i) !== 0xff) arr.push(readItem());
          i += 1; // consume break
        } else {
          for (let k = 0; k < n; k++) arr.push(readItem());
        }
        return arr;
      }
      case 5: {
        // map
        const n = readLength(ai);
        const obj: Record<string, unknown> = {};
        if (n === null) {
          while (i < bytes.length && view.getUint8(i) !== 0xff) {
            const key = readItem();
            obj[String(key)] = readItem();
          }
          i += 1; // consume break
        } else {
          for (let k = 0; k < n; k++) {
            const key = readItem();
            obj[String(key)] = readItem();
          }
        }
        return obj;
      }
      case 7:
        if (ai === 20) return false;
        if (ai === 21) return true;
        return null; // null / undefined
      default:
        throw new Error(`Unsupported CBOR major type ${major}`);
    }
  };

  return readItem();
}
