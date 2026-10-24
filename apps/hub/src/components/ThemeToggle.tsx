import { useEffect, useState } from 'react';

type Mode = 'system' | 'light' | 'dark';
const NEXT: Record<Mode, Mode> = { system: 'light', light: 'dark', dark: 'system' };
const LABEL: Record<Mode, string> = { system: '自動', light: 'ライト', dark: 'ダーク' };

const read = (): Mode => {
  try {
    const v = localStorage.getItem('theme');
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
};

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>(read);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', mode);
    try {
      if (mode === 'system') localStorage.removeItem('theme');
      else localStorage.setItem('theme', mode);
    } catch {
      // 保存できない環境でも表示は切り替わる
    }
  }, [mode]);

  return (
    <button type="button" className="theme-toggle" onClick={() => setMode(NEXT[mode])}>
      テーマ: {LABEL[mode]}
    </button>
  );
}
