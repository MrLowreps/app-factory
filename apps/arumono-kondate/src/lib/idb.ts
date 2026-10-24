// 写真付きの記録は容量が大きいので IndexedDB に保存する。
const DB_NAME = 'arumono-kondate';
const STORE = 'records';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = fn(tx.objectStore(STORE));
        tx.oncomplete = () => {
          db.close();
          resolve(req.result as T);
        };
        tx.onerror = () => reject(tx.error);
      }),
  );
}

export const idbGetAll = <T>() => run<T[]>('readonly', (s) => s.getAll());
export const idbPut = <T>(value: T) => run<IDBValidKey>('readwrite', (s) => s.put(value));
export const idbDelete = (id: string) => run<undefined>('readwrite', (s) => s.delete(id));
export const idbClear = () => run<undefined>('readwrite', (s) => s.clear());
