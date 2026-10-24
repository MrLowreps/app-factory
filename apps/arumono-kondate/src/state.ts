// アプリ全体の状態。すべて端末内に保存し、サーバーには送らない。
import { createContext, useContext } from 'react';
import type { MenuPlan } from './domain/menu';
import { DEFAULT_TARGETS, type Profile, type Targets } from './domain/targets';
import { useStored } from './lib/storage';

export interface SavedPlan {
  plan: MenuPlan;
  createdAt: string;
}

export interface Usage {
  date: string;
  count: number;
}

export const today = () => new Date().toLocaleDateString('sv-SE');

export function useAppStateValue() {
  const [onboarded, setOnboarded] = useStored('onboarded', false);
  const [profile, setProfile] = useStored<Profile | null>('profile', null);
  const [targets, setTargets] = useStored<Targets>('targets', DEFAULT_TARGETS);
  const [pantry, setPantry] = useStored<string[]>('pantry', []);
  const [dislikes, setDislikes] = useStored<string[]>('dislikes', []);
  const [staplesOnHand, setStaplesOnHand] = useStored('staplesOnHand', true);
  const [saved, setSaved] = useStored<SavedPlan | null>('plan', null);
  const [checked, setChecked] = useStored<string[]>('shoppingChecked', []);
  const [usage, setUsage] = useStored<Usage>('usage', { date: today(), count: 0 });

  const usedToday = usage.date === today() ? usage.count : 0;

  return {
    onboarded,
    setOnboarded,
    profile,
    setProfile,
    targets,
    setTargets,
    pantry,
    setPantry,
    dislikes,
    setDislikes,
    staplesOnHand,
    setStaplesOnHand,
    saved,
    setSaved,
    checked,
    setChecked,
    usedToday,
    countUsage: () => setUsage({ date: today(), count: usedToday + 1 }),
  };
}

export type AppState = ReturnType<typeof useAppStateValue>;

export const AppStateContext = createContext<AppState | null>(null);

export function useAppState(): AppState {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('AppStateContext がありません');
  return value;
}
