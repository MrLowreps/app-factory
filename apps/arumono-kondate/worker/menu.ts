// POST /api/menu の処理。入力と AI の返答はどちらもスキーマで検査する。
// 送信内容 (食材や目標) はログに残さない。
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { MenuPlanSchema, MenuRequestSchema, type MenuPlan, type MenuRequest } from '../src/domain/menu';
import { buildUserPrompt, SYSTEM_PROMPT } from './prompt';
import { consume, type RateLimitStore } from './rateLimit';

export interface MenuEnv {
  ANTHROPIC_API_KEY?: string;
  RATE_LIMIT?: RateLimitStore;
  /** 1つの接続元から1日に作れる献立の数 */
  MENU_DAILY_LIMIT?: string;
}

const MODEL = 'claude-haiku-5-5';
const MAX_BODY_BYTES = 8 * 1024;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export async function handleMenu(request: Request, env: MenuEnv, generate = generateWithClaude): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) return json({ error: 'bad_request' }, 400);

  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return json({ error: 'too_large' }, 413);

  let parsed: MenuRequest;
  try {
    parsed = MenuRequestSchema.parse(JSON.parse(text));
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const ip = request.headers.get('cf-connecting-ip') ?? 'local';
  const limit = Number(env.MENU_DAILY_LIMIT ?? 10);
  if (!(await consume(env.RATE_LIMIT, ip, limit))) return json({ error: 'rate_limited' }, 429);

  try {
    const plan = await generate(parsed, env);
    return json(MenuPlanSchema.parse(plan));
  } catch (err) {
    console.error('menu generation failed', err instanceof Error ? err.name : 'unknown');
    return json({ error: 'generation_failed' }, 502);
  }
}

export async function generateWithClaude(req: MenuRequest, env: MenuEnv): Promise<MenuPlan> {
  if (!env.ANTHROPIC_API_KEY) throw new Error('missing api key');
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 1, timeout: 60_000 });
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 8000,
    output_config: { effort: 'low', format: zodOutputFormat(MenuPlanSchema) },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(req) }],
  });
  if (response.stop_reason !== 'end_turn' || !response.parsed_output) throw new Error(`unexpected stop: ${response.stop_reason}`);
  return response.parsed_output;
}
