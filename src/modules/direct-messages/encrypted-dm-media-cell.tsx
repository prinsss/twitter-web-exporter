import { saveAs } from 'file-saver-es';
import { EncryptedDmMedia } from './types';

type EncryptedDmMediaCellProps = {
  media: EncryptedDmMedia[];
  onPreview: (url: string) => void;
};

/**
 * Renders encrypted DM media attachments. Until the user views the media in X (which
 * triggers the in-page decryption we hook), only the metadata is known, so we
 * show a placeholder. Once the decrypted blob is captured, the thumbnail and a
 * download button appear.
 */
export function EncryptedDmMediaCell({ media, onPreview }: EncryptedDmMediaCellProps) {
  if (!media.length) {
    return <span>N/A</span>;
  }

  return (
    <div class="flex flex-row items-start space-x-1 w-max">
      {media.map((item) => (
        <div
          key={item.attachmentId}
          class="flex-shrink-0 relative w-12 h-12 rounded bg-base-300 overflow-hidden"
          title={item.filename}
        >
          {item.objectUrl ? (
            <img
              class="w-full h-full object-cover cursor-pointer"
              src={item.objectUrl}
              alt={item.filename}
              onClick={() => onPreview(item.objectUrl!)}
            />
          ) : (
            <div class="w-full h-full flex items-center justify-center text-[9px] leading-tight text-center px-0.5 opacity-60">
              {item.type || 'media'}
            </div>
          )}
          {item.blob && (
            <button
              class="absolute bottom-0 right-0 px-0.5 text-xs leading-4 text-white bg-black bg-opacity-50 rounded-tl"
              title={`Download ${item.filename}`}
              onClick={(e) => {
                e.stopPropagation();
                if (item.blob) {
                  saveAs(item.blob, item.filename || item.attachmentId);
                }
              }}
            >
              ↓
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
