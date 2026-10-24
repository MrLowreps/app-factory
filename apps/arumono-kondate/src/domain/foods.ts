// 食材マスタ。栄養値は可食部 100g あたり (エネルギー kcal / たんぱく質 P / 脂質 F / 炭水化物 C)。
// 出典: 文部科学省「日本食品標準成分表（八訂）」をもとにした値。
// TODO(公開前): 成分表の公式 Excel と全項目を照合する。現状の値は仮で、誤差を含む可能性がある。

export type FoodCategory = 'meat' | 'fish' | 'egg-dairy' | 'soy' | 'vegetable' | 'mushroom' | 'staple' | 'fruit' | 'seasoning';

export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  kcal: number;
  p: number;
  f: number;
  c: number;
  /** よく使う単位 (例: 卵 {n}個 = 50g)。{n} に数が入る。献立や買い物リストの表示に使う */
  unit?: { label: string; grams: number };
  /** 家に常備している前提にできる調味料・油 */
  staple?: boolean;
}

export const CATEGORY_LABEL: Record<FoodCategory, string> = {
  meat: '肉',
  fish: '魚介',
  'egg-dairy': '卵・乳製品',
  soy: '大豆製品',
  vegetable: '野菜',
  mushroom: 'きのこ',
  staple: '主食',
  fruit: '果物',
  seasoning: '調味料・油',
};

export const CATEGORY_ORDER: FoodCategory[] = ['meat', 'fish', 'egg-dairy', 'soy', 'vegetable', 'mushroom', 'staple', 'fruit', 'seasoning'];

const f = (
  id: string,
  name: string,
  category: FoodCategory,
  [kcal, p, fat, c]: [number, number, number, number],
  extra: Partial<Pick<Food, 'unit' | 'staple'>> = {},
): Food => ({ id, name, category, kcal, p, f: fat, c, ...extra });

