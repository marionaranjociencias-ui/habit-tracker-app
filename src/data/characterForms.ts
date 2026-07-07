import type { CharacterForm, DefaultHabitSeed, Habit } from '../types';

export const CHARACTER_FORMS: CharacterForm[] = [
  { id: 'form-0', name: 'Base', threshold: 0, image: '/characters/form-0.svg' },
  { id: 'form-1', name: 'Super Saiyan', threshold: 20, image: '/characters/form-1.svg' },
  { id: 'form-2', name: 'SSJ 2', threshold: 40, image: '/characters/form-2.svg' },
  { id: 'form-3', name: 'SSJ Blue', threshold: 60, image: '/characters/form-3.svg' },
  { id: 'form-4', name: 'SSJ 4', threshold: 80, image: '/characters/form-4.svg' },
  { id: 'form-5', name: 'Ultra Instinct', threshold: 100, image: '/characters/form-5.svg' },
];

export const DEFAULT_HABITS: DefaultHabitSeed[] = [
  { name: 'Lagartijas', trackingMode: 'units', unitLabel: 'reps', categoryId: 'exercise' },
  { name: 'Pull-ups', trackingMode: 'units', unitLabel: 'reps', categoryId: 'exercise' },
  { name: 'Leer', trackingMode: 'units', unitLabel: 'páginas', categoryId: 'study' },
  { name: 'Agua 2L', trackingMode: 'units', unitLabel: 'litros', targetValue: 2, categoryId: 'personal' },
  { name: 'Meditar', trackingMode: 'simple', categoryId: 'personal' },
];

export function createDefaultHabits(): Habit[] {
  const now = new Date().toISOString();
  return DEFAULT_HABITS.map((seed, index) => ({
    id: `habit-${index + 1}`,
    name: seed.name,
    categoryId: seed.categoryId,
    order: index,
    trackingMode: seed.trackingMode,
    unitLabel: seed.unitLabel,
    targetValue: seed.targetValue,
    targetPeriod: 'daily' as const,
    createdAt: now,
    updatedAt: now,
  }));
}
