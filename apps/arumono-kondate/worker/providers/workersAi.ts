// Cloudflare Workers AI。無料枠 (1日 10,000 Neurons) があり、入力・出力を学習に使わない。API キーは不要で env.AI バインディングを使う。
import { z } from 'zod';
import { MenuPlanSchema } from '../../src/domain/menu';
import { buildUserPrompt, SYSTEM_PROMPT } from '../prompt';
import type { MenuGenerator } from './types';

const DEFAULT_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const JSON_SCHEMA = z.toJSONSchema(MenuPlanSchema);

export const generateWithWorkersAi: MenuGenerator = async (req, env) => {
  if (!env.AI) throw new Error('missing AI binding');
  const result = (await env.AI.run(env.AI_MODEL || DEFAULT_MODEL, {
    messages: [
      { role: 'system', content: `${SYSTEM_PROMPT}\n- 指定された JSON スキーマどおりの JSON だけを返す` },
      { role: 'user', content: buildUserPrompt(req) },
    ],
    response_format: { type: 'json_schema', json_schema: JSON_SCHEMA },
    max_tokens: 4096,
    temperature: 0.4,
  })) as { response?: unknown };
  // JSON モードではオブジェクトで返るが、モデルによっては文字列のこともある
  return typeof result.response === 'string' ? JSON.parse(result.response) : result.response;
};
