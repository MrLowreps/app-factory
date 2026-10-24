// Cloudflare Workers AI。無料枠 (1日 10,000 Neurons) があり、入力・出力を学習に使わない。API キーは不要で env.AI バインディングを使う。
import { z } from 'zod';
import { DishSchema, MEAL_SLOTS } from '../../src/domain/menu';
import { buildUserPrompt, SYSTEM_PROMPT } from '../prompt';
import { GenerationError, type MenuGenerator } from './types';

const DEFAULT_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
// モデルには「1食2品以上」を求める (画面側の検査は1品以上で通す)。$schema などのメタ情報は外す
const DraftSchema = z.object({
  meals: z.array(z.object({ slot: z.enum(MEAL_SLOTS), dishes: z.array(DishSchema).min(2).max(4) })).length(3),
});
const { $schema: _meta, ...JSON_SCHEMA } = z.toJSONSchema(DraftSchema);

// JSON モードが効かないモデルでも形がそろうよう、文章でも形を伝える
const JSON_RULE = `- 次の形の JSON だけを返す。説明文は書かない
{"meals":[{"slot":"breakfast","dishes":[{"name":"料理名","ingredients":[{"foodId":"egg","grams":100}],"steps":["手順"],"minutes":10}]},{"slot":"lunch","dishes":[...]},{"slot":"dinner","dishes":[...]}]}`;

export const generateWithWorkersAi: MenuGenerator = async (req, env) => {
  if (!env.AI) throw new GenerationError('not_configured', 'missing AI binding');
  const result = (await env.AI.run(env.AI_MODEL || DEFAULT_MODEL, {
    messages: [
      { role: 'system', content: `${SYSTEM_PROMPT}\n${JSON_RULE}` },
      { role: 'user', content: buildUserPrompt(req) },
    ],
    response_format: { type: 'json_schema', json_schema: JSON_SCHEMA },
    max_tokens: 4096,
    temperature: 0.4,
  })) as { response?: unknown };
  // JSON モードではオブジェクトで返るが、文字列のこともある (normalizePlan が両方扱う)
  return result.response;
};
