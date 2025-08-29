import { JSX } from 'preact';
import { useRef } from 'preact/hooks';
import { IconArrowUpRight, IconSearch, IconX } from '@tabler/icons-preact';

import { useTranslation } from '@/i18n';
import { Media } from '@/types';
import { formatTwitterImage } from '@/utils/api';
import { cx, formatVideoDuration } from '@/utils/common';

import { ErrorBoundary } from './error-boundary';

// #region ExtensionPanel

type ExtensionPanelProps = {
  title: string;
  description: string;
  active?: boolean;
  onClick?: () => void;
  children?: JSX.Element | JSX.Element[];
  indicatorColor?: string;
};

/**
 * Common template for an extension panel.
 */
export function ExtensionPanel({
  title,
  description,
  children,
  onClick,
  active,
  indicatorColor = 'bg-secondary',
}: ExtensionPanelProps) {
  return (
    <section class="module-panel">
      {/* Card contents. */}
      <div class="h-12 flex items-center justify-start">
        <div class="relative flex h-4 w-4 mr-3 shrink-0">
          {active && (
            <span
              class={cx(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                indicatorColor,
              )}
            />
          )}
          <span class={cx('relative inline-flex rounded-full h-4 w-4', indicatorColor)} />
        </div>
        <div class="flex flex-col flex-grow">
          <p class="text-base m-0 font-medium leading-none">{title}</p>
          <p class="text-sm text-base-content leading-5 text-opacity-70 m-0">{description}</p>
        </div>
        <button class="btn btn-sm p-0 w-9 h-9" onClick={onClick}>
          <IconArrowUpRight />
        </button>
      </div>
      {/* Modal entries. */}
      {children}
    </section>
  );
}

// #region Modal

type ModalProps = {
  show?: boolean;
  onClose?: () => void;
  children?: JSX.Element | JSX.Element[];
  title?: string;
  class?: string;
};

/**
 * Common template for modals.
 */
export function Modal({ show, onClose, title, children, class: className }: ModalProps) {
  if (!show) {
    return <dialog class="modal" />;
  }

  return (
    <dialog class="modal modal-open" open>
      <div class={cx('modal-box p-3 flex flex-col', className)}>
        <header class="flex items-center h-9 mb-2">
          <div
            onClick={onClose}
            class="w-9 h-9 mr-2 cursor-pointer flex justify-center items-center transition-colors duration-200 rounded-full hover:bg-base-200"
          >
            <IconX />
          </div>
          <h2 class="leading-none text-xl m-0 font-semibold">{title}</h2>
        </header>
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
      <form method="dialog" class="modal-backdrop">
        <div onClick={onClose} />
      </form>
    </dialog>
  );
}

// #region SearchArea

type SearchAreaProps = {
  defaultValue?: string;
  onChange: (value: string) => void;
};

/**
 * Common template for global table filter.
 */
export function SearchArea({ defaultValue, onChange }: SearchAreaProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div class="join justify-end my-[2px] w-full max-w-[50%] absolute top-3 right-3">
      <input
        ref={inputRef}
        type="text"
        class="input input-bordered input-sm join-item max-w-[calc(100%-46px)]"
        placeholder={t('Search...')}
        defaultValue={defaultValue}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onChange(inputRef.current?.value ?? '');
          }
        }}
      />
      <button class="btn btn-sm join-item" onClick={() => onChange(inputRef.current?.value ?? '')}>
        <IconSearch size={20} />
      </button>
    </div>
  );
}

// #region MultiSelect

type MultiSelectProps<T> = {
  class?: string;
  options: { label: string; value: T }[];
  selected: T[];
  onChange: (value: T[]) => void;
};