export const FOODS: Food[] = [
  // 肉
  f('chicken-breast', '鶏むね肉（皮なし）', 'meat', [105, 23.3, 1.9, 0.1], { unit: { label: '{n}枚', grams: 250 } }),
  f('chicken-thigh', '鶏もも肉（皮つき）', 'meat', [190, 16.6, 14.2, 0], { unit: { label: '{n}枚', grams: 250 } }),
  f('chicken-sasami', '鶏ささみ', 'meat', [98, 23.9, 0.8, 0.1], { unit: { label: '{n}本', grams: 50 } }),
  f('chicken-ground', '鶏ひき肉', 'meat', [171, 17.5, 12.0, 0]),
  f('pork-loin', '豚ロース', 'meat', [248, 19.3, 19.2, 0.2]),
  f('pork-belly', '豚バラ肉', 'meat', [366, 14.4, 35.4, 0.1]),
  f('pork-momo', '豚もも肉', 'meat', [171, 20.5, 10.2, 0.2]),
  f('pork-koma', '豚こま切れ肉', 'meat', [201, 18.5, 14.6, 0.2]),
  f('pork-ground', '豚ひき肉', 'meat', [209, 17.7, 17.2, 0.1]),
  f('mixed-ground', '合いびき肉', 'meat', [222, 17.3, 17.0, 0.1]),
  f('beef-momo', '牛もも肉', 'meat', [196, 19.5, 13.3, 0.4]),
  f('beef-koma', '牛こま切れ肉', 'meat', [257, 17.1, 21.4, 0.2]),
  f('bacon', 'ベーコン', 'meat', [400, 12.9, 39.1, 0.3]),
  f('ham', 'ロースハム', 'meat', [211, 18.6, 14.5, 2.0], { unit: { label: '{n}枚', grams: 10 } }),
  f('sausage', 'ウインナー', 'meat', [319, 11.5, 30.6, 3.3], { unit: { label: '{n}本', grams: 20 } }),
  // 魚介
  f('salmon', '生鮭', 'fish', [124, 22.3, 4.1, 0.1], { unit: { label: '{n}切れ', grams: 80 } }),
  f('saba', 'さば', 'fish', [211, 20.6, 16.8, 0.3], { unit: { label: '{n}切れ', grams: 80 } }),
  f('buri', 'ぶり', 'fish', [222, 21.4, 17.6, 0.3], { unit: { label: '{n}切れ', grams: 80 } }),
  f('tara', 'たら', 'fish', [72, 17.6, 0.2, 0.1], { unit: { label: '{n}切れ', grams: 80 } }),
  f('shrimp', 'むきえび', 'fish', [77, 18.4, 0.3, 0.3]),
  f('squid', 'いか', 'fish', [76, 17.9, 0.8, 0.1]),
  f('tuna-can-water', 'ツナ缶（水煮）', 'fish', [70, 16.0, 0.7, 0.2], { unit: { label: '{n}缶', grams: 70 } }),
  f('tuna-can-oil', 'ツナ缶（油漬）', 'fish', [265, 17.7, 21.7, 0.1], { unit: { label: '{n}缶', grams: 70 } }),
  f('saba-can', 'さば水煮缶', 'fish', [174, 20.9, 10.7, 0.2], { unit: { label: '{n}缶', grams: 150 } }),
  f('chikuwa', 'ちくわ', 'fish', [119, 12.2, 2.0, 13.5], { unit: { label: '{n}本', grams: 30 } }),
  f('kanikama', 'かに風味かまぼこ', 'fish', [89, 12.1, 0.5, 9.2], { unit: { label: '{n}本', grams: 10 } }),
  // 卵・乳製品
  f('egg', '卵', 'egg-dairy', [142, 12.2, 10.2, 0.4], { unit: { label: '{n}個', grams: 50 } }),
  f('milk', '牛乳', 'egg-dairy', [61, 3.3, 3.8, 4.8], { unit: { label: 'コップ{n}杯', grams: 200 } }),
  f('yogurt', 'ヨーグルト（無糖）', 'egg-dairy', [56, 3.6, 3.0, 4.9]),
  f('cheese', 'プロセスチーズ', 'egg-dairy', [313, 22.7, 26.0, 1.3], { unit: { label: '{n}個', grams: 20 } }),
  f('pizza-cheese', 'ピザ用チーズ', 'egg-dairy', [356, 25.8, 29.0, 1.4]),
  f('butter', 'バター', 'egg-dairy', [700, 0.6, 81.0, 0.2]),
  // 大豆製品
  f('tofu-momen', '木綿豆腐', 'soy', [73, 7.0, 4.9, 1.5], { unit: { label: '{n}丁', grams: 300 } }),
  f('tofu-kinu', '絹ごし豆腐', 'soy', [56, 5.3, 3.5, 2.0], { unit: { label: '{n}丁', grams: 300 } }),
  f('natto', '納豆', 'soy', [184, 16.5, 10.0, 12.1], { unit: { label: '{n}パック', grams: 45 } }),
  f('atsuage', '厚揚げ', 'soy', [143, 10.7, 11.3, 0.9], { unit: { label: '{n}枚', grams: 150 } }),
  f('aburaage', '油揚げ', 'soy', [377, 23.4, 34.4, 0.4], { unit: { label: '{n}枚', grams: 30 } }),
  f('soy-milk', '豆乳（無調整）', 'soy', [43, 3.6, 2.0, 3.1]),
  f('edamame', '枝豆', 'soy', [125, 11.7, 6.2, 8.8]),
  // 野菜
  f('cabbage', 'キャベツ', 'vegetable', [21, 1.3, 0.2, 5.2]),
  f('onion', '玉ねぎ', 'vegetable', [33, 1.0, 0.1, 8.4], { unit: { label: '{n}個', grams: 200 } }),
  f('carrot', 'にんじん', 'vegetable', [35, 0.7, 0.2, 9.3], { unit: { label: '{n}本', grams: 150 } }),
  f('potato', 'じゃがいも', 'vegetable', [59, 1.8, 0.1, 17.3], { unit: { label: '{n}個', grams: 150 } }),
  f('sweet-potato', 'さつまいも', 'vegetable', [126, 1.2, 0.2, 31.9]),
  f('kabocha', 'かぼちゃ', 'vegetable', [78, 1.9, 0.3, 20.6]),
  f('spinach', 'ほうれん草', 'vegetable', [18, 2.2, 0.4, 3.1], { unit: { label: '{n}束', grams: 200 } }),
  f('komatsuna', '小松菜', 'vegetable', [13, 1.5, 0.2, 2.4], { unit: { label: '{n}束', grams: 200 } }),
  f('broccoli', 'ブロッコリー', 'vegetable', [37, 5.4, 0.6, 6.6], { unit: { label: '{n}株', grams: 250 } }),
  f('tomato', 'トマト', 'vegetable', [20, 0.7, 0.1, 4.7], { unit: { label: '{n}個', grams: 150 } }),
  f('cucumber', 'きゅうり', 'vegetable', [13, 1.0, 0.1, 3.0], { unit: { label: '{n}本', grams: 100 } }),
  f('eggplant', 'なす', 'vegetable', [18, 1.1, 0.1, 5.1], { unit: { label: '{n}本', grams: 80 } }),
  f('green-pepper', 'ピーマン', 'vegetable', [20, 0.9, 0.2, 5.1], { unit: { label: '{n}個', grams: 30 } }),
  f('daikon', '大根', 'vegetable', [15, 0.5, 0.1, 4.1]),
  f('hakusai', '白菜', 'vegetable', [13, 0.8, 0.1, 3.2]),
  f('negi', '長ねぎ', 'vegetable', [35, 1.4, 0.1, 8.3], { unit: { label: '{n}本', grams: 100 } }),
  f('moyashi', 'もやし', 'vegetable', [15, 1.7, 0.1, 2.6], { unit: { label: '{n}袋', grams: 200 } }),
  f('lettuce', 'レタス', 'vegetable', [11, 0.6, 0.1, 2.8]),
  f('nira', 'にら', 'vegetable', [18, 1.7, 0.3, 4.0], { unit: { label: '{n}束', grams: 100 } }),
  f('gobo', 'ごぼう', 'vegetable', [58, 1.8, 0.1, 15.4]),
  f('asparagus', 'アスパラガス', 'vegetable', [21, 2.6, 0.2, 3.9]),
  f('corn-can', 'コーン缶', 'vegetable', [78, 2.3, 0.5, 17.8]),
  f('avocado', 'アボカド', 'vegetable', [176, 2.1, 17.5, 7.9], { unit: { label: '{n}個', grams: 140 } }),
  f('kimchi', 'キムチ', 'vegetable', [27, 2.3, 0.1, 5.2]),
  f('garlic', 'にんにく', 'vegetable', [129, 6.4, 0.9, 27.5]),
  // きのこ
  f('shimeji', 'しめじ', 'mushroom', [22, 2.7, 0.5, 4.8], { unit: { label: '{n}パック', grams: 100 } }),
  f('enoki', 'えのきたけ', 'mushroom', [34, 2.7, 0.2, 7.6], { unit: { label: '{n}袋', grams: 100 } }),
  f('shiitake', 'しいたけ', 'mushroom', [25, 3.1, 0.3, 6.4]),
  f('maitake', 'まいたけ', 'mushroom', [22, 2.0, 0.5, 4.4], { unit: { label: '{n}パック', grams: 100 } }),
  f('eringi', 'エリンギ', 'mushroom', [31, 2.8, 0.4, 6.0]),
  // 主食
  f('rice', 'ご飯', 'staple', [156, 2.5, 0.3, 37.1], { unit: { label: '茶碗{n}杯', grams: 150 } }),
  f('brown-rice', '玄米ご飯', 'staple', [152, 2.8, 1.0, 35.6], { unit: { label: '茶碗{n}杯', grams: 150 } }),
  f('bread', '食パン', 'staple', [248, 8.9, 4.1, 46.4], { unit: { label: '6枚切り{n}枚', grams: 60 } }),
  f('udon', 'うどん（ゆで）', 'staple', [95, 2.6, 0.4, 21.6], { unit: { label: '{n}玉', grams: 200 } }),
  f('soba', 'そば（ゆで）', 'staple', [130, 4.8, 1.0, 26.0], { unit: { label: '{n}玉', grams: 170 } }),
  f('pasta', 'スパゲッティ（乾）', 'staple', [347, 12.9, 1.8, 73.1], { unit: { label: '{n}人分', grams: 100 } }),
  f('somen', 'そうめん（乾）', 'staple', [333, 9.5, 1.1, 72.7], { unit: { label: '{n}束', grams: 50 } }),
  f('oatmeal', 'オートミール', 'staple', [350, 13.7, 5.7, 69.1]),
  // 果物
  f('banana', 'バナナ', 'fruit', [93, 1.1, 0.2, 22.5], { unit: { label: '{n}本', grams: 100 } }),
  f('apple', 'りんご', 'fruit', [53, 0.1, 0.2, 15.5], { unit: { label: '{n}個', grams: 250 } }),
  f('kiwi', 'キウイフルーツ', 'fruit', [51, 1.0, 0.2, 13.4], { unit: { label: '{n}個', grams: 85 } }),
  // 調味料・油 (常備前提)
  f('vegetable-oil', 'サラダ油', 'seasoning', [886, 0, 100, 0], { staple: true }),
  f('olive-oil', 'オリーブ油', 'seasoning', [894, 0, 100, 0], { staple: true }),
  f('sesame-oil', 'ごま油', 'seasoning', [890, 0, 100, 0], { staple: true }),
  f('soy-sauce', 'しょうゆ', 'seasoning', [77, 7.7, 0, 7.9], { staple: true }),
  f('miso', 'みそ', 'seasoning', [182, 12.5, 6.0, 21.9], { staple: true }),
  f('sugar', '砂糖', 'seasoning', [391, 0, 0, 99.3], { staple: true }),
  f('mirin', 'みりん', 'seasoning', [241, 0.3, 0, 43.2], { staple: true }),
  f('mayonnaise', 'マヨネーズ', 'seasoning', [668, 1.4, 76.0, 3.6], { staple: true }),
  f('ketchup', 'ケチャップ', 'seasoning', [104, 1.6, 0.2, 27.6], { staple: true }),
  f('salt', '塩', 'seasoning', [0, 0, 0, 0], { staple: true }),
  f('sesame', 'いりごま', 'seasoning', [605, 20.3, 54.2, 18.5]),
  f('konjac', 'こんにゃく', 'seasoning', [5, 0.1, 0, 2.3]),
];

export const FOOD_IDS = FOODS.map((x) => x.id) as [string, ...string[]];

const byId = new Map(FOODS.map((x) => [x.id, x]));
export const getFood = (id: string): Food | undefined => byId.get(id);

/** 単位の数を文字にする (例: unitText('茶碗{n}杯', 2) → 茶碗2杯) */
export const unitText = (label: string, count: number): string => label.replace('{n}', String(count));
