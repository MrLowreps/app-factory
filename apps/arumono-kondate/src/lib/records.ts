// 作った料理の記録 (写真つき)。端末内の IndexedDB に保存する。
import type { Nutrition } from '../domain/menu';
import { idbDelete, idbGetAll, idbPut } from './idb';

export interface CookRecord {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  createdAt: string;
  dishName: string;
  nutrition: Nutrition;
  /** 位置情報などを消して縮小済みの写真 */
  photo?: Blob;
}

export const listRecords = async () => (await idbGetAll<CookRecord>()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export const saveRecord = (record: CookRecord) => idbPut(record);
export const deleteRecord = (id: string) => idbDelete(id);
export const newId = () => crypto.randomUUID();
