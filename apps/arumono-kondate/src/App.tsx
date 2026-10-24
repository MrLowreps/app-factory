import { useState } from 'react';
import { buildShoppingList } from './domain/shopping';
import { Fridge } from './screens/Fridge';
import { Menu } from './screens/Menu';
import { Onboarding } from './screens/Onboarding';
import { Records } from './screens/Records';
import { Settings } from './screens/Settings';
import { Shopping } from './screens/Shopping';
import { AppStateContext, useAppState, useAppStateValue } from './state';
import { Icon, type IconName } from './ui/Icon';
import { ToastProvider } from './ui/Toast';

type Tab = 'menu' | 'fridge' | 'records' | 'shopping';
const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'menu', label: '献立', icon: 'menu' },
  { id: 'fridge', label: '冷蔵庫', icon: 'fridge' },
  { id: 'records', label: '記録', icon: 'records' },
  { id: 'shopping', label: '買い物', icon: 'cart' },
];

export function App() {
  const state = useAppStateValue();
  return (
    <AppStateContext.Provider value={state}>
      <ToastProvider>
        <Main />
      </ToastProvider>
    </AppStateContext.Provider>
  );
}

function Main() {
  const app = useAppState();
  const [tab, setTab] = useState<Tab>(app.pantry.length ? 'menu' : 'fridge');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [redoGoal, setRedoGoal] = useState(false);

  if (!app.onboarded || redoGoal) {
    return <Onboarding startAt={redoGoal ? 'goal' : 'welcome'} onDone={() => setRedoGoal(false)} />;
  }

  const go = (next: Tab) => {
    setTab(next);
    window.scrollTo({ top: 0 });
  };
  const shoppingLeft = app.saved
    ? buildShoppingList(app.saved.plan, app.pantry, app.staplesOnHand).filter((i) => !app.checked.includes(i.foodId)).length
    : 0;

  return (
    <div className="shell">
      <div className="settings-button">
        <button type="button" className="icon-button" onClick={() => setSettingsOpen(true)} aria-label="設定">
          <Icon name="settings" />
        </button>
      </div>
      {tab === 'menu' && <Menu onGoFridge={() => go('fridge')} onGoShopping={() => go('shopping')} />}
      {tab === 'fridge' && <Fridge onMakeMenu={() => go('menu')} />}
      {tab === 'records' && <Records />}
      {tab === 'shopping' && <Shopping onGoMenu={() => go('menu')} />}

      <nav className="tabbar" aria-label="メイン">
        <div className="tabbar-inner">
          {TABS.map((t) => (
            <button key={t.id} type="button" className="tab" aria-current={tab === t.id ? 'page' : undefined} onClick={() => go(t.id)}>
              <Icon name={t.icon} />
              {t.label}
              {t.id === 'shopping' && shoppingLeft > 0 && <span className="tab-count">{shoppingLeft}</span>}
            </button>
          ))}
        </div>
      </nav>

      {settingsOpen && (
        <Settings
          onClose={() => setSettingsOpen(false)}
          onRedoGoal={() => {
            setSettingsOpen(false);
            setRedoGoal(true);
          }}
        />
      )}
    </div>
  );
}
