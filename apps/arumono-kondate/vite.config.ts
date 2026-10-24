import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// 開発サーバーでも /api/menu を動かす。AI_PROVIDER=claude と ANTHROPIC_API_KEY があれば本物の AI、なければ開発用の献立を返す。
// (Workers AI はローカルの Node から呼べないので、確認は Cloudflare のプレビュー環境で行う)
const devApi = (): Plugin => ({
  name: 'dev-api',
  configureServer(server) {
    server.middlewares.use('/api/menu', async (req, res) => {
      const { handleMenu } = await server.ssrLoadModule('/worker/menu.ts');
      const { pickProvider } = await server.ssrLoadModule('/worker/providers/index.ts');
      const { mockMenu } = await server.ssrLoadModule('/worker/mock.ts');
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(chunk as Buffer);
      const request = new Request(`http://localhost${req.url ?? ''}`, {
        method: req.method,
        headers: { 'content-type': req.headers['content-type'] ?? '' },
        body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
      });
      const env = { AI_PROVIDER: process.env.AI_PROVIDER, AI_MODEL: process.env.AI_MODEL, ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY, MENU_DAILY_LIMIT: '100' };
      const useReal = env.AI_PROVIDER === 'claude' && env.ANTHROPIC_API_KEY;
      const response: Response = await handleMenu(request, env, useReal ? pickProvider(env) : async (r: unknown) => mockMenu(r));
      res.statusCode = response.status;
      response.headers.forEach((value, key) => res.setHeader(key, value));
      res.end(await response.text());
    });
  },
});

export default defineConfig({
  plugins: [react(), devApi()],
});
