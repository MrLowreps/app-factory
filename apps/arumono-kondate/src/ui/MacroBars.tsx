import type { Nutrition } from '../domain/menu';
import type { Targets } from '../domain/targets';

const MACROS = [
  { key: 'p', label: 'たんぱく質', fill: 'fill-protein' },
  { key: 'f', label: '脂質', fill: 'fill-fat' },
  { key: 'c', label: '炭水化物', fill: 'fill-carb' },
] as const;

export const MACRO_META = MACROS;

/** 目標に対する PFC の進み具合 */
export function MacroBars({ actual, targets }: { actual: Nutrition; targets: Targets }) {
  return (
    <div className="macro-bars">
      {MACROS.map(({ key, label, fill }) => {
        const ratio = targets[key] ? actual[key] / targets[key] : 0;
        return (
          <div className="macro-bar" key={key}>
            <span>{label}</span>
            <div className="macro-track" role="progressbar" aria-label={label} aria-valuenow={Math.round(ratio * 100)} aria-valuemin={0} aria-valuemax={100}>
              <div className={`macro-fill ${fill}`} style={{ width: `${Math.min(ratio, 1) * 100}%` }} />
            </div>
            <span className="macro-value">
              {Math.round(actual[key])} / {targets[key]}g
            </span>
          </div>
        );
      })}
    </div>
  );
}

export const formatPfc = (n: Nutrition) => `P${Math.round(n.p)} F${Math.round(n.f)} C${Math.round(n.c)}`;
