// src/services/catalogCache.ts
// Robust IndexedDB caching for large catalog datasets (>2.5MB), eliminating localStorage QuotaExceededError

const DB_NAME = 'SecretArea_CatalogDB';
const DB_VERSION = 1;
const STORE_NAME = 'catalog_store';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not available'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Persists raw or transformed catalog data into IndexedDB without hitting the 5MB localStorage quota limit.
 * Also clears any legacy oversized keys from localStorage to reclaim browser storage.
 */
export async function setCatalogCache(key: 'raw' | 'transformed', value: any): Promise<void> {
  // Purge legacy oversized keys from localStorage if present
  try {
    localStorage.removeItem('cached_secret_resources');
    localStorage.removeItem('cached_transformed_resources');
  } catch {
    // Ignore localStorage errors
  }

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // Non-blocking fallback
    console.debug('Catalog IDB write skipped:', err);
  }
}

/**
 * Retrieves cached raw or transformed catalog data from IndexedDB.
 */
export async function getCatalogCache(key: 'raw' | 'transformed'): Promise<any | null> {
  try {
    const db = await openDB();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Synchronous lightweight maintenance cache stored safely in localStorage (~50 bytes).
 */
export function saveMaintenanceCache(config: { active: boolean; endTime: string | null; message: string } | null) {
  try {
    if (config) {
      localStorage.setItem('cached_maintenance_config', JSON.stringify(config));
    } else {
      localStorage.removeItem('cached_maintenance_config');
    }
  } catch {
    // Ignore quota errors
  }
}

export function getMaintenanceCache(): { active: boolean; endTime: string | null; message: string } | null {
  try {
    const raw = localStorage.getItem('cached_maintenance_config');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
