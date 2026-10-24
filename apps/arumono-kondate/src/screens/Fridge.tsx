// 冷蔵庫: 家にある食材をタップで選ぶ。
import { useMemo, useState } from 'react';
import { CATEGORY_LABEL, CATEGORY_ORDER, FOODS } from '../domain/foods';
import { useAppState } from '../state';
import { FoodChips } from '../ui/FoodChips';
import { Icon } from '../ui/Icon';

export function Fridge({ onMakeMenu }: { onMakeMenu: () => void }) {
  const app = useAppState();
  const [query, setQuery] = useState('');
  const foods = useMemo(
    () => FOODS.filter((f) => !f.staple && !app.dislikes.includes(f.id) && (!query || f.name.includes(query.trim()))),
    [query, app.dislikes],
  );
  const toggle = (id: string) => app.setPantry((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <>
      <header className="screen-header">
        <div>
          <p className="eyebrow">いま家にある食材</p>
          <h1>冷蔵庫</h1>
        </div>
        {app.pantry.length > 0 && (
          <button type="button" className="button button-ghost" onClick={() => app.setPantry([])}>
            すべて外す
          </button>
        )}
      </header>
      <main className="screen">
        <div className="search">
          <label className="visually-hidden" htmlFor="food-search">
            食材を探す
          </label>
          <div className="input-unit">
            <Icon name="search" />
            <input id="food-search" className="input" type="search" placeholder="食材を探す（例: 卵）" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
        {CATEGORY_ORDER.map((category) => {
          const items = foods.filter((f) => f.category === category);
          if (items.length === 0) return null;
          return (
            <section className="section" key={category}>
              <h2 className="section-title">{CATEGORY_LABEL[category]}</h2>
              <FoodChips foods={items} selected={app.pantry} onToggle={toggle} />
            </section>
          );
        })}
        {foods.length === 0 && <p className="muted">「{query}」に合う食材が見つかりませんでした。</p>}
        <p className="muted small">しょうゆ・みそ・油などの基本の調味料は、家にあるものとして考えます（設定で変えられます）。</p>
      </main>
      <div className="sticky-action">
        <div className="sticky-action-inner">
          <button type="button" className="button button-block button-large" onClick={onMakeMenu} disabled={app.pantry.length === 0}>
            <Icon name="sparkle" />
            {app.pantry.length > 0 ? `${app.pantry.length}品で献立を考える` : '食材を選んでください'}
          </button>
        </div>
      </div>
    </>
  );
}
