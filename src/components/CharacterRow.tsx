import { CHARACTER_FORMS } from '../data/characterForms';
import { formatPercentage } from '../utils/dateHelpers';

type CharacterRowProps = {
  globalPercentage: number;
};

export function CharacterRow({ globalPercentage }: CharacterRowProps) {
  return (
    <div className="character-row">
      {CHARACTER_FORMS.map((form) => {
        const unlocked = globalPercentage >= form.threshold;
        return (
          <div
            key={form.id}
            className={`character-row__item ${unlocked ? 'character-row__item--unlocked' : ''}`}
          >
            <span className="character-row__threshold">
              {form.threshold === 100 ? '100%' : `${form.threshold}%`}
            </span>
            <img src={form.image} alt={form.name} className="character-row__sprite" />
            <span className="character-row__name">{form.name}</span>
          </div>
        );
      })}
      <div className="character-row__summary">
        <span>Progreso global</span>
        <strong>{formatPercentage(globalPercentage)}</strong>
      </div>
    </div>
  );
}
