import type { Food } from '../domain/foods';
import { Icon } from './Icon';

export function FoodChips({ foods, selected, onToggle }: { foods: Food[]; selected: string[]; onToggle: (id: string) => void }) {
  return (
    <div className="chips">
      {foods.map((food) => {
        const on = selected.includes(food.id);
        return (
          <button key={food.id} type="button" className="chip" aria-pressed={on} onClick={() => onToggle(food.id)}>
            {on && <Icon name="check" className="chip-check" />}
            {food.name}
          </button>
        );
      })}
    </div>
  );
}