export function MultiSelect<T extends string>(props: MultiSelectProps<T>) {
  const { options, selected, onChange } = props;

  const onInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.checked) {
      onChange([...new Set([...selected, target.value as T])]);
    } else {
      onChange(selected.filter((value) => value !== target.value));
    }
  };

  return (
    <div class={cx('dropdown', props.class)}>
      <div
        tabIndex={0}
        class="input input-bordered input-sm flex flex-row items-center space-x-1 cursor-pointer"
      >
        {options
          .filter((option) => selected.includes(option.value))
          .map((option) => (
            <div key={option.value} class="badge badge-accent select-none">
              {option.label}
            </div>
          ))}
      </div>
      <ul
        tabIndex={0}
        class="dropdown-content menu menu-sm z-10 w-full rounded-box bg-base-100 p-2 shadow"
      >
        {options.map((option) => (
          <li key={option.value}>
            <label class="label cursor-pointer justify-start">
              <input
                type="checkbox"
                class="checkbox checkbox-accent checkbox-sm"
                value={option.value}
                checked={selected.includes(option.value)}
                onChange={onInputChange}
              />
              <span class="label-text ml-1">{option.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

// #region Columns

type MediaDisplayColumnProps = {
  data: Media[];
  onClick: (media: Media) => void;
};

export function MediaDisplayColumn({ data, onClick }: MediaDisplayColumnProps) {
  return (
    <div class="flex flex-row items-start space-x-1 w-max">
      {data.map((media) => (
        <div
          key={media.media_key ?? media.id_str}
          class="flex-shrink-0 block cursor-pointer relative w-12 h-12 rounded bg-base-300 overflow-hidden"
          onClick={() => onClick(media)}
        >
          <img
            class="w-full h-full object-cover"
            src={formatTwitterImage(media.media_url_https, 'thumb')}
            alt={media.ext_alt_text || ''}
            title={media.ext_alt_text || ''}
          />
          {/* Show video duration or GIF. */}
          {media.type !== 'photo' && (
            <div class="absolute bottom-0.5 left-0.5 h-4 w-max px-0.5 text-xs text-white bg-black bg-opacity-30 leading-4 text-center rounded">
              {media.type === 'video'
                ? formatVideoDuration(media.video_info?.duration_millis)
                : 'GIF'}
            </div>
          )}
          {/* Or show ALT text if any. */}
          {media.type === 'photo' && media.ext_alt_text && (
            <div class="absolute bottom-0.5 left-0.5 h-4 w-max px-0.5 text-xs text-white bg-black bg-opacity-30 leading-4 text-center rounded">
              ALT
            </div>
          )}
        </div>
      ))}
      {data.length ? null : 'N/A'}
    </div>
  );
}

// #region Icons

/**
 * @license
 * Credit: https://icooon-mono.com/12776-%e7%8c%ab%e3%81%ae%e7%84%a1%e6%96%99%e3%82%a2%e3%82%a4%e3%82%b3%e3%83%b32/
 */
export const CatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="w-full h-full select-none">
    <g>
      <path d="M461.814,197.514c-2.999-11.335-14.624-18.093-25.958-15.094c-1.866,0.553-13.477,3.649-26.042,14.341 c-6.234,5.349-12.633,12.751-17.361,22.454c-4.748,9.69-7.685,21.577-7.657,35.033c0.013,16.345,4.133,34.895,13.442,56.257 c6.282,14.403,9.144,29.697,9.144,44.846c0.062,25.627-8.438,50.756-21.121,68.283c-6.296,8.777-13.546,15.606-20.816,20.022 c-2.986,1.81-5.943,3.131-8.888,4.181l0.989-5.854c-0.055-17.03-4.05-34.84-13.021-50.528 c-28.356-49.643-66.223-134.741-66.223-134.741l-1.527-4.879c29.47-7.796,58.579-23.408,73.148-54.985 c38.931-84.344-41.08-142.73-41.08-142.73s-25.958-56.222-38.924-54.06c-12.978,2.164-41.094,38.931-41.094,38.931h-23.788h-23.788 c0,0-28.108-36.767-41.08-38.931c-12.979-2.163-38.924,54.06-38.924,54.06s-80.018,58.386-41.087,142.73 c13.822,29.953,40.741,45.572,68.634,53.748l-2.951,9.662c0,0-31.908,81.552-60.279,131.195C37.198,441.092,58.478,512,97.477,512 c29.47,0,79.14,0,101.692,0c7.292,0,11.763,0,11.763,0c22.544,0,72.222,0,101.691,0c12.654,0,23.38-7.547,31.204-19.324 c15.826-0.013,30.81-4.872,43.707-12.758c19.455-11.915,34.708-30.32,45.434-51.896c10.685-21.618,16.856-46.636,16.878-72.672 c0-20.484-3.885-41.619-12.682-61.813c-7.561-17.34-9.918-30.216-9.904-39.29c0.028-7.526,1.5-12.544,3.359-16.414 c1.417-2.889,3.124-5.17,4.983-7.091c2.771-2.868,5.964-4.879,8.349-6.054c1.182-0.595,2.135-0.968,2.674-1.162l0.449-0.152 l-0.007-0.028C458.179,220.189,464.779,208.724,461.814,197.514z"></path>
    </g>
  </svg>
);
