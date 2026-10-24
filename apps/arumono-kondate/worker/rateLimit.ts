// 回数制限。KV (RATE_LIMIT) があればそれを使い、なければ同じ実行環境の中だけで数える (目安)。
// 高額請求の最終的な歯止めは、AI 事業者側の月額上限で設定する。

export interface RateLimitStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

const memory = new Map<string, number>();

export async function consume(store: RateLimitStore | undefined, ip: string, limitPerDay: number): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);
  const key = `menu:${day}:${ip}`;
  const used = store ? Number((await store.get(key)) ?? 0) : (memory.get(key) ?? 0);
  if (used >= limitPerDay) return false;
  if (store) await store.put(key, String(used + 1), { expirationTtl: 60 * 60 * 26 });
  else {
    if (memory.size > 10_000) memory.clear();
    memory.set(key, used + 1);
  }
  return true;
}
