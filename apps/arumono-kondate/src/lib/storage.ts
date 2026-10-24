// 端末内 (localStorage) への保存。保存できない環境 (プライベートブラウズなど) でも画面は動くようにする。
import { useCallback, useEffect, useState } from 'react';

const PREFIX = 'arumono:';

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // 保存できなくても、その場の表示は続ける
  }
}

export function clearAll(): void {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // 何もしない
  }
}

/** useState と同じ使い方で、値を端末に保存する */
export function useStored<T>(key: string, fallback: T): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => load(key, fallback));
  useEffect(() => save(key, value), [key, value]);
  const set = useCallback((next: T | ((prev: T) => T)) => setValue(next), []);
  return [value, set];
}
