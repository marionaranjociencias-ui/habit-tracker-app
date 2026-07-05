import { useEffect, useState, type FormEvent } from 'react';
import type { Category, HabitKind } from '../types';

type HabitManagerProps = {
  categories: Category[];
  defaultCategoryId: string;
  onAdd: (name: string, kind: HabitKind, unit: string, categoryId: string) => void;
  onReset: () => void;
  onExportExcel: () => void;
};

export function HabitManager({
  categories,
  defaultCategoryId,
  onAdd,
  onReset,
  onExportExcel,
}: HabitManagerProps) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('reps');
  const [kind, setKind] = useState<HabitKind>('numeric');
  const [categoryId, setCategoryId] = useState(defaultCategoryId);

  useEffect(() => {
    if (!categories.some((category) => category.id === categoryId)) {
      setCategoryId(categories[0]?.id ?? defaultCategoryId);
    }
  }, [categories, categoryId, defaultCategoryId]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onAdd(name, kind, unit, categoryId);
    setName('');
    setUnit('reps');
    setKind('numeric');
  };

  return (
    <div className="habit-manager">
      <form className="habit-manager__form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nuevo hábito..."
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="habit-manager__input"
        />
        <select
          className="habit-manager__select"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          aria-label="Categoría del hábito"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          className="habit-manager__select"
          value={kind}
          onChange={(event) => setKind(event.target.value as HabitKind)}
          aria-label="Tipo de hábito"
        >
          <option value="numeric">Con número</option>
          <option value="boolean">Sí / No</option>
        </select>
        {kind === 'numeric' && (
          <input
            type="text"
            placeholder="Unidad (reps, páginas...)"
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            className="habit-manager__input habit-manager__input--unit"
          />
        )}
        <button type="submit" className="habit-manager__add">
          + Agregar
        </button>
      </form>
      <div className="habit-manager__actions">
        <button type="button" className="habit-manager__export" onClick={onExportExcel}>
          Descargar Excel
        </button>
        <button type="button" className="habit-manager__reset" onClick={onReset}>
          Reiniciar mes
        </button>
      </div>
    </div>
  );
}
