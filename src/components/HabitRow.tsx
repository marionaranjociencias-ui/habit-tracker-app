import type { CSSProperties } from 'react';
import type { Category, Habit, HabitLog, LogsByHabitId, TrackingMode, WeekInfo } from '../types';
import { getHabitStats } from '../utils/calculations';
import { formatNumber, formatPercentage } from '../utils/dateHelpers';
import {
  formatTarget,
  getModeLabel,
  getTargetProgressLabel,
  getTargetProgressRatio,
  isTargetMet,
  isUnitsMode,
} from '../utils/habitTracking';
import { ProgressBar } from './ProgressBar';

type HabitRowProps = {
  habit: Habit;
  categories: Category[];
  logsByHabitId: LogsByHabitId;
  categoryColor?: string;
  order: number;
  isFirst: boolean;
  isLast: boolean;
  weeks: WeekInfo[];
  year: number;
  month: number;
  onToggleSimple: (habitId: string, dateKey: string) => void;
  onSetUnitsValue: (habitId: string, dateKey: string, value: string) => void;
  onIncrementUnits: (habitId: string, dateKey: string) => void;
  onRename: (habitId: string, name: string) => void;
  onUpdateUnitLabel: (habitId: string, unit: string) => void;
  onUpdateTargetValue: (habitId: string, value: string) => void;
  onUpdateTrackingMode: (habitId: string, mode: TrackingMode) => void;
  onUpdateCategory: (habitId: string, categoryId: string) => void;
  onRemove: (habitId: string) => void;
  onMoveUp: (habitId: string) => void;
  onMoveDown: (habitId: string) => void;
};

