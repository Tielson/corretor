/**
 * Wrapper seguro para localStorage: funciona no build (sem window),
 * em janelas privadas e com armazenamento bloqueado (fallback em memória).
 */

export interface KeyValueBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SafeStorage {
  get<T>(key: string, fallback: T): T;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  /** true quando o armazenamento persistente está disponível. */
  readonly persistent: boolean;
}

export function createMemoryBackend(): KeyValueBackend {
  const map = new Map<string, string>();
  return {
    getItem: (k) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

function probe(backend: KeyValueBackend): boolean {
  try {
    const k = '__corretor_probe__';
    backend.setItem(k, '1');
    backend.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function createSafeStorage(getBackend: () => KeyValueBackend | null | undefined): SafeStorage {
  let backend: KeyValueBackend | null = null;
  try {
    backend = getBackend() ?? null;
  } catch {
    backend = null;
  }
  const persistent = backend !== null && probe(backend);
  const memory = createMemoryBackend();
  const active: KeyValueBackend = persistent && backend ? backend : memory;

  return {
    persistent,
    get<T>(key: string, fallback: T): T {
      try {
        const raw = active.getItem(key);
        return raw === null ? fallback : (JSON.parse(raw) as T);
      } catch {
        return fallback;
      }
    },
    set<T>(key: string, value: T): void {
      const raw = JSON.stringify(value);
      try {
        active.setItem(key, raw);
      } catch {
        // Cota excedida ou bloqueio após o probe: mantém em memória.
        memory.setItem(key, raw);
      }
    },
    remove(key: string): void {
      try {
        active.removeItem(key);
      } catch {
        memory.removeItem(key);
      }
    },
  };
}

let instance: SafeStorage | null = null;

/** Instância do navegador. Só chame em código de cliente (efeitos, handlers). */
export function safeStorage(): SafeStorage {
  if (instance) return instance;
  instance = createSafeStorage(() => (typeof window === 'undefined' ? null : window.localStorage));
  return instance;
}

export const STORAGE_KEYS = {
  favoritos: 'corretor:favoritos:v1',
  comparar: 'corretor:comparar:v1',
} as const;

/** Evento para sincronizar ilhas diferentes na mesma página. */
export const STORAGE_EVENT = 'corretor:storage';
