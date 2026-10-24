// AI 事業者の差し替え口。どの事業者も「献立リクエストを受けて、献立らしき JSON を返す」だけを担当する。
// 返り値は handleMenu 側で必ず MenuPlanSchema で検査するので、ここでは unknown のままでよい。
import type { MenuRequest } from '../../src/domain/menu';

export interface ProviderEnv {
  /** 使う事業者。未設定なら workers-ai */
  AI_PROVIDER?: string;
  /** 事業者ごとの既定モデルを上書きしたいときに指定する */
  AI_MODEL?: string;
  /** Cloudflare Workers AI のバインディング (Pages の設定で追加する) */
  AI?: { run(model: string, input: unknown): Promise<unknown> };
  ANTHROPIC_API_KEY?: string;
}

export type MenuGenerator = (req: MenuRequest, env: ProviderEnv) => Promise<unknown>;

/** 失敗の種類。中身 (食材や目標) は含めず、原因の切り分けにだけ使う */
export type FailureReason = 'not_configured' | 'ai_error' | 'invalid_output';

export class GenerationError extends Error {
  constructor(readonly reason: FailureReason, detail?: string) {
    super(detail ?? reason);
  }
}
