// POST /api/menu の処理。入力と AI の返答はどちらもスキーマで検査する。
// 送信内容 (食材や目標) はログに残さない。
import { z } from 'zod';
import { MenuPlanSchema, MenuRequestSchema, type MenuPlan, type MenuRequest } from '../src/domain/menu';
import { fitToTargets } from '../src/domain/balance';
import { normalizePlan } from './normalize';
import { GenerationError, pickProvider, type FailureReason, type MenuGenerator, type ProviderEnv } from './providers';
import { consume, type RateLimitStore } from './rateLimit';

export interface MenuEnv extends ProviderEnv {
  RATE_LIMIT?: RateLimitStore;
  /** 1つの接続元から1日に作れる献立の数 */
  MENU_DAILY_LIMIT?: string;
}

const MAX_BODY_BYTES = 8 * 1024;
/** 返答の形が崩れたときに1回だけやり直す */
const MAX_ATTEMPTS = 2;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export async function handleMenu(request: Request, env: MenuEnv, generate?: MenuGenerator): Promise<Response> {
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

  let reason: FailureReason = 'ai_error';
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return json(await generatePlan(parsed, env, generate));
    } catch (err) {
      reason = err instanceof GenerationError ? err.reason : 'ai_error';
      // 中身は残さず、原因の種類と場所だけをログに出す
      console.error('menu generation failed', { attempt, reason, detail: describe(err) });
      if (reason === 'not_configured') break;
    }
  }
  return json({ error: 'generation_failed', reason }, 502);
}

async function generatePlan(req: MenuRequest, env: MenuEnv, generate?: MenuGenerator): Promise<MenuPlan> {
  let raw: unknown;
  try {
    raw = await (generate ?? pickProvider(env))(req, env);
  } catch (err) {
    throw err instanceof GenerationError ? err : new GenerationError('ai_error', describe(err));
  }
  try {
    return fitToTargets(MenuPlanSchema.parse(normalizePlan(raw)), req.targets);
  } catch (err) {
    throw new GenerationError('invalid_output', describe(err));
  }
}

function describe(err: unknown): string {
  if (err instanceof GenerationError) return err.message;
  if (err instanceof z.ZodError) return err.issues.map((i) => `${i.path.join('.')}:${i.code}`).slice(0, 5).join(', ');
  if (err instanceof Error) return `${err.name}: ${err.message}`.slice(0, 200);
  return 'unknown';
}
