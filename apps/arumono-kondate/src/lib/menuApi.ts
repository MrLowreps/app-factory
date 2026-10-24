// 献立を AI に作ってもらう。返答は画面側でもスキーマで検査する。
import { MenuPlanSchema, type MenuPlan, type MenuRequest } from '../domain/menu';

export type MenuError = 'rate_limited' | 'network' | 'failed';

export async function requestMenu(req: MenuRequest): Promise<MenuPlan> {
  let res: Response;
  try {
    res = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(req),
    });
  } catch {
    throw new MenuRequestError('network');
  }
  if (res.status === 429) throw new MenuRequestError('rate_limited');
  if (!res.ok) throw new MenuRequestError('failed');
  const parsed = MenuPlanSchema.safeParse(await res.json().catch(() => null));
  if (!parsed.success) throw new MenuRequestError('failed');
  return parsed.data;
}

export class MenuRequestError extends Error {
  constructor(readonly kind: MenuError) {
    super(kind);
  }
}

export const MENU_ERROR_TEXT: Record<MenuError, string> = {
  rate_limited: '今日はたくさん使われたため、献立づくりを一時停止しています。明日またお試しください。',
  network: '通信できませんでした。電波のよいところでもう一度お試しください。',
  failed: '献立をうまく作れませんでした。少し時間をおいてもう一度お試しください。',
};
