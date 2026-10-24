// AI が考えた献立の分量を、目標のカロリーと PFC に近づける。
// AI は料理の組み合わせを考えるのは得意だが計算は苦手なので、分量の最終調整は計算で行う。
// 調整するのは「たんぱく源 (肉・魚・卵・乳・大豆)」「主食」「油」の3つの量だけで、野菜や調味料はそのまま。
import { getFood, type Food } from './foods';
import type { MenuPlan } from './menu';
import type { Targets } from './targets';

type Group = 'protein' | 'carb' | 'fat';
const GROUPS: Group[] = ['protein', 'carb', 'fat'];
const MACROS = ['kcal', 'p', 'f', 'c'] as const;

/** 各グループを何倍まで増減してよいか。極端な量にならないようにする */
const SCALE_RANGE: Record<Group, [number, number]> = { protein: [0.5, 2.5], carb: [0.3, 3], fat: [0, 3] };
/** 元の分量からあまり離れないようにする強さ */
const STAY_CLOSE = 0.02;

function groupOf(food: Food): Group | null {
  if (['meat', 'fish', 'egg-dairy', 'soy'].includes(food.category)) return 'protein';
  if (food.category === 'staple') return 'carb';
  if (food.category === 'seasoning' && food.f >= 90) return 'fat';
  return null;
}

export function fitToTargets(plan: MenuPlan, targets: Targets): MenuPlan {
  // A[栄養][グループ] = そのグループの今の量で摂れる栄養、fixed = 調整しない食材の分
  const A = MACROS.map(() => GROUPS.map(() => 0));
  const fixed = MACROS.map(() => 0);
  for (const { foodId, grams } of plan.meals.flatMap((m) => m.dishes.flatMap((d) => d.ingredients))) {
    const food = getFood(foodId);
    if (!food) continue;
    const g = groupOf(food);
    MACROS.forEach((m, i) => {
      const v = (food[m] * grams) / 100;
      if (g) A[i][GROUPS.indexOf(g)] += v;
      else fixed[i] += v;
    });
  }
  const scale = solveScales(A, fixed, MACROS.map((m) => targets[m]));
  return {
    meals: plan.meals.map((meal) => ({
      ...meal,
      dishes: meal.dishes.map((dish) => ({
        ...dish,
        ingredients: dish.ingredients.map((ing) => {
          const food = getFood(ing.foodId);
          const g = food ? groupOf(food) : null;
          return g ? { ...ing, grams: roundGrams(ing.grams * scale[GROUPS.indexOf(g)]) } : ing;
        }),
      })),
    })),
  };
}

/** 目標との差 (目標に対する割合) の二乗和が小さくなる倍率を、範囲内で求める */
function solveScales(A: number[][], fixed: number[], target: number[]): number[] {
  const scale = GROUPS.map(() => 1);
  const locked = GROUPS.map(() => false);
  for (let round = 0; round < GROUPS.length; round++) {
    const free = GROUPS.map((_, j) => j).filter((j) => !locked[j]);
    if (free.length === 0) break;
    // 正規方程式 (AᵀWA + λI) s = AᵀW(t - 固定分) + λ
    const M = free.map(() => free.map(() => 0));
    const v = free.map(() => STAY_CLOSE);
    free.forEach((j, a) => (M[a][a] += STAY_CLOSE));
    target.forEach((t, i) => {
      if (t <= 0) return;
      const w = 1 / (t * t);
      const rest = t - fixed[i] - GROUPS.reduce((sum, _, j) => sum + (locked[j] ? A[i][j] * scale[j] : 0), 0);
      free.forEach((j, a) => {
        v[a] += w * A[i][j] * rest;
        free.forEach((k, b) => (M[a][b] += w * A[i][j] * A[i][k]));
      });
    });
    const solved = solveLinear(M, v);
    let clamped = false;
    free.forEach((j, a) => {
      const [lo, hi] = SCALE_RANGE[GROUPS[j]];
      scale[j] = solved[a];
      if (solved[a] < lo || solved[a] > hi) {
        scale[j] = Math.min(Math.max(solved[a], lo), hi);
        locked[j] = true;
        clamped = true;
      }
    });
    if (!clamped) break;
  }
  return scale;
}

/** ガウスの消去法。行列は正則化しているので解ける */
function solveLinear(M: number[][], v: number[]): number[] {
  const n = v.length;
  const a = M.map((row, i) => [...row, v[i]]);
  for (let c = 0; c < n; c++) {
    let pivot = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[pivot][c])) pivot = r;
    [a[c], a[pivot]] = [a[pivot], a[c]];
    for (let r = 0; r < n; r++) {
      if (r === c || a[c][c] === 0) continue;
      const k = a[r][c] / a[c][c];
      for (let k2 = c; k2 <= n; k2++) a[r][k2] -= k * a[c][k2];
    }
  }
  return a.map((row, i) => (row[i] === 0 ? 1 : row[n] / row[i]));
}

/** 20g 以上は 5g 単位、それ未満は 1g 単位に丸める */
const roundGrams = (g: number) => Math.min(600, Math.max(1, g >= 20 ? Math.round(g / 5) * 5 : Math.round(g)));
