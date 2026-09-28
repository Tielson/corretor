/**
 * Favoritos e comparação guardados via safeStorage, sincronizados entre
 * ilhas da mesma página (evento próprio) e entre abas (evento "storage").
 * Nunca lê o armazenamento no render do build: o valor inicial é vazio e
 * é carregado depois da hidratação.
 */
import { useCallback, useEffect, useState } from 'react';
import { safeStorage, STORAGE_EVENT, STORAGE_KEYS } from '@/lib/storage';
import { parseCompareItems, parseIdList, type CompareItem } from '@/lib/compare';

function useStoredValue<T>(key: string, parse: (v: unknown) => T, empty: T) {
  const [value, setValue] = useState<T>(empty);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const read = () => setValue(parse(safeStorage().get<unknown>(key, null)));
    read();
    setLoaded(true);
    const onCustom = (e: Event) => {
      if ((e as CustomEvent<string>).detail === key) read();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) read();
    };
    window.addEventListener(STORAGE_EVENT, onCustom);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(STORAGE_EVENT, onCustom);
      window.removeEventListener('storage', onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const write = useCallback(
    (next: T) => {
      safeStorage().set(key, next);
      setValue(next);
      window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: key }));
    },
    [key],
  );

  return { value, write, loaded, persistent: loaded ? safeStorage().persistent : true };
}

export function useFavorites() {
  const { value, write, loaded, persistent } = useStoredValue<string[]>(STORAGE_KEYS.favoritos, parseIdList, []);
  return { ids: value, setIds: write, loaded, persistent };
}

export function useCompare() {
  const { value, write, loaded, persistent } = useStoredValue<CompareItem[]>(STORAGE_KEYS.comparar, parseCompareItems, []);
  return { items: value, setItems: write, loaded, persistent };
}
