import { Fragment, useMemo } from 'react';
import type { Category, Habit, WeekInfo } from '../types';
import { formatPercentage } from '../utils/dateHelpers';
import { CategoryHeaderRow } from './CategoryHeaderRow';
import { HabitRow } from './HabitRow';

type HabitGridProps = {
  habits: Habit[];
  categories: Category[];
  weeks: WeekInfo[];
  year: number;
  month: number;
  globalPercentage: number;
  onToggle: (habitId: string, dateKey: string) => void;
  onSetValue: (habitId: string, dateKey: string, value: string) => void;
  onRename: (habitId: string, name: string) => void;
  onUpdateUnit: (habitId: string, unit: string) => void;
  onUpdateCategory: (habitId: string, categoryId: string) => void;
  onRemove: (habitId: string) => void;
  onMoveUp: (habitId: string) => void;
  onMoveDown: (habitId: string) => void;
};

export function HabitGrid({
  habits,
  categories,
  weeks,
  year,
  month,
  globalPercentage,
  onToggle,
  onSetValue,
  onRename,
  onUpdateUnit,
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
                    categoryColor={category?.color}
                    order={index + 1}
                    isFirst={index === 0}
                    isLast={index === habits.length - 1}
                    weeks={weeks}
                    year={year}
                    month={month}
                    onToggle={onToggle}
                    onSetValue={onSetValue}
                    onRename={onRename}
                    onUpdateUnit={onUpdateUnit}
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
