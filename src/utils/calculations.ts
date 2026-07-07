import { CHARACTER_FORMS } from '../data/characterForms';
import type { CharacterForm, DailyProgress, Habit, HabitLog, HabitStats, LogsByHabitId } from '../types';
import { isLogActive, isTargetMet, isUnitsMode } from './habitTracking';
import { formatDateKey, getDaysInMonth } from './dateHelpers';

function getMonthDateKeys(year: number, month: number): string[] {
  const days = getDaysInMonth(year, month);
  return Array.from({ length: days }, (_, index) => formatDateKey(year, month, index + 1));
}

function getLogsForMonth(
  habitId: string,
  logsByHabitId: LogsByHabitId,
  year: number,
  month: number,
): HabitLog[] {
  const habitLogs = logsByHabitId[habitId] ?? {};
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  return Object.values(habitLogs).filter((log) => log.date.startsWith(prefix));
}

function computeStreak(habit: Habit, logsByHabitId: LogsByHabitId): number {
  const today = new Date();
  let streak = 0;
  let cursor = new Date(today);

  for (let i = 0; i < 365; i += 1) {
    const dateKey = formatDateKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
    const log = logsByHabitId[habit.id]?.[dateKey];

    if (isLogActive(log)) {
      streak += 1;
    } else {
      break;
    }

    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getHabitStats(
  habit: Habit,
  logsByHabitId: LogsByHabitId,
  year: number,
  month: number,
): HabitStats {
  const totalDays = getDaysInMonth(year, month);
  const dateKeys = getMonthDateKeys(year, month);
  const monthLogs = getLogsForMonth(habit.id, logsByHabitId, year, month);

  const activeDays = dateKeys.filter((dateKey) =>
    isLogActive(logsByHabitId[habit.id]?.[dateKey]),
  ).length;

  const targetDays = dateKeys.filter((dateKey) =>
    isTargetMet(habit, logsByHabitId[habit.id]?.[dateKey]),
  ).length;

  const amounts = isUnitsMode(habit)
    ? monthLogs.map((log) => log.value ?? 0).filter((value) => value > 0)
    : [];

  const totalAmount = amounts.reduce((sum, value) => sum + value, 0);

  return {
    habitId: habit.id,
    activeDays,
    totalDays,
    percentage: totalDays === 0 ? 0 : (activeDays / totalDays) * 100,
    targetDays,
    targetPercentage: totalDays === 0 ? 0 : (targetDays / totalDays) * 100,
    streak: computeStreak(habit, logsByHabitId),
    totalAmount,
    average: amounts.length === 0 ? 0 : totalAmount / amounts.length,
    best: amounts.length === 0 ? 0 : Math.max(...amounts),
  };
}

export function getGlobalPercentage(
  habits: Habit[],
  logsByHabitId: LogsByHabitId,
  year: number,
  month: number,
): number {
  if (habits.length === 0) return 0;
  const stats = habits.map((habit) => getHabitStats(habit, logsByHabitId, year, month));
  return stats.reduce((acc, stat) => acc + stat.percentage, 0) / habits.length;
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

export function getDailyProgress(
  habits: Habit[],
  logsByHabitId: LogsByHabitId,
  year: number,
  month: number,
): DailyProgress[] {
  const dateKeys = getMonthDateKeys(year, month);

  return dateKeys.map((dateKey) => {
    const day = Number(dateKey.split('-')[2]);
    const activeHabits = habits.filter((habit) =>
      isLogActive(logsByHabitId[habit.id]?.[dateKey]),
    ).length;
    const percentage = habits.length === 0 ? 0 : (activeHabits / habits.length) * 100;
    return { dateKey, label: String(day), percentage };
  });
}

export function isHabitActiveOnDay(
  habit: Habit,
  logsByHabitId: LogsByHabitId,
  dateKey: string,
): boolean {
  return isLogActive(logsByHabitId[habit.id]?.[dateKey]);
}
