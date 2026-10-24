// 献立から買い物リストを作る。家にある食材と、常備の調味料は除く。
import { CATEGORY_ORDER, getFood } from './foods';
import type { MenuPlan } from './menu';

export interface ShoppingItem {
  foodId: string;
  grams: number;
}

export function buildShoppingList(plan: MenuPlan, pantry: string[], staplesOnHand: boolean): ShoppingItem[] {
  const owned = new Set(pantry);
  const totals = new Map<string, number>();
  for (const dish of plan.meals.flatMap((m) => m.dishes)) {
    for (const { foodId, grams } of dish.ingredients) {
      const food = getFood(foodId);
      if (!food || owned.has(foodId) || (staplesOnHand && food.staple)) continue;
      totals.set(foodId, (totals.get(foodId) ?? 0) + grams);
    }
  }
  const order = (id: string) => CATEGORY_ORDER.indexOf(getFood(id)?.category ?? 'seasoning');
  return [...totals].map(([foodId, grams]) => ({ foodId, grams })).sort((a, b) => order(a.foodId) - order(b.foodId));
}

export const isOwned = (foodId: string, pantry: string[], staplesOnHand: boolean): boolean =>
  pantry.includes(foodId) || (staplesOnHand && Boolean(getFood(foodId)?.staple));

/** 買い出しの予定をカレンダーに登録するための iCalendar (.ics) 文字列 */
export function buildShoppingIcs(lines: string[], start: Date, appName: string): string {
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const escape = (s: string) => s.replace(/\\/g, '\\\\').replace(/[,;]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');
  const uid = `${stamp(new Date())}-${Math.random().toString(36).slice(2)}@arumono-kondate`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${appName}//JA`,
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escape(`買い出し（${appName}）`)}`,
    `DESCRIPTION:${escape(lines.join('\n'))}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escape('買い出しの時間です')}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
