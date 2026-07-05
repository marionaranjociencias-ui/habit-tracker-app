import { doc, getDoc, setDoc } from 'firebase/firestore';
import { DEFAULT_HABITS, STORAGE_PREFIX } from '../data/characterForms';
import { DEFAULT_CATEGORY_ID } from '../data/defaultCategories';
import type { Habit, MonthData } from '../types';
import { getFirebaseFirestore } from './firebase';

const MIGRATION_FLAG_PREFIX = `${STORAGE_PREFIX}-migrated`;

function createDefaultHabits(): Habit[] {
  return DEFAULT_HABITS.map((habit, index) => ({
    id: `habit-${index + 1}`,
    name: habit.name,
    kind: habit.kind,
    unit: habit.unit,
    categoryId: habit.categoryId,
    checks: {},
    values: {},
  }));
}

function normalizeHabits(habits: Habit[], fallbackCategoryId = DEFAULT_CATEGORY_ID): Habit[] {
  return habits.map((habit) => ({
    ...habit,
    kind: habit.kind ?? 'boolean',
    unit: habit.unit ?? '—',
    categoryId: habit.categoryId ?? fallbackCategoryId,
    checks: habit.checks ?? {},
    values: habit.values ?? {},
  }));
}

function normalizeMonthData(data: MonthData): MonthData {
  return {
    year: data.year,
    month: data.month,
    habits: normalizeHabits(data.habits),
  };
}

export function getMonthDocId(year: number, month: number): string {
  const m = String(month + 1).padStart(2, '0');
  return `${year}-${m}`;
}

export function getMonthDocPath(userId: string, year: number, month: number): string {
  return `users/${userId}/months/${getMonthDocId(year, month)}`;
}

function getLocalStorageKey(userId: string, year: number, month: number): string {
  return `${STORAGE_PREFIX}-${userId}-${getMonthDocId(year, month)}`;
}

function getMigrationFlagKey(userId: string): string {
  return `${MIGRATION_FLAG_PREFIX}-${userId}`;
}

export function isMigrationDone(userId: string): boolean {
  return localStorage.getItem(getMigrationFlagKey(userId)) === 'true';
}

export function markMigrationDone(userId: string): void {
  localStorage.setItem(getMigrationFlagKey(userId), 'true');
}

export function loadMonthFromLocalStorage(
  userId: string,
  year: number,
  month: number,
): MonthData | null {
  const key = getLocalStorageKey(userId, year, month);
  const raw = localStorage.getItem(key);

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as MonthData;
    return normalizeMonthData(parsed);
  } catch {
    return null;
  }
}

function listLocalStorageMonthKeys(userId: string): string[] {
  const prefix = `${STORAGE_PREFIX}-${userId}-`;
  const keys: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      keys.push(key);
    }
  }

  return keys;
}

function parseMonthKey(key: string, userId: string): { year: number; month: number } | null {
  const prefix = `${STORAGE_PREFIX}-${userId}-`;
  if (!key.startsWith(prefix)) return null;

  const yearMonth = key.slice(prefix.length);
  const match = /^(\d{4})-(\d{2})$/.exec(yearMonth);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;

  if (Number.isNaN(year) || Number.isNaN(month) || month < 0 || month > 11) {
    return null;
  }

  return { year, month };
}

export async function loadMonthFromFirestore(
  userId: string,
  year: number,
  month: number,
): Promise<MonthData | null> {
  const db = getFirebaseFirestore();
  const ref = doc(db, getMonthDocPath(userId, year, month));
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) return null;

  const data = snapshot.data() as MonthData;
  return normalizeMonthData({
    year: data.year ?? year,
    month: data.month ?? month,
    habits: data.habits ?? [],
  });
}

export async function saveMonthToFirestore(userId: string, data: MonthData): Promise<void> {
  const db = getFirebaseFirestore();
  const ref = doc(db, getMonthDocPath(userId, data.year, data.month));

  await setDoc(
    ref,
    {
      year: data.year,
      month: data.month,
      habits: data.habits,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

export async function migrateLocalStorageToFirestore(userId: string): Promise<void> {
  if (isMigrationDone(userId)) return;

  const keys = listLocalStorageMonthKeys(userId);

  for (const key of keys) {
    const parsed = parseMonthKey(key, userId);
    if (!parsed) continue;

    const { year, month } = parsed;
    const existing = await loadMonthFromFirestore(userId, year, month);
    if (existing) continue;

    const localData = loadMonthFromLocalStorage(userId, year, month);
    if (!localData) continue;

    await saveMonthToFirestore(userId, localData);
  }

  markMigrationDone(userId);
}

export function createDefaultMonthData(year: number, month: number): MonthData {
  return { year, month, habits: createDefaultHabits() };
}

export async function loadMonthData(
  userId: string,
  year: number,
  month: number,
): Promise<MonthData> {
  await migrateLocalStorageToFirestore(userId);

  const fromFirestore = await loadMonthFromFirestore(userId, year, month);
  if (fromFirestore) return fromFirestore;

  const fromLocal = loadMonthFromLocalStorage(userId, year, month);
  if (fromLocal) {
    await saveMonthToFirestore(userId, fromLocal);
    return fromLocal;
  }

  return createDefaultMonthData(year, month);
}
