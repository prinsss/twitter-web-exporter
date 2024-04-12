import { Namespace } from 'i18next';
import { useEffect, useRef, useState } from 'preact/hooks';
import { TranslationKey } from 'virtual:i18next-loader';
import { initI18n } from './init';

export type { LocaleResources, TranslationKey } from 'virtual:i18next-loader';
export * from './detector';

/**
 * A simplified implementation of react-i18next's `useTranslation` for Preact.
 *
 * @see https://react.i18next.com/latest/usetranslation-hook
 * @param namespace The namespace to use for the translation.
 * @returns An object with the `t` function and the `i18n` instance.
 */
export function useTranslation(ns?: Namespace) {
  const i18n = initI18n();

  // Bind t function to namespace (acts also as rerender trigger *when* args have changed).
  const [t, setT] = useState(() => i18n.getFixedT(null, ns ?? null));

  // Do not update state if component is unmounted.
  const isMountedRef = useRef(true);
  const previousNamespaceRef = useRef(ns);

  // Reset t function when namespace changes.
  useEffect(() => {
    isMountedRef.current = true;

    if (previousNamespaceRef.current !== ns) {
      previousNamespaceRef.current = ns;
      setT(() => i18n.getFixedT(null, ns ?? null));
    }

    function boundReset() {
      if (isMountedRef.current) {
        setT(() => i18n.getFixedT(null, ns ?? null));
      }
    }

    // Bind events to trigger change.
    i18n.on('languageChanged', boundReset);

    // Unbind events on unmount.
    return () => {
      isMountedRef.current = false;
      i18n.off('languageChanged', boundReset);
    };
  }, [ns]);

  return { t, i18n };
}

/**
 * A simplified implementation of react-i18next's `Trans` component for Preact.
 *
 * @see https://react.i18next.com/latest/trans-component
 * @param i18nKey The translation key to use.
 * @param ns The namespace to use for the translation.
 * @returns The translated string.
 */
export function Trans({ i18nKey, ns = 'exporter' }: { i18nKey: TranslationKey; ns?: Namespace }) {
  const { t } = useTranslation(ns);
  return <span>{t(i18nKey)}</span>;
}
