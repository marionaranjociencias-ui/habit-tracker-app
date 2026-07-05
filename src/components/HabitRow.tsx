import type { Habit, WeekInfo } from '../types';
import { getHabitStats } from '../utils/calculations';
import { formatNumber, formatPercentage } from '../utils/dateHelpers';
import { ProgressBar } from './ProgressBar';

type HabitRowProps = {
  habit: Habit;
  weeks: WeekInfo[];
  year: number;
  month: number;
  onToggle: (habitId: string, dateKey: string) => void;
  onSetValue: (habitId: string, dateKey: string, value: string) => void;
  onRename: (habitId: string, name: string) => void;
  onUpdateUnit: (habitId: string, unit: string) => void;
  onRemove: (habitId: string) => void;
};

export function HabitRow({
  habit,
  weeks,
  year,
  month,
  onToggle,
  onSetValue,
  onRename,
  onUpdateUnit,
  onRemove,
}: HabitRowProps) {
  const stats = getHabitStats(habit, year, month);
  const isNumeric = habit.kind === 'numeric';

  return (
    <tr className="habit-row">
      <td className="habit-row__name-cell">
        <span className={`habit-row__kind-badge habit-row__kind-badge--${habit.kind}`}>
          {isNumeric ? '#' : '✓'}
        </span>
        <input
          className="habit-row__name-input"
          value={habit.name}
          onChange={(event) => onRename(habit.id, event.target.value)}
          aria-label={`Nombre del hábito ${habit.name}`}
        />
        <button
          type="button"
          className="habit-row__remove"
          onClick={() => onRemove(habit.id)}
          title="Eliminar hábito"
        >
          ×
        </button>
      </td>
      <td className="habit-row__unit-cell">
        {isNumeric ? (
          <input
            className="habit-row__unit-input"
            value={habit.unit}
            onChange={(event) => onUpdateUnit(habit.id, event.target.value)}
            aria-label={`Unidad de ${habit.name}`}
          />
        ) : (
          <span className="habit-row__unit-placeholder">—</span>
        )}
      </td>
      {weeks.map((week, weekIndex) => (
        <td key={week.weekNumber} colSpan={week.days.length} className="habit-row__week">
          <div className="habit-row__days">
            {week.days.map((day) => {
              const colorClass = weekIndex % 2 === 0 ? 'cell--blue' : 'cell--coral';

              if (isNumeric) {
                const value = habit.values[day.dateKey];
                const hasValue = value !== undefined && value > 0;
                return (
                  <input
                    key={day.dateKey}
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    className={`value-cell ${colorClass} ${hasValue ? 'value-cell--filled' : ''}`}
                    value={value ?? ''}
                    placeholder="—"
                    onChange={(event) => onSetValue(habit.id, day.dateKey, event.target.value)}
                    aria-label={`${habit.name} - ${day.dayNumber} ${day.dayAbbr}`}
                  />
                );
              }

              const checked = Boolean(habit.checks[day.dateKey]);
              return (
                <button
                  key={day.dateKey}
                  type="button"
                  className={`checkbox ${colorClass} ${checked ? 'checkbox--checked' : ''}`}
                  onClick={() => onToggle(habit.id, day.dateKey)}
                  aria-label={`${habit.name} - ${day.dayNumber} ${day.dayAbbr}`}
                  aria-pressed={checked}
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
        {isNumeric ? (
          <>
            <div className="habit-row__progress-meta">
              <span>Total: {formatNumber(stats.totalAmount)}</span>
              <span>Mejor: {formatNumber(stats.best)}</span>
            </div>
            <div className="habit-row__progress-meta habit-row__progress-meta--secondary">
              <span>{formatPercentage(stats.percentage)} días</span>
              <span>
                {stats.activeDays}/{stats.totalDays}
              </span>
            </div>
          </>
        ) : (
          <div className="habit-row__progress-meta">
            <span>{formatPercentage(stats.percentage)}</span>
            <span>
              {stats.activeDays}/{stats.totalDays}
            </span>
          </div>
        )}
      </td>
    </tr>
  );
}
