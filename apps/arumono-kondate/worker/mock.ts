// 開発用の献立 (API キーなしで画面を確認するため)。本番では使わない。
import type { MenuPlan, MenuRequest } from '../src/domain/menu';

export function mockMenu(req: MenuRequest): MenuPlan {
  const has = (id: string) => req.pantry.includes(id);
  const protein = has('chicken-breast') ? 'chicken-breast' : has('pork-koma') ? 'pork-koma' : 'salmon';
  const veg = has('cabbage') ? 'cabbage' : 'broccoli';
  return {
    meals: [
      {
        slot: 'breakfast',
        dishes: [
          { name: '納豆ごはん', ingredients: [{ foodId: 'rice', grams: 150 }, { foodId: 'natto', grams: 45 }], steps: ['ご飯に納豆をのせる'], minutes: 2 },
          { name: 'ゆで卵', ingredients: [{ foodId: 'egg', grams: 100 }], steps: ['卵を8分ゆでる', '冷水で冷やして殻をむく'], minutes: 10 },
        ],
      },
      {
        slot: 'lunch',
        dishes: [
          {
            name: 'ツナとトマトのスパゲッティ',
            ingredients: [{ foodId: 'pasta', grams: 100 }, { foodId: 'tuna-can-water', grams: 70 }, { foodId: 'tomato', grams: 150 }, { foodId: 'olive-oil', grams: 8 }],
            steps: ['パスタを表示時間どおりにゆでる', 'フライパンで油とトマトを炒める', 'ツナとパスタを加えて塩で味を調える'],
            minutes: 15,
          },
        ],
      },
      {
        slot: 'dinner',
        dishes: [
          {
            name: '主菜の野菜炒め',
            ingredients: [{ foodId: protein, grams: 150 }, { foodId: veg, grams: 150 }, { foodId: 'vegetable-oil', grams: 8 }, { foodId: 'soy-sauce', grams: 12 }],
            steps: ['肉（魚）と野菜を食べやすく切る', '油で肉（魚）を焼く', '野菜を加えて炒め、しょうゆで味付けする'],
            minutes: 15,
          },
          { name: 'ご飯', ingredients: [{ foodId: 'rice', grams: 150 }], steps: ['ご飯をよそう'], minutes: 1 },
          { name: '豆腐のみそ汁', ingredients: [{ foodId: 'tofu-kinu', grams: 75 }, { foodId: 'miso', grams: 15 }], steps: ['湯を沸かして豆腐を入れる', '火を止めてみそを溶く'], minutes: 5 },
        ],
      },
    ],
  };
}
