import { Namespace } from 'i18next';
import { useEffect, useRef, useState } from 'preact/hooks';
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
export function useTranslation(namespace?: Namespace) {
  const i18n = initI18n();

  // Bind t function to namespace (acts also as rerender trigger *when* args have changed).
  const [t, setT] = useState(() => i18n.getFixedT(null, namespace ?? null));

  // Do not update state if component is unmounted.
  const isMountedRef = useRef(true);
  const previousNamespaceRef = useRef(namespace);

  // Reset t function when namespace changes.
  useEffect(() => {
    isMountedRef.current = true;

    if (previousNamespaceRef.current !== namespace) {
      previousNamespaceRef.current = namespace;
      setT(() => i18n.getFixedT(null, namespace ?? null));
    }

    function boundReset() {
      if (isMountedRef.current) {
        setT(() => i18n.getFixedT(null, namespace ?? null));
      }
    }

    // Bind events to trigger change.
    i18n.on('languageChanged', boundReset);

    // Unbind events on unmount.
    return () => {
      isMountedRef.current = false;
      i18n.off('languageChanged', boundReset);
    };
  }, [namespace]);

  return { t, i18n };
}
