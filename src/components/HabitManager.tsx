import { useEffect, useState, type FormEvent } from 'react';
import type { Category, TrackingMode } from '../types';

type HabitManagerProps = {
  categories: Category[];
  defaultCategoryId: string;
  onAdd: (
    name: string,
    trackingMode: TrackingMode,
    categoryId: string,
    unitLabel?: string,
    targetValue?: number,
  ) => void;
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
  const [unitLabel, setUnitLabel] = useState('reps');
  const [targetValue, setTargetValue] = useState('');
  const [trackingMode, setTrackingMode] = useState<TrackingMode>('simple');
  const [categoryId, setCategoryId] = useState(defaultCategoryId);

  useEffect(() => {
    if (!categories.some((category) => category.id === categoryId)) {
      setCategoryId(categories[0]?.id ?? defaultCategoryId);
    }
  }, [categories, categoryId, defaultCategoryId]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsedTarget = targetValue.trim() ? Number(targetValue) : undefined;
    onAdd(
      name,
      trackingMode,
      categoryId,
      trackingMode === 'units' ? unitLabel : undefined,
      parsedTarget && parsedTarget > 0 ? parsedTarget : undefined,
    );
    setName('');
    setUnitLabel('reps');
    setTargetValue('');
    setTrackingMode('simple');
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
          value={trackingMode}
          onChange={(event) => setTrackingMode(event.target.value as TrackingMode)}
          aria-label="Modo de seguimiento"
        >
          <option value="simple">Modo simple</option>
          <option value="units">Con unidades</option>
        </select>
        {trackingMode === 'units' && (
          <>
            <input
              type="text"
              placeholder="Unidad (litros, min...)"
              value={unitLabel}
              onChange={(event) => setUnitLabel(event.target.value)}
              className="habit-manager__input habit-manager__input--unit"
            />
            <input
              type="number"
              min={0}
              step={0.1}
              placeholder="Meta diaria (opcional)"
              value={targetValue}
              onChange={(event) => setTargetValue(event.target.value)}
              className="habit-manager__input habit-manager__input--target"
              aria-label="Meta diaria opcional"
            />
          </>
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
