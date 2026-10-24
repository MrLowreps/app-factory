// 無料モデルは返答の形が少し崩れやすいので、検査の前に直せる範囲だけ整える。
// 整えたあとも MenuPlanSchema で必ず検査し、直せないものはエラーにする。
import { FOODS, getFood } from '../src/domain/foods';
import { MEAL_SLOTS } from '../src/domain/menu';

const byName = new Map(FOODS.map((f) => [f.name, f.id]));
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const clamp = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
};
const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** id の代わりに食材名で返ってきたときも id に直す。一覧にない食材は捨てる */
const toFoodId = (v: unknown): string | null => {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return getFood(s) ? s : (byName.get(s) ?? null);
};

function normalizeDish(raw: unknown) {
  if (!isRecord(raw)) return null;
  const ingredients = (Array.isArray(raw.ingredients) ? raw.ingredients : [])
    .filter(isRecord)
    .map((i) => ({ foodId: toFoodId(i.foodId), grams: clamp(i.grams, 1, 600, 0) }))
    .filter((i): i is { foodId: string; grams: number } => i.foodId !== null && i.grams > 0)
    .slice(0, 10);
  const steps = (Array.isArray(raw.steps) ? raw.steps : [])
    .map((s) => text(s, 120))
    .filter(Boolean)
    .slice(0, 6);
  const name = text(raw.name, 40);
  if (!name || ingredients.length === 0 || steps.length === 0) return null;
  return { name, ingredients, steps, minutes: clamp(raw.minutes, 1, 120, 15) };
}

export function normalizePlan(raw: unknown): unknown {
  const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!isRecord(value) || !Array.isArray(value.meals)) return value;
  const meals = value.meals.filter(isRecord);
  return {
    meals: MEAL_SLOTS.map((slot, i) => {
      const meal = meals.find((m) => m.slot === slot) ?? meals[i];
      const dishes = (Array.isArray(meal?.dishes) ? meal.dishes : []).map(normalizeDish).filter((d) => d !== null).slice(0, 4);
      return { slot, dishes };
    }),
  };
}
