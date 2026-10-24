// AI_PROVIDER の値で事業者を選ぶ。新しい事業者はファイルを1つ足して、ここに登録する。
import { generateWithClaude } from './claude';
import type { MenuGenerator, ProviderEnv } from './types';
import { generateWithWorkersAi } from './workersAi';

export const PROVIDERS: Record<string, MenuGenerator> = {
  'workers-ai': generateWithWorkersAi,
  claude: generateWithClaude,
};

export function pickProvider(env: ProviderEnv): MenuGenerator {
  const provider = PROVIDERS[env.AI_PROVIDER || 'workers-ai'];
  if (!provider) throw new Error('unknown AI_PROVIDER');
  return provider;
}

export type { MenuGenerator, ProviderEnv } from './types';
