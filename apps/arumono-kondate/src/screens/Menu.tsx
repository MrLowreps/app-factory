// 献立: AI が作った1日分の献立と、目標に対する PFC。
import { useState } from 'react';
import { APP } from '../config';
import { getFood } from '../domain/foods';
import { dishNutrition, formatAmount, MEAL_LABEL, planNutrition, type Dish } from '../domain/menu';
import { buildShoppingList, isOwned } from '../domain/shopping';
import { menuErrorText, requestMenu } from '../lib/menuApi';
import { today, useAppState } from '../state';
import { CookedSheet } from './CookedSheet';
import { Icon } from '../ui/Icon';
import { formatPfc, MacroBars } from '../ui/MacroBars';
import { Sheet } from '../ui/Sheet';

export function Menu({ onGoFridge, onGoShopping }: { onGoFridge: () => void; onGoShopping: () => void }) {
  const app = useAppState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDish, setOpenDish] = useState<Dish | null>(null);
  const [cooked, setCooked] = useState<Dish | null>(null);

  const remaining = Math.max(0, APP.dailyMenuLimit - app.usedToday);
  const plan = app.saved?.plan;
  const total = plan ? planNutrition(plan) : null;
  const toBuy = plan ? buildShoppingList(plan, app.pantry, app.staplesOnHand) : [];

  const generate = async () => {
    if (remaining === 0 || loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await requestMenu({ targets: app.targets, pantry: app.pantry, dislikes: app.dislikes, staplesOnHand: app.staplesOnHand });
      app.setSaved({ plan: result, createdAt: new Date().toISOString() });
      app.setChecked([]);
      app.countUsage();
    } catch (err) {
      setError(menuErrorText(err));
    } finally {
      setLoading(false);
    }
  };

  const dateLabel = new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });

  return (
    <>
      <header className="screen-header">
        <div>
          <p className="eyebrow">{dateLabel}</p>
          <h1>今日の献立</h1>
        </div>
      </header>
      <main className="screen">
        <section className="card" aria-label="1日の目標">
          <div className="kcal-line">
            <h2 className="section-title">{total ? 'この献立の合計' : '1日の目標'}</h2>
            <p className="muted">
              {total ? (
                <>
                  <span className="kcal-value">{Math.round(total.kcal).toLocaleString()}</span> / {app.targets.kcal.toLocaleString()} kcal
                </>
              ) : (
                <>
                  <span className="kcal-value">{app.targets.kcal.toLocaleString()}</span> kcal
                </>
              )}
            </p>
          </div>
          <MacroBars actual={total ?? { kcal: 0, p: 0, f: 0, c: 0 }} targets={app.targets} />
        </section>

        {loading && (
          <div className="card loading" role="status">
            <div className="spinner" aria-hidden="true" />
            <p>冷蔵庫の食材から献立を考えています…</p>
            <p className="muted small">10〜20秒ほどかかります</p>
          </div>
        )}

        {error && !loading && <p className="notice notice-strong">{error}</p>}

        {!plan && !loading && (
          <div className="card empty">
            <Icon name="bowl" className="empty-icon" />
            <h2 className="section-title">{app.pantry.length ? `${app.pantry.length}品の食材が選ばれています` : 'まずは冷蔵庫の食材を選びましょう'}</h2>
            <p className="muted">家にある食材と目標から、AIが朝・昼・夜の献立を考えます。</p>
            {app.pantry.length ? (
              <button type="button" className="button button-block button-large" onClick={generate} disabled={remaining === 0}>
                <Icon name="sparkle" />
                献立を考える
              </button>
            ) : (
              <button type="button" className="button button-block button-large" onClick={onGoFridge}>
                冷蔵庫の食材を選ぶ
              </button>
            )}
          </div>
        )}

        {plan && !loading &&
          plan.meals.map((meal) => (
            <section className="meal" key={meal.slot}>
              <h2 className="section-title">{MEAL_LABEL[meal.slot]}</h2>
              <div className="card card-flush">
                {meal.dishes.map((dish, i) => {
                  const n = dishNutrition(dish);
                  const used = dish.ingredients.filter((x) => app.pantry.includes(x.foodId)).length;
                  return (
                    <button type="button" className="dish" key={`${dish.name}-${i}`} onClick={() => setOpenDish(dish)}>
                      <span className="dish-main">
                        <span className="dish-name">{dish.name}</span>
                        <span className="muted small">
                          {Math.round(n.kcal)} kcal · {formatPfc(n)} · {dish.minutes}分
                        </span>
                        {used > 0 && (
                          <span>
                            <span className="badge">残り物{used}品を使用</span>
                          </span>
                        )}
                      </span>
                      <Icon name="chevron" className="chevron" />
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

        {plan && !loading && (
          <div className="stack">
            {toBuy.length > 0 && (
              <button type="button" className="button button-block" onClick={onGoShopping}>
                <Icon name="cart" />
                買い足すもの {toBuy.length}品を見る
              </button>
            )}
            <button type="button" className="button button-secondary button-block" onClick={generate} disabled={remaining === 0}>
              別の献立を考える
            </button>
            <p className="muted small center">
              {remaining > 0 ? `今日はあと${remaining}回 献立を作れます` : '今日の献立づくりは終わりです。また明日どうぞ'}
            </p>
          </div>
        )}
        <p className="muted small">栄養の数値は食品成分表をもとにした目安です。</p>
      </main>

      {openDish && (
        <Sheet title={openDish.name} onClose={() => setOpenDish(null)}>
          <DishDetail
            dish={openDish}
            pantry={app.pantry}
            staplesOnHand={app.staplesOnHand}
            onCooked={() => {
              setCooked(openDish);
              setOpenDish(null);
            }}
          />
        </Sheet>
      )}
      {cooked && <CookedSheet dish={cooked} date={today()} onClose={() => setCooked(null)} />}
    </>
  );
}

function DishDetail({ dish, pantry, staplesOnHand, onCooked }: { dish: Dish; pantry: string[]; staplesOnHand: boolean; onCooked: () => void }) {
  const n = dishNutrition(dish);
  return (
    <>
      <p className="muted">
        {Math.round(n.kcal)} kcal · {formatPfc(n)} · 約{dish.minutes}分
      </p>
      <section className="section">
        <h3 className="section-title">材料（1人分）</h3>
        <ul className="ingredients">
          {dish.ingredients.map(({ foodId, grams }) => (
            <li className="ingredient" key={foodId}>
              <span>{getFood(foodId)?.name ?? foodId}</span>
              <span className="row">
                <span className="muted">{formatAmount(foodId, grams)}</span>
                {isOwned(foodId, pantry, staplesOnHand) ? <span className="tag-have">家にある</span> : <span className="tag-buy">買う</span>}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="section">
        <h3 className="section-title">作り方</h3>
        <ol className="steps">
          {dish.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </section>
      <button type="button" className="button button-block button-large" onClick={onCooked}>
        <Icon name="check" />
        作った！
      </button>
    </>
  );
}
