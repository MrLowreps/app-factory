// 設定: 目標の見直し、苦手な食材、テーマ、データの削除。
import { useState } from 'react';
import { APP } from '../config';
import { FOODS } from '../domain/foods';
import { idbClear } from '../lib/idb';
import { clearAll } from '../lib/storage';
import { useAppState } from '../state';
import { FoodChips } from '../ui/FoodChips';
import { Icon } from '../ui/Icon';
import { Sheet } from '../ui/Sheet';
import { useToast } from '../ui/Toast';
import { TargetEditor } from './Onboarding';

type Theme = 'system' | 'light' | 'dark';
const THEME_LABEL: Record<Theme, string> = { system: '自動', light: 'ライト', dark: 'ダーク' };

export function readTheme(): Theme {
  try {
    const v = localStorage.getItem('theme');
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
  try {
    if (theme === 'system') localStorage.removeItem('theme');
    else localStorage.setItem('theme', theme);
  } catch {
    // 保存できなくても表示は切り替わる
  }
}

export function Settings({ onClose, onRedoGoal }: { onClose: () => void; onRedoGoal: () => void }) {
  const app = useAppState();
  const toast = useToast();
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [editing, setEditing] = useState(false);
  const [dislikeOpen, setDislikeOpen] = useState(false);

  const reset = async () => {
    if (!window.confirm('目標・食材・献立・記録をすべて削除します。元に戻せません。よろしいですか？')) return;
    clearAll();
    await idbClear().catch(() => undefined);
    window.location.reload();
  };

  return (
    <Sheet title="設定" onClose={onClose}>
      <section className="section">
        <h3 className="section-title">1日の目標</h3>
        <p className="muted">
          {app.targets.kcal.toLocaleString()} kcal · たんぱく質{app.targets.p}g · 脂質{app.targets.f}g · 炭水化物{app.targets.c}g
        </p>
        {editing ? (
          <TargetEditor value={app.targets} onChange={app.setTargets} />
        ) : (
          <div className="stack stack-tight">
            <button type="button" className="button button-secondary button-block" onClick={onRedoGoal}>
              質問に答えて見直す
            </button>
            <button type="button" className="button button-ghost button-block" onClick={() => setEditing(true)}>
              数値を直接変える
            </button>
          </div>
        )}
      </section>

      <section className="section">
        <h3 className="section-title">苦手な食材</h3>
        <p className="muted small">選んだ食材は献立に使いません。{app.dislikes.length > 0 && `（${app.dislikes.length}品）`}</p>
        {dislikeOpen ? (
          <FoodChips
            foods={FOODS.filter((f) => !f.staple)}
            selected={app.dislikes}
            onToggle={(id) => app.setDislikes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))}
          />
        ) : (
          <button type="button" className="button button-secondary button-block" onClick={() => setDislikeOpen(true)}>
            苦手な食材を選ぶ
          </button>
        )}
      </section>

      <label className="switch-row">
        <span>
          <span className="field-label">基本の調味料は家にある</span>
          <br />
          <span className="muted small">しょうゆ・みそ・砂糖・塩・油など</span>
        </span>
        <input className="switch" type="checkbox" checked={app.staplesOnHand} onChange={(e) => app.setStaplesOnHand(e.target.checked)} />
      </label>

      <div className="field">
        <span className="field-label" id="theme-label">
          画面の明るさ
        </span>
        <div className="segmented" role="group" aria-labelledby="theme-label">
          {(Object.keys(THEME_LABEL) as Theme[]).map((t) => (
            <button
              key={t}
              type="button"
              className="segment"
              aria-pressed={theme === t}
              onClick={() => {
                setTheme(t);
                applyTheme(t);
              }}
            >
              {THEME_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      <section className="section">
        <h3 className="section-title">データとプライバシー</h3>
        <p className="muted small">
          身長・体重などの入力内容、食材、記録、写真はこのスマホの中だけに保存されます。献立を作るときは、目標の数値と食材名だけをAIに送ります。
        </p>
        <button
          type="button"
          className="button button-danger button-block"
          onClick={() => {
            reset().catch(() => toast('削除できませんでした'));
          }}
        >
          <Icon name="trash" />
          すべてのデータを削除
        </button>
      </section>

      <p className="muted small">
        {APP.name}の栄養の数値は目安です。医療・栄養指導の代わりにはなりません。
      </p>
    </Sheet>
  );
}
