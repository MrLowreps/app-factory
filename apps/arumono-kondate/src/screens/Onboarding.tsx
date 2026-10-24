// はじめての目標設定。4つの質問に答えるだけで目標カロリーと PFC が決まる。
import { useState } from 'react';
import { APP } from '../config';
import {
  ACTIVITY_LABEL,
  calcTargets,
  DEFAULT_TARGETS,
  explainTargets,
  GOAL_LABEL,
  needsDoctorNotice,
  PACE_LABEL,
  proteinHint,
  type Activity,
  type Goal,
  type Pace,
  type Profile,
  type Sex,
  type Targets,
  withKcal,
  withMacro,
} from '../domain/targets';
import { useAppState } from '../state';
import { Icon, type IconName } from '../ui/Icon';
import { MACRO_META } from '../ui/MacroBars';

type Step = 'welcome' | 'goal' | 'body' | 'activity' | 'pace' | 'result';

const GOAL_ICON: Record<Goal, IconName> = { lose: 'scale', gain: 'muscle', maintain: 'leaf' };
const GOAL_DETAIL: Record<Goal, string> = {
  lose: '食べる量をほどよく控えて、体重を落とす',
  gain: 'たんぱく質をしっかりとって、体を大きくする',
  maintain: '今の体重のまま、バランスよく食べる',
};
const SEX_LABEL: Record<Sex, string> = { female: '女性', male: '男性', other: '答えない' };

const INITIAL: Profile = { goal: 'lose', sex: 'female', age: 30, heightCm: 160, weightKg: 55, activity: 'desk', pace: 'slow' };

