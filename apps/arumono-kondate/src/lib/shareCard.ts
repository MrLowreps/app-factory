// SNS 共有用の画像カードを作る。写真は canvas に描き直すので、位置情報などの付属データは含まれない。
// 色と書体はデザイントークン (CSS 変数) から読むので、テーマを変えればカードも追従する。
import { APP } from '../config';
import type { Nutrition } from '../domain/menu';
import { toBlob } from './image';

const W = 1080;
const H = 1350;
const PHOTO_H = 810;
const PAD = 72;

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export async function renderShareCard(opts: { title: string; nutrition: Nutrition; photo?: Blob; date: string }): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const font = token('--font-family-base') || 'sans-serif';
  await document.fonts?.ready;

  ctx.fillStyle = token('--color-surface');
  ctx.fillRect(0, 0, W, H);

  if (opts.photo) {
    const bitmap = await createImageBitmap(opts.photo);
    const scale = Math.max(W / bitmap.width, PHOTO_H / bitmap.height);
    const sw = W / scale;
    const sh = PHOTO_H / scale;
    ctx.drawImage(bitmap, (bitmap.width - sw) / 2, (bitmap.height - sh) / 2, sw, sh, 0, 0, W, PHOTO_H);
    bitmap.close();
  } else {
    ctx.fillStyle = token('--color-primary-soft');
    ctx.fillRect(0, 0, W, PHOTO_H);
    ctx.fillStyle = token('--color-primary');
    ctx.font = `700 64px ${font}`;
    ctx.textAlign = 'center';
    ctx.fillText('ごちそうさまでした', W / 2, PHOTO_H / 2 + 20);
    ctx.textAlign = 'left';
  }

  let y = PHOTO_H + PAD + 8;
  ctx.fillStyle = token('--color-text');
  ctx.font = `700 56px ${font}`;
  ctx.fillText(fit(ctx, opts.title, W - PAD * 2), PAD, y);

  y += 84;
  ctx.font = `700 72px ${font}`;
  const kcal = `${Math.round(opts.nutrition.kcal).toLocaleString()}`;
  ctx.fillText(kcal, PAD, y);
  const kcalW = ctx.measureText(kcal).width;
  ctx.font = `500 36px ${font}`;
  ctx.fillStyle = token('--color-text-muted');
  ctx.fillText('kcal', PAD + kcalW + 12, y);

  y += 72;
  const macros: [string, string, number][] = [
    ['たんぱく質', '--color-macro-protein', opts.nutrition.p],
    ['脂質', '--color-macro-fat', opts.nutrition.f],
    ['炭水化物', '--color-macro-carb', opts.nutrition.c],
  ];
  let x = PAD;
  for (const [label, color, grams] of macros) {
    ctx.fillStyle = token(color);
    ctx.beginPath();
    ctx.arc(x + 14, y - 12, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = token('--color-text');
    ctx.font = `500 34px ${font}`;
    const text = `${label} ${Math.round(grams)}g`;
    ctx.fillText(text, x + 40, y);
    x += 40 + ctx.measureText(text).width + 48;
  }

  ctx.fillStyle = token('--color-primary');
  ctx.font = `700 34px ${font}`;
  ctx.fillText(APP.name, PAD, H - PAD + 8);
  ctx.fillStyle = token('--color-text-muted');
  ctx.font = `400 30px ${font}`;
  ctx.textAlign = 'right';
  ctx.fillText(new Date(`${opts.date}T00:00:00`).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }), W - PAD, H - PAD + 8);

  const blob = await toBlob(canvas, 'image/png');
  return new File([blob], `${APP.name}-${opts.date}.png`, { type: 'image/png' });
}

function fit(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1);
  return `${t}…`;
}
