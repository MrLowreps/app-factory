// Cloudflare Pages 用の _worker.js をビルドする (画面のビルドの後に実行し、dist に追加する)。
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    ssr: 'worker/index.ts',
    outDir: 'dist',
    emptyOutDir: false,
    target: 'es2022',
    rollupOptions: { output: { entryFileNames: '_worker.js', format: 'es' } },
  },
  ssr: { noExternal: true, target: 'webworker' },
});
