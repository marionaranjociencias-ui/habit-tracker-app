import type { Habit, HabitLog, TrackingMode } from '../types';

export function isSimpleMode(habit: Habit): boolean {
  return habit.trackingMode === 'simple';
}

export function isUnitsMode(habit: Habit): boolean {
  return habit.trackingMode === 'units';
}

export function getModeLabel(mode: TrackingMode): string {
  return mode === 'simple' ? 'Modo simple' : 'Con unidades';
}

export function formatTarget(habit: Habit): string {
  if (!isUnitsMode(habit) || !habit.targetValue) return '—';
  return `${habit.targetValue} ${habit.unitLabel ?? ''}`.trim();
}

export function computeCompleted(habit: Habit, value?: number, manualCompleted?: boolean): boolean {
  if (isSimpleMode(habit)) {
    return Boolean(manualCompleted);
  }

  const numericValue = value ?? 0;
  if (numericValue <= 0) return false;

  if (habit.targetValue && habit.targetValue > 0) {
    return numericValue >= habit.targetValue;
  }

  return numericValue > 0;
}

export function isLogActive(log: HabitLog | undefined): boolean {
  return Boolean(log?.completed);
}

export function isTargetMet(habit: Habit, log: HabitLog | undefined): boolean {
  if (!log) return false;
  if (isSimpleMode(habit)) return log.completed;

  const value = log.value ?? 0;
  if (value <= 0) return false;

  if (habit.targetValue && habit.targetValue > 0) {
    return value >= habit.targetValue;
  }

  return value > 0;
}

export function getLogDisplayValue(habit: Habit, log: HabitLog | undefined): string {
  if (!log) return '';
  if (isSimpleMode(habit)) return log.completed ? '✓' : '';
  return log.value && log.value > 0 ? String(log.value) : '';
}

export function getTargetProgressLabel(habit: Habit, log: HabitLog | undefined): string | null {
  if (!isUnitsMode(habit) || !habit.targetValue) return null;
  const value = log?.value ?? 0;
  return `${value} / ${habit.targetValue} ${habit.unitLabel ?? ''}`.trim();
}

export function getTargetProgressRatio(habit: Habit, log: HabitLog | undefined): number {
  if (!habit.targetValue || habit.targetValue <= 0) return 0;
  const value = log?.value ?? 0;
  return Math.min(value / habit.targetValue, 1);
}
