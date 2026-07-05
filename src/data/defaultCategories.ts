import type { Category } from '../types';

export const CATEGORY_COLOR_PALETTE = [
  '#2a9d8f',
  '#5b9bd5',
  '#e07a5f',
  '#9b59b6',
  '#f4a261',
  '#457b9d',
  '#e76f51',
  '#606c38',
  '#bc6c25',
  '#6d597a',
];

export const DEFAULT_CATEGORY_ID = 'exercise';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'exercise', name: 'Ejercicio', color: '#2a9d8f' },
  { id: 'study', name: 'Estudio', color: '#5b9bd5' },
  { id: 'personal', name: 'Personales', color: '#e07a5f' },
];

export function createDefaultCategories(): Category[] {
  return DEFAULT_CATEGORIES.map((category) => ({ ...category }));
}
