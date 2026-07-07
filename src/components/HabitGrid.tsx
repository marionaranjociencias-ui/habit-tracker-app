import { Fragment, useMemo } from 'react';
import type { Category, Habit, LogsByHabitId, TrackingMode, WeekInfo } from '../types';
import { formatPercentage } from '../utils/dateHelpers';
import { CategoryHeaderRow } from './CategoryHeaderRow';
import { HabitRow } from './HabitRow';

type HabitGridProps = {
  habits: Habit[];
  categories: Category[];
  logsByHabitId: LogsByHabitId;
  weeks: WeekInfo[];
  year: number;
  month: number;
  globalPercentage: number;
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

export function HabitGrid({
  habits,
  categories,
  logsByHabitId,
  weeks,
  year,
  month,
  globalPercentage,
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
}: HabitGridProps) {
  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const totalCols = 2 + weeks.reduce((sum, week) => sum + week.days.length, 0) + 1;

  return (
    <section className="habit-grid">
      <div className="habit-grid__scroll">
        <table className="habit-grid__table">
          <thead>
            <tr>
              <th className="habit-grid__habit-header">Ord. / Hábitos</th>
              <th className="habit-grid__unit-header">Unidad</th>
              {weeks.map((week, weekIndex) => (
                <th
                  key={week.weekNumber}
                  colSpan={week.days.length}
                  className={`habit-grid__week-header ${weekIndex % 2 === 0 ? 'week--blue' : 'week--coral'}`}
                >
                  semana {week.weekNumber}
                </th>
              ))}
              <th className="habit-grid__progress-header">
                <span>Progreso</span>
                <strong>Completado {formatPercentage(globalPercentage)}</strong>
              </th>
            </tr>
            <tr>
              <th />
              <th />
              {weeks.map((week, weekIndex) =>
                week.days.map((day) => (
                  <th
                    key={day.dateKey}
                    className={`habit-grid__day-header ${weekIndex % 2 === 0 ? 'week--blue' : 'week--coral'}`}
                  >
                    <span>{day.dayNumber}</span>
                    <small>{day.dayAbbr}</small>
                  </th>
                )),
              )}
              <th />
            </tr>
          </thead>
          <tbody>
            {habits.map((habit, index) => {
              const prevCategoryId = index > 0 ? habits[index - 1].categoryId : null;
              const showHeader = habit.categoryId !== prevCategoryId;
              const category = categoriesById.get(habit.categoryId);

              return (
                <Fragment key={habit.id}>
                  {showHeader && category && (
                    <CategoryHeaderRow category={category} colSpan={totalCols} />
                  )}
                  <HabitRow
                    habit={habit}
                    categories={categories}
                    logsByHabitId={logsByHabitId}
                    categoryColor={category?.color}
                    order={index + 1}
                    isFirst={index === 0}
                    isLast={index === habits.length - 1}
                    weeks={weeks}
                    year={year}
                    month={month}
                    onToggleSimple={onToggleSimple}
                    onSetUnitsValue={onSetUnitsValue}
                    onIncrementUnits={onIncrementUnits}
                    onRename={onRename}
                    onUpdateUnitLabel={onUpdateUnitLabel}
                    onUpdateTargetValue={onUpdateTargetValue}
                    onUpdateTrackingMode={onUpdateTrackingMode}
                    onUpdateCategory={onUpdateCategory}
                    onRemove={onRemove}
                    onMoveUp={onMoveUp}
                    onMoveDown={onMoveDown}
                  />
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
