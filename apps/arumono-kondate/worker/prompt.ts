// 献立生成のプロンプト。体の情報 (身長・体重など) は含めず、目標の数値と食材名だけを渡す。
import { FOODS, getFood } from '../src/domain/foods';
import type { MenuRequest } from '../src/domain/menu';

export const SYSTEM_PROMPT = `あなたは日本の家庭料理に詳しい管理栄養士です。
利用者の目標カロリーとPFC（たんぱく質・脂質・炭水化物）に近づく、1日分（朝・昼・夜）の献立を考えます。

ルール:
- 各食事は2〜3品にする。主食（ごはん・パン・麺など）と、たんぱく質の多い主菜を必ず入れ、副菜か汁物を添える
- 「家にある食材」をできるだけ使い切る方向で考える。足りない食材は少なめに追加してよい
- 食材は必ず「使える食材一覧」の id から選び、分量はグラムで書く
- 「苦手な食材」は使わない
- 食材一覧の栄養値（100gあたり）を使って分量を計算し、1日の合計が目標カロリーの±10%、各PFCが目標の±15%に収まるようにする
- 1日の配分は、朝ごはん25%・昼ごはん35%・夜ごはん40%を目安にする
- 家庭で30分以内に作れる、簡単で現実的な料理にする
- 手順は短く、1品あたり最大6ステップ
- 料理名と手順は自然な日本語で書く`;

export function buildUserPrompt(req: MenuRequest): string {
  const names = (ids: string[]) => ids.map((id) => getFood(id)?.name).filter(Boolean).join('、') || 'なし';
  const catalog = FOODS.map((f) => `${f.id}: ${f.name} (${f.kcal}kcal P${f.p} F${f.f} C${f.c})`).join('\n');
  return `目標（1日）: ${req.targets.kcal}kcal / たんぱく質${req.targets.p}g / 脂質${req.targets.f}g / 炭水化物${req.targets.c}g
家にある食材: ${names(req.pantry)}
${req.staplesOnHand ? '基本の調味料と油（しょうゆ・みそ・砂糖・塩・みりん・油など）は家にある。' : '調味料も買い足しが必要な場合がある。'}
苦手な食材: ${names(req.dislikes)}

使える食材一覧（id: 名前 (100gあたりの栄養)）:
${catalog}`;
}
