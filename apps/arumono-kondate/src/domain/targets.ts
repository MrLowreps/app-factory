// 目標カロリーと PFC の計算。AI は使わず、計算式だけで出す。
import { getFood, unitText } from './foods';

export type Goal = 'lose' | 'gain' | 'maintain';
export type Sex = 'male' | 'female' | 'other';
export type Activity = 'desk' | 'standing' | 'workout' | 'athlete';
export type Pace = 'slow' | 'normal';

export interface Profile {
  goal: Goal;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  pace: Pace;
}

export interface Targets {
  kcal: number;
  p: number;
  f: number;
  c: number;
}

export const GOAL_LABEL: Record<Goal, string> = {
  lose: 'やせたい',
  gain: '筋肉をつけたい',
  maintain: '今の体型で健康的に',
};

export const ACTIVITY_LABEL: Record<Activity, { title: string; detail: string }> = {
  desk: { title: 'デスクワーク中心', detail: '運動はほとんどしない' },
  standing: { title: '立ち仕事・よく歩く', detail: '通勤や家事でよく動く' },
  workout: { title: '週に数回 運動する', detail: '筋トレやジョギングなど' },
  athlete: { title: 'ほぼ毎日しっかり運動', detail: '部活やハードなトレーニング' },
};

export const PACE_LABEL: Record<Pace, string> = { slow: 'ゆっくり', normal: 'ふつう' };

const ACTIVITY_FACTOR: Record<Activity, number> = { desk: 1.2, standing: 1.375, workout: 1.55, athlete: 1.725 };
const KCAL_ADJUST: Record<Goal, Record<Pace, number>> = {
  lose: { slow: -0.1, normal: -0.2 },
  gain: { slow: 0.05, normal: 0.1 },
  maintain: { slow: 0, normal: 0 },
};
/** 体重 1kg あたりのたんぱく質 (g) */
const PROTEIN_PER_KG: Record<Goal, Record<Pace, number>> = {
  lose: { slow: 1.6, normal: 2.0 },
  gain: { slow: 1.8, normal: 2.0 },
  maintain: { slow: 1.2, normal: 1.2 },
};
const FAT_RATIO = 0.25;
/** 目標カロリーの下限。極端な食事制限にならないようにする */
const KCAL_FLOOR = 1200;

/** 基礎代謝 (Mifflin-St Jeor 式) */
export function basalMetabolism({ sex, age, heightCm, weightKg }: Profile): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const sexTerm = sex === 'male' ? 5 : sex === 'female' ? -161 : -78;
  return base + sexTerm;
}

export function calcTargets(profile: Profile): Targets {
  const bmr = basalMetabolism(profile);
  const tdee = bmr * ACTIVITY_FACTOR[profile.activity];
  const raw = tdee * (1 + KCAL_ADJUST[profile.goal][profile.pace]);
  const kcal = roundTo(Math.max(raw, bmr, KCAL_FLOOR), 10);
  const p = Math.round(Math.min(profile.weightKg * PROTEIN_PER_KG[profile.goal][profile.pace], (kcal * 0.35) / 4));
  const f = Math.round((kcal * FAT_RATIO) / 9);
  const c = Math.max(0, Math.round((kcal - p * 4 - f * 9) / 4));
  return { kcal, p, f, c };
}

/** 一般的な目安。目標設定を飛ばした人向け */
export const DEFAULT_TARGETS: Targets = { kcal: 2000, p: 75, f: 55, c: 300 };

/** 目標の算出理由を、専門用語を使わずに説明する文 */
export function explainTargets(profile: Profile, targets: Targets): string[] {
  const bmr = Math.round(basalMetabolism(profile));
  const lines = [
    `じっとしていても体が使うエネルギーは、1日 約${bmr.toLocaleString()}kcal です（身長・体重・年齢から計算）。`,
    `普段の動き「${ACTIVITY_LABEL[profile.activity].title}」を足すと、1日に使うエネルギーは約${roundTo(bmr * ACTIVITY_FACTOR[profile.activity], 10).toLocaleString()}kcal です。`,
  ];
  if (profile.goal === 'lose') lines.push(`やせるために、そこから${profile.pace === 'slow' ? '1割' : '2割'}ほど控えめにしています。体を支えるのに必要な量より下げすぎないようにしています。`);
  if (profile.goal === 'gain') lines.push(`筋肉をつけるために、少し多めにしています。`);
  lines.push(`たんぱく質は体重1kgあたり約${(targets.p / profile.weightKg).toFixed(1)}gを目安にしています。脂質は全体の約4分の1、残りを炭水化物にしています。`);
  return lines;
}

/** たんぱく質の量を身近な食品に置き換えた一言 */
export function proteinHint(proteinG: number): string {
  const chicken = getFood('chicken-breast');
  if (!chicken?.unit) return '';
  const perUnit = (chicken.p * chicken.unit.grams) / 100;
  const count = Math.round((proteinG / perUnit) * 2) / 2;
  return `鶏むね肉なら約${unitText(chicken.unit.label, count)}分（${unitText(chicken.unit.label, 1)} 約${chicken.unit.grams}g）`;
}

export function needsDoctorNotice(profile: Profile): boolean {
  return profile.age < 18;
}

const roundTo = (n: number, step: number) => Math.round(n / step) * step;
