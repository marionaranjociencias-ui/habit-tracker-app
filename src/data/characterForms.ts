import type { CharacterForm, DefaultHabitSeed } from '../types';

export const CHARACTER_FORMS: CharacterForm[] = [
  { id: 'form-0', name: 'Base', threshold: 0, image: '/characters/form-0.svg' },
  { id: 'form-1', name: 'Super Saiyan', threshold: 20, image: '/characters/form-1.svg' },
  { id: 'form-2', name: 'SSJ 2', threshold: 40, image: '/characters/form-2.svg' },
  { id: 'form-3', name: 'SSJ Blue', threshold: 60, image: '/characters/form-3.svg' },
  { id: 'form-4', name: 'SSJ 4', threshold: 80, image: '/characters/form-4.svg' },
  { id: 'form-5', name: 'Ultra Instinct', threshold: 100, image: '/characters/form-5.svg' },
];

export const DEFAULT_HABITS: DefaultHabitSeed[] = [
  { name: 'Lagartijas', kind: 'numeric', unit: 'reps', categoryId: 'exercise' },
  { name: 'Pull-ups', kind: 'numeric', unit: 'reps', categoryId: 'exercise' },
  { name: 'Leer', kind: 'numeric', unit: 'páginas', categoryId: 'study' },
  { name: 'Meditar', kind: 'boolean', unit: '—', categoryId: 'personal' },
  { name: 'Agua 2L', kind: 'boolean', unit: '—', categoryId: 'personal' },
];

export const STORAGE_PREFIX = 'habit-tracker-app';
