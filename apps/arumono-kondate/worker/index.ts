// Cloudflare Pages の _worker.js (advanced mode)。/api/* を処理し、それ以外は静的ファイルを返す。
// セキュリティヘッダーは public/_headers を唯一の元データとして、すべての応答に付ける。
import headersFile from '../public/_headers?raw';
import { handleMenu, type MenuEnv } from './menu';

interface Env extends MenuEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

const SECURITY_HEADERS = headersFile
  .split('\n')
  .map((line) => line.match(/^\s+([\w-]+):\s*(.+)$/))
  .filter((m): m is RegExpMatchArray => m !== null)
  .map((m) => [m[1], m[2].trim()] as const);

function withSecurityHeaders(response: Response): Response {
  const res = new Response(response.body, response);
  for (const [name, value] of SECURITY_HEADERS) if (!res.headers.has(name)) res.headers.set(name, value);
  return res;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/menu') return withSecurityHeaders(await handleMenu(request, env));
    if (pathname.startsWith('/api/')) return withSecurityHeaders(new Response('Not Found', { status: 404 }));
    return withSecurityHeaders(await env.ASSETS.fetch(request));
  },
};