export function HabitRow({
  habit,
  categories,
  logsByHabitId,
  categoryColor,
  order,
  isFirst,
  isLast,
  weeks,
  year,
  month,
  onToggleSimple,
  onSetUnitsValue,
  onIncrementUnits,
  onRename,
  onUpdateUnitLabel,
  onUpdateTargetValue,
  onUpdateTrackingMode,
  onUpdateCategory,
  onRemove,
  onMoveUp,
  onMoveDown,
}: HabitRowProps) {
  const stats = getHabitStats(habit, logsByHabitId, year, month);
  const habitLogs = logsByHabitId[habit.id] ?? {};
  const rowStyle = categoryColor
    ? ({ '--category-color': categoryColor } as CSSProperties)
    : undefined;

  const handleRemove = () => {
    const confirmed = window.confirm(`¿Eliminar el hábito "${habit.name}"?`);
    if (confirmed) onRemove(habit.id);
  };

  const renderUnitsCell = (day: { dateKey: string; dayNumber: number; dayAbbr: string }, colorClass: string) => {
    const log: HabitLog | undefined = habitLogs[day.dateKey];
    const value = log?.value;
    const hasValue = value !== undefined && value > 0;
    const targetMet = isTargetMet(habit, log);
    const progressLabel = getTargetProgressLabel(habit, log);
    const progressRatio = getTargetProgressRatio(habit, log);

    return (
      <div key={day.dateKey} className="habit-row__day-cell">
        <div className="habit-row__day-inputs">
          <input
            type="number"
            min={0}
            step={0.1}
            inputMode="decimal"
            className={`value-cell ${colorClass} ${hasValue ? 'value-cell--filled' : ''} ${targetMet ? 'value-cell--target-met' : ''}`}
            value={value ?? ''}
            placeholder="—"
            onChange={(event) => onSetUnitsValue(habit.id, day.dateKey, event.target.value)}
            aria-label={`${habit.name} - ${day.dayNumber} ${day.dayAbbr}`}
          />
          <button
            type="button"
            className="habit-row__increment-btn"
            onClick={() => onIncrementUnits(habit.id, day.dateKey)}
            aria-label={`Sumar 1 a ${habit.name}`}
            title="+1"
          >
            +1
          </button>
        </div>
        {habit.targetValue && (
          <>
            <span className="habit-row__target-label">{progressLabel}</span>
            <div className="habit-row__target-bar">
              <span
                className="habit-row__target-bar-fill"
                style={{ width: `${progressRatio * 100}%` }}
              />
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <tr className={`habit-row ${categoryColor ? 'habit-row--categorized' : ''}`} style={rowStyle}>
      <td className="habit-row__habit-col habit-row__habit-col--categorized">
        <div className="habit-row__habit-cell">
          <div className="habit-row__order-controls">
            <span className="habit-row__order-num">{order}</span>
            <button
              type="button"
              className="habit-row__order-btn"
              onClick={() => onMoveUp(habit.id)}
              disabled={isFirst}
              aria-label={`Subir ${habit.name}`}
              title="Subir prioridad"
            >
              ↑
            </button>
            <button
              type="button"
              className="habit-row__order-btn"
              onClick={() => onMoveDown(habit.id)}
              disabled={isLast}
              aria-label={`Bajar ${habit.name}`}
              title="Bajar prioridad"
            >
              ↓
            </button>
          </div>
          <div className="habit-row__habit-main">
            <input
              className="habit-row__name-input"
              value={habit.name}
              onChange={(event) => onRename(habit.id, event.target.value)}
              aria-label={`Nombre del hábito ${habit.name}`}
              placeholder="Nombre del hábito"
            />
            <div className="habit-row__habit-meta">
              <select
                className="habit-row__mode-select"
                value={habit.trackingMode}
                onChange={(event) =>
                  onUpdateTrackingMode(habit.id, event.target.value as TrackingMode)
                }
                aria-label={`Modo de ${habit.name}`}
                title="Modo de seguimiento"
              >
                <option value="simple">{getModeLabel('simple')}</option>
                <option value="units">{getModeLabel('units')}</option>
              </select>
              <select
                className="habit-row__category-select"
                value={habit.categoryId}
                onChange={(event) => onUpdateCategory(habit.id, event.target.value)}
                aria-label={`Categoría de ${habit.name}`}
                title="Categoría"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            className="habit-row__remove"
            onClick={handleRemove}
            title="Eliminar hábito"
            aria-label={`Eliminar ${habit.name}`}
          >
            ×
          </button>
        </div>
      </td>
      <td className="habit-row__unit-col habit-row__unit-col--categorized">
        <div className="habit-row__unit-stack">
          <span className="habit-row__unit-label">Unidad</span>
          {isUnitsMode(habit) ? (
            <>
              <input
                className="habit-row__unit-input"
                value={habit.unitLabel ?? ''}
                onChange={(event) => onUpdateUnitLabel(habit.id, event.target.value)}
                aria-label={`Unidad de ${habit.name}`}
              />
              <label className="habit-row__target-field">
                <span>Meta</span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  className="habit-row__target-input"
                  value={habit.targetValue ?? ''}
                  onChange={(event) => onUpdateTargetValue(habit.id, event.target.value)}
                  placeholder="—"
                  aria-label={`Meta diaria de ${habit.name}`}
                />
              </label>
              {habit.targetValue ? (
                <span className="habit-row__target-summary">{formatTarget(habit)}</span>
              ) : null}
            </>
          ) : (
            <span className="habit-row__unit-placeholder">—</span>
          )}
        </div>
      </td>
      {weeks.map((week, weekIndex) => (
        <td key={week.weekNumber} colSpan={week.days.length} className="habit-row__week">
          <div className="habit-row__days">
            {week.days.map((day) => {
              const colorClass = weekIndex % 2 === 0 ? 'cell--blue' : 'cell--coral';

              if (isUnitsMode(habit)) {
                return renderUnitsCell(day, colorClass);
              }

              const checked = Boolean(habitLogs[day.dateKey]?.completed);
              return (
                <button
                  key={day.dateKey}
                  type="button"
                  className={`checkbox ${colorClass} ${checked ? 'checkbox--checked' : ''}`}
                  onClick={() => onToggleSimple(habit.id, day.dateKey)}
                  aria-label={`${habit.name} - ${day.dayNumber} ${day.dayAbbr}`}
                  aria-pressed={checked}
                  title="¿Lo hiciste hoy?"
                >
                  {checked ? '✓' : ''}
                </button>
              );
            })}
          </div>
        </td>
      ))}
      <td className="habit-row__progress">
        <ProgressBar percentage={stats.percentage} />
        {isUnitsMode(habit) ? (
          <>
            <div className="habit-row__progress-meta">
              <span>Total: {formatNumber(stats.totalAmount)}</span>
              <span>Mejor: {formatNumber(stats.best)}</span>
            </div>
            <div className="habit-row__progress-meta habit-row__progress-meta--secondary">
              {habit.targetValue ? (
                <span>
                  Meta: {stats.targetDays}/{stats.totalDays}
                </span>
              ) : (
                <span>{formatPercentage(stats.percentage)} días</span>
              )}
              <span>Racha: {stats.streak}</span>
            </div>
          </>
        ) : (
          <div className="habit-row__progress-meta">
            <span>{formatPercentage(stats.percentage)}</span>
            <span>
              {stats.activeDays}/{stats.totalDays}
            </span>
            <span>Racha: {stats.streak}</span>
          </div>
        )}
      </td>
    </tr>
  );
}
