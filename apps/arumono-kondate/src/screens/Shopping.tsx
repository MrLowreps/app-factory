// 買い物リスト: 献立に足りない食材。カレンダー登録と共有で買い出しを忘れないようにする。
import { useState } from 'react';
import { APP } from '../config';
import { getFood } from '../domain/foods';
import { formatAmount } from '../domain/menu';
import { buildShoppingIcs, buildShoppingList } from '../domain/shopping';
import { download, shareText } from '../lib/share';
import { useAppState } from '../state';
import { Icon } from '../ui/Icon';
import { Sheet } from '../ui/Sheet';
import { useToast } from '../ui/Toast';

export function Shopping({ onGoMenu }: { onGoMenu: () => void }) {
  const app = useAppState();
  const toast = useToast();
  const [scheduling, setScheduling] = useState(false);
  const items = app.saved ? buildShoppingList(app.saved.plan, app.pantry, app.staplesOnHand) : [];
  const lines = items.map(({ foodId, grams }) => `・${getFood(foodId)?.name ?? foodId} ${formatAmount(foodId, grams)}`);
  const left = items.filter((i) => !app.checked.includes(i.foodId)).length;

  const toggle = (id: string) => app.setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const share = async () => {
    const result = await shareText(`買い物リスト（${APP.name}）\n${lines.join('\n')}`);
    if (result === 'copied') toast('リストをコピーしました');
  };

  return (
    <>
      <header className="screen-header">
        <div>
          <p className="eyebrow">献立に足りないもの</p>
          <h1>買い物リスト</h1>
        </div>
        {items.length > 0 && <p className="muted">残り {left}品</p>}
      </header>
      <main className="screen">
        {items.length === 0 ? (
          <div className="card empty">
            <Icon name="cart" className="empty-icon" />
            <h2 className="section-title">{app.saved ? '買い足すものはありません' : 'まだ献立がありません'}</h2>
            <p className="muted">{app.saved ? '家にある食材だけで作れます。' : '献立を作ると、足りない食材がここに並びます。'}</p>
            {!app.saved && (
              <button type="button" className="button button-block" onClick={onGoMenu}>
                献立へ
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="card card-flush">
              {items.map(({ foodId, grams }) => {
                const done = app.checked.includes(foodId);
                return (
                  <label className="check-row" key={foodId}>
                    <input type="checkbox" checked={done} onChange={() => toggle(foodId)} />
                    <span className={`grow ${done ? 'check-done' : ''}`}>{getFood(foodId)?.name ?? foodId}</span>
                    <span className="muted small">{formatAmount(foodId, grams)}</span>
                  </label>
                );
              })}
            </div>
            <div className="stack">
              <button type="button" className="button button-block" onClick={() => setScheduling(true)}>
                <Icon name="calendar" />
                買い出しをカレンダーに登録
              </button>
              <button type="button" className="button button-secondary button-block" onClick={share}>
                <Icon name="share" />
                LINEなどで送る
              </button>
            </div>
          </>
        )}
      </main>
      {scheduling && <ScheduleSheet lines={lines} onClose={() => setScheduling(false)} />}
    </>
  );
}

function ScheduleSheet({ lines, onClose }: { lines: string[]; onClose: () => void }) {
  const toast = useToast();
  const [when, setWhen] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() < 17 ? 18 : d.getHours() + 1, 0, 0, 0);
    return toLocalInput(d);
  });
  const add = () => {
    const ics = buildShoppingIcs(lines, new Date(when), APP.name);
    download(new Blob([ics], { type: 'text/calendar;charset=utf-8' }), 'kaidashi.ics');
    toast('カレンダーのファイルを開くと予定に追加できます');
    onClose();
  };
  return (
    <Sheet title="買い出しの予定" onClose={onClose}>
      <div className="field">
        <label className="field-label" htmlFor="shopping-when">
          いつ買い物に行きますか？
        </label>
        <input id="shopping-when" className="input" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
      </div>
      <p className="muted small">30分前にお知らせが出る予定を作ります。買い物リストも予定のメモに入ります。</p>
      <button type="button" className="button button-block button-large" onClick={add} disabled={!when}>
        カレンダーに追加
      </button>
    </Sheet>
  );
}

const toLocalInput = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
