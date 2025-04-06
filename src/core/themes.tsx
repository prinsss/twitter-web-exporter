import { useSignal } from '@preact/signals';
import { Modal } from '@/components/common';
import { useTranslation } from '@/i18n';
import { cx } from '@/utils/common';
import { options, THEMES } from './options';

type ThemesProps = {
  show: boolean;
  onClose: () => void;
};

export function Themes({ show, onClose }: ThemesProps) {
  const { t } = useTranslation();
  const currentTheme = useSignal(options.get('theme'));

  return (
    <Modal
      title={t('Change Theme')}
      show={show}
      onClose={onClose}
      class="max-w-4xl md:max-w-screen-md sm:max-w-screen-sm lg:max-w-screen-lg"
    >
      <div class="rounded-box p-1 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {THEMES.map((theme) => (
          <ThemePreview
            key={theme}
            theme={theme}
            selected={currentTheme.value === theme}
            onClick={() => {
              currentTheme.value = theme;
              options.set('theme', theme);
            }}
          />
        ))}
      </div>
    </Modal>
  );
}

type ThemePreviewProps = {
  theme: string;
  selected: boolean;
  onClick: () => void;
};

/**
 * Borrowed from daisyUI docs.
 *
 * @license MIT
 * @see https://daisyui.com/docs/themes/
 * @see https://github.com/saadeghi/daisyui/blob/v5.0.13/packages/docs/src/components/ThemePreviews.svelte
 */
function ThemePreview({ theme, selected, onClick }: ThemePreviewProps) {
  return (
    <div
      onClick={onClick}
      class={cx(
        'border-base-content/20 hover:border-base-content/40 overflow-hidden rounded-lg border outline-2 outline-offset-2 outline-transparent',
        'leading-normal',
        selected && 'outline-base-content!',
      )}
    >
      <div data-theme={theme} class="bg-base-100 text-base-content w-full cursor-pointer font-sans">
        <div class="grid grid-cols-5 grid-rows-3">
          <div class="bg-base-200 col-start-1 row-span-2 row-start-1"></div>
          <div class="bg-base-300 col-start-1 row-start-3"></div>
          <div class="bg-base-100 col-span-4 col-start-2 row-span-3 row-start-1 flex flex-col gap-1 p-2">
            <div class="font-bold">{theme}</div>
            <div class="flex flex-wrap gap-1">
              <div class="bg-primary flex aspect-square w-5 items-center justify-center rounded lg:w-6">
                <div class="text-primary-content text-sm font-bold">A</div>
              </div>
              <div class="bg-secondary flex aspect-square w-5 items-center justify-center rounded lg:w-6">
                <div class="text-secondary-content text-sm font-bold">A</div>
              </div>
              <div class="bg-accent flex aspect-square w-5 items-center justify-center rounded lg:w-6">
                <div class="text-accent-content text-sm font-bold">A</div>
              </div>
              <div class="bg-neutral flex aspect-square w-5 items-center justify-center rounded lg:w-6">
                <div class="text-neutral-content text-sm font-bold">A</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