export function Onboarding({ startAt = 'welcome', onDone }: { startAt?: Step; onDone: () => void }) {
  const app = useAppState();
  const [step, setStep] = useState<Step>(startAt);
  const [profile, setProfile] = useState<Profile>(app.profile ?? INITIAL);
  const update = (patch: Partial<Profile>) => setProfile((p) => ({ ...p, ...patch }));

  const steps: Step[] = ['goal', 'body', 'activity', ...(profile.goal === 'maintain' ? [] : (['pace'] as Step[])), 'result'];
  const index = steps.indexOf(step);
  const next = () => setStep(steps[index + 1] ?? 'result');
  const back = () => (index > 0 ? setStep(steps[index - 1]) : setStep('welcome'));

  const finish = (targets: Targets) => {
    app.setProfile(profile);
    app.setTargets(targets);
    app.setOnboarded(true);
    window.scrollTo({ top: 0 });
    onDone();
  };

  const skip = () => {
    app.setTargets(DEFAULT_TARGETS);
    app.setOnboarded(true);
    onDone();
  };

  if (step === 'welcome') {
    return (
      <div className="onboarding">
        <div className="welcome">
          <Icon name="bowl" className="welcome-art" />
          <h1 className="welcome-title">{APP.tagline}</h1>
          <p className="muted">
            かんたんな質問に答えるだけで、あなたに合った1日の目標を出します。1分ほどで終わります。
          </p>
        </div>
        <div className="onboarding-actions">
          <button type="button" className="button button-block button-large" onClick={() => setStep('goal')}>
            はじめる
          </button>
          <button type="button" className="button button-ghost button-block" onClick={skip}>
            あとで設定する
          </button>
        </div>
      </div>
    );
  }

  const progress = (index + 1) / steps.length;
  const canNext = step !== 'body' || isBodyValid(profile);

  return (
    <div className="onboarding">
      <div className="onboarding-top">
        <button type="button" className="icon-button" onClick={back} aria-label="戻る">
          <Icon name="back" />
        </button>
        <div className="progress" role="progressbar" aria-label="進み具合" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      <div className="onboarding-body">
        {step === 'goal' && (
          <>
            <h1 className="onboarding-title">いちばんの目的は？</h1>
            <div className="choices">
              {(Object.keys(GOAL_LABEL) as Goal[]).map((goal) => (
                <button
                  key={goal}
                  type="button"
                  className="choice"
                  aria-pressed={profile.goal === goal}
                  onClick={() => {
                    update({ goal });
                    setStep('body');
                  }}
                >
                  <span className="choice-art">
                    <Icon name={GOAL_ICON[goal]} />
                  </span>
                  <span className="stack stack-tight">
                    <span className="choice-title">{GOAL_LABEL[goal]}</span>
                    <span className="muted">{GOAL_DETAIL[goal]}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'body' && (
          <>
            <h1 className="onboarding-title">あなたの体のことを教えてください</h1>
            <div className="field">
              <span className="field-label" id="sex-label">
                性別
              </span>
              <div className="segmented" role="group" aria-labelledby="sex-label">
                {(Object.keys(SEX_LABEL) as Sex[]).map((sex) => (
                  <button key={sex} type="button" className="segment" aria-pressed={profile.sex === sex} onClick={() => update({ sex })}>
                    {SEX_LABEL[sex]}
                  </button>
                ))}
              </div>
            </div>
            <NumberField label="年齢" unit="歳" value={profile.age} min={10} max={100} step={1} onChange={(age) => update({ age })} />
            <NumberField label="身長" unit="cm" value={profile.heightCm} min={120} max={220} step={1} onChange={(heightCm) => update({ heightCm })} />
            <NumberField label="体重" unit="kg" value={profile.weightKg} min={30} max={200} step={0.5} onChange={(weightKg) => update({ weightKg })} />
            <p className="notice">入力した内容はこのスマホの中だけに保存され、外部には送信されません。</p>
          </>
        )}

        {step === 'activity' && (
          <>
            <h1 className="onboarding-title">ふだんの動き方は？</h1>
            <div className="choices">
              {(Object.keys(ACTIVITY_LABEL) as Activity[]).map((activity) => (
                <button
                  key={activity}
                  type="button"
                  className="choice"
                  aria-pressed={profile.activity === activity}
                  onClick={() => {
                    update({ activity });
                    next();
                  }}
                >
                  <span className="stack stack-tight">
                    <span className="choice-title">{ACTIVITY_LABEL[activity].title}</span>
                    <span className="muted">{ACTIVITY_LABEL[activity].detail}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'pace' && (
          <>
            <h1 className="onboarding-title">どのくらいのペースで進めますか？</h1>
            <div className="choices">
              {(Object.keys(PACE_LABEL) as Pace[]).map((pace) => (
                <button
                  key={pace}
                  type="button"
                  className="choice"
                  aria-pressed={profile.pace === pace}
                  onClick={() => {
                    update({ pace });
                    setStep('result');
                  }}
                >
                  <span className="stack stack-tight">
                    <span className="choice-title">{PACE_LABEL[pace]}</span>
                    <span className="muted">{pace === 'slow' ? '無理なく続けたい（はじめての方におすすめ）' : 'しっかり結果を出したい'}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'result' && <Result profile={profile} onConfirm={finish} />}
      </div>

      {(step === 'body' || step === 'activity' || step === 'pace') && (
        <div className="onboarding-actions">
          <button type="button" className="button button-block button-large" onClick={next} disabled={!canNext}>
            次へ
          </button>
        </div>
      )}
    </div>
  );
}

function Result({ profile, onConfirm }: { profile: Profile; onConfirm: (t: Targets) => void }) {
  const suggested = calcTargets(profile);
  const [targets, setTargets] = useState<Targets>(suggested);
  const [adjusting, setAdjusting] = useState(false);

  return (
    <>
      <div className="row stack-tight">
        <Icon name="sparkle" className="chip-check" />
        <span className="muted">あなたへの提案</span>
      </div>
      <div className="result-kcal">
        <span className="muted">1日の目標</span>
        <span className="result-number">約{targets.kcal.toLocaleString()}</span>
        <span className="muted">kcal</span>
      </div>

      <ul className="macro-list">
        {MACRO_META.map(({ key, label, fill }) => (
          <li className="macro-item" key={key}>
            <span className={`macro-dot ${fill}`} aria-hidden="true" />
            <span>{label}</span>
            <span className="macro-amount">{targets[key]}g</span>
            {key === 'p' && <span className="muted small macro-hint">{proteinHint(targets.p)}</span>}
          </li>
        ))}
      </ul>

      <details className="details">
        <summary>なぜこの数字？</summary>
        <div className="muted">
          {explainTargets(profile, suggested).map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p>PFCは、たんぱく質（Protein）・脂質（Fat）・炭水化物（Carbohydrate）の頭文字です。</p>
        </div>
      </details>

      {adjusting && <TargetEditor value={targets} onChange={setTargets} />}

      {needsDoctorNotice(profile) && <p className="notice notice-strong">成長期の方は、食事を減らす前に家族や学校の先生、医師に相談してください。</p>}
      <p className="notice">目安の数値です。妊娠中・授乳中の方や持病のある方は、医師に相談してください。</p>

      <div className="onboarding-actions">
        <button type="button" className="button button-block button-large" onClick={() => onConfirm(targets)}>
          これで始める
        </button>
        {!adjusting && (
          <button type="button" className="button button-ghost button-block" onClick={() => setAdjusting(true)}>
            詳しく調整する
          </button>
        )}
      </div>
    </>
  );
}

export function TargetEditor({ value, onChange }: { value: Targets; onChange: (t: Targets) => void }) {
  const setMacro = (key: 'p' | 'f' | 'c') => (n: number) => onChange(withMacro(value, key, n));
  return (
    <div className="stack">
      <NumberField label="カロリー" unit="kcal" value={value.kcal} min={1000} max={5000} step={10} onChange={(n) => onChange(withKcal(value, n))} />
      <NumberField label="たんぱく質" unit="g" value={value.p} min={0} max={400} step={1} onChange={setMacro('p')} />
      <NumberField label="脂質" unit="g" value={value.f} min={0} max={300} step={1} onChange={setMacro('f')} />
      <NumberField label="炭水化物" unit="g" value={value.c} min={0} max={800} step={1} onChange={setMacro('c')} />
      <p className="muted small">カロリーを変えると炭水化物が、PFCを変えるとカロリーが自動で合わせて変わります。</p>
    </div>
  );
}

export function NumberField(props: { label: string; unit: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void }) {
  const { label, unit, value, min, max, step, onChange } = props;
  const id = `field-${label}`;
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="input-unit">
        <input
          id={id}
          className="input"
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => onChange(e.target.valueAsNumber)}
        />
        <span className="muted">{unit}</span>
      </div>
      <input
        className="range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? Math.min(Math.max(value, min), max) : min}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        aria-label={`${label}（スライダー）`}
      />
    </div>
  );
}

const isBodyValid = (p: Profile) =>
  p.age >= 10 && p.age <= 100 && p.heightCm >= 120 && p.heightCm <= 220 && p.weightKg >= 30 && p.weightKg <= 200;
