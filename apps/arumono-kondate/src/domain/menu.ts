// 献立のデータ形式。AI 中継 (worker) と画面の両方で同じスキーマを使い、AI の返答を必ず検査する。
import { z } from 'zod';
import { FOOD_IDS, FOODS, getFood, unitText } from './foods';
import type { Targets } from './targets';

export const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner'] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];
export const MEAL_LABEL: Record<MealSlot, string> = { breakfast: '朝ごはん', lunch: '昼ごはん', dinner: '夜ごはん' };

const foodId = z.enum(FOOD_IDS);

export const MenuRequestSchema = z.object({
  targets: z.object({
    kcal: z.number().int().min(800).max(5000),
    p: z.number().int().min(0).max(400),
    f: z.number().int().min(0).max(300),
    c: z.number().int().min(0).max(800),
  }),
  pantry: z.array(foodId).max(FOODS.length),
  dislikes: z.array(foodId).max(FOODS.length),
  staplesOnHand: z.boolean(),
});
export type MenuRequest = z.infer<typeof MenuRequestSchema>;

export const DishSchema = z.object({
  name: z.string().min(1).max(40),
  ingredients: z
    .array(z.object({ foodId, grams: z.number().min(1).max(600) }))
    .min(1)
    .max(10),
  steps: z.array(z.string().min(1).max(120)).min(1).max(6),
  minutes: z.number().int().min(1).max(120),
});
export type Dish = z.infer<typeof DishSchema>;

export const MenuPlanSchema = z.object({
  meals: z
    .array(z.object({ slot: z.enum(MEAL_SLOTS), dishes: z.array(DishSchema).min(1).max(4) }))
    .length(3),
});
export type MenuPlan = z.infer<typeof MenuPlanSchema>;

export interface Nutrition {
  kcal: number;
  p: number;
  f: number;
  c: number;
}

export const ZERO: Nutrition = { kcal: 0, p: 0, f: 0, c: 0 };

export const addNutrition = (a: Nutrition, b: Nutrition): Nutrition => ({
  kcal: a.kcal + b.kcal,
  p: a.p + b.p,
  f: a.f + b.f,
  c: a.c + b.c,
});

export function dishNutrition(dish: Dish): Nutrition {
  return dish.ingredients.reduce<Nutrition>((sum, { foodId: id, grams }) => {
    const food = getFood(id);
    if (!food) return sum;
    const r = grams / 100;
    return addNutrition(sum, { kcal: food.kcal * r, p: food.p * r, f: food.f * r, c: food.c * r });
  }, ZERO);
}

export const planNutrition = (plan: MenuPlan): Nutrition =>
  plan.meals.flatMap((m) => m.dishes).map(dishNutrition).reduce(addNutrition, ZERO);

/** 目標に対する達成率 (0〜) */
export const achievement = (actual: Nutrition, targets: Targets) => ({
  kcal: actual.kcal / targets.kcal,
  p: targets.p ? actual.p / targets.p : 0,
  f: targets.f ? actual.f / targets.f : 0,
  c: targets.c ? actual.c / targets.c : 0,
});

/** 食材の量を「卵 2個（100g）」のように読みやすくする */
export function formatAmount(id: string, grams: number): string {
  const food = getFood(id);
  if (food?.unit) {
    const count = Math.round((grams / food.unit.grams) * 2) / 2;
    if (count >= 0.5 && Math.abs(count * food.unit.grams - grams) / grams < 0.15) {
      return `${unitText(food.unit.label, count)}（${Math.round(grams)}g）`;
    }
  }
  return `${Math.round(grams)}g`;
}
