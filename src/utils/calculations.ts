import { CHARACTER_FORMS } from '../data/characterForms';
import type { CharacterForm, DailyProgress, Habit, HabitStats } from '../types';
import { formatDateKey, getDaysInMonth, isHabitActiveOnDay } from './dateHelpers';

function getMonthPrefix(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

function getActiveDayCount(habit: Habit, year: number, month: number): number {
  const prefix = getMonthPrefix(year, month);

  if (habit.kind === 'boolean') {
    return Object.entries(habit.checks).filter(
      ([dateKey, value]) => value && dateKey.startsWith(prefix),
    ).length;
  }

  return Object.entries(habit.values).filter(
    ([dateKey, value]) => value > 0 && dateKey.startsWith(prefix),
  ).length;
}

function getNumericAmounts(habit: Habit, year: number, month: number): number[] {
  const prefix = getMonthPrefix(year, month);
  return Object.entries(habit.values)
    .filter(([dateKey, value]) => dateKey.startsWith(prefix) && value > 0)
    .map(([, value]) => value);
}

export function getHabitStats(habit: Habit, year: number, month: number): HabitStats {
  const totalDays = getDaysInMonth(year, month);
  const activeDays = getActiveDayCount(habit, year, month);
  const amounts = habit.kind === 'numeric' ? getNumericAmounts(habit, year, month) : [];
  const totalAmount = amounts.reduce((sum, value) => sum + value, 0);

  return {
    habitId: habit.id,
    activeDays,
    totalDays,
    percentage: totalDays === 0 ? 0 : (activeDays / totalDays) * 100,
    totalAmount,
    average: amounts.length === 0 ? 0 : totalAmount / amounts.length,
    best: amounts.length === 0 ? 0 : Math.max(...amounts),
  };
}

export function getGlobalPercentage(habits: Habit[], year: number, month: number): number {
  if (habits.length === 0) return 0;
  const stats = habits.map((habit) => getHabitStats(habit, year, month));
  return stats.reduce((acc, s) => acc + s.percentage, 0) / habits.length;
}

export function getUnlockedForms(globalPercentage: number): CharacterForm[] {
  return CHARACTER_FORMS.filter((form) => globalPercentage >= form.threshold);
}

export function getActiveForm(globalPercentage: number): CharacterForm {
  const unlocked = getUnlockedForms(globalPercentage);
  return unlocked[unlocked.length - 1] ?? CHARACTER_FORMS[0];
}

export function getLevel(globalPercentage: number): number {
  return getUnlockedForms(globalPercentage).length;
}

export function getMotivationalMessage(globalPercentage: number): string {
  if (globalPercentage >= 100) return '¡Excelente! Obtuviste';
  if (globalPercentage >= 80) return '¡Increíble! Obtuviste';
  if (globalPercentage >= 60) return '¡Muy bien! Obtuviste';
  if (globalPercentage >= 40) return '¡Vas bien! Obtuviste';
  if (globalPercentage >= 20) return '¡Sigue así! Obtuviste';
  return '¡Empieza fuerte! Obtuviste';
}

export function getDailyProgress(habits: Habit[], year: number, month: number): DailyProgress[] {
  const days = getDaysInMonth(year, month);
  const monthPrefix = getMonthPrefix(year, month);

  return Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const dateKey = formatDateKey(year, month, day);
    const activeHabits = habits.filter((habit) => isHabitActiveOnDay(habit, dateKey)).length;
    const percentage = habits.length === 0 ? 0 : (activeHabits / habits.length) * 100;
    return { dateKey, label: String(day), percentage };
  }).filter((entry) => entry.dateKey.startsWith(monthPrefix));
}
