// Claude API (有料)。品質を上げたいときに AI_PROVIDER=claude と ANTHROPIC_API_KEY で切り替える。
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { MenuPlanSchema } from '../../src/domain/menu';
import { buildUserPrompt, SYSTEM_PROMPT } from '../prompt';
import type { MenuGenerator } from './types';

const DEFAULT_MODEL = 'claude-haiku-5-5';

export const generateWithClaude: MenuGenerator = async (req, env) => {
  if (!env.ANTHROPIC_API_KEY) throw new Error('missing api key');
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 1, timeout: 60_000 });
  const response = await client.messages.parse({
    model: env.AI_MODEL || DEFAULT_MODEL,
    max_tokens: 8000,
    output_config: { effort: 'low', format: zodOutputFormat(MenuPlanSchema) },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(req) }],
  });
  if (response.stop_reason !== 'end_turn' || !response.parsed_output) throw new Error(`unexpected stop: ${response.stop_reason}`);
  return response.parsed_output;
};
