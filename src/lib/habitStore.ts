import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { createDefaultHabits } from '../data/characterForms';
import type { Habit, HabitLog, LogsByHabitId } from '../types';
import { formatDateKey, getDaysInMonth } from '../utils/dateHelpers';
import { getFirebaseFirestore } from './firebase';

export function getHabitsCollectionPath(userId: string): string {
  return `users/${userId}/habits`;
}

export function getHabitDocPath(userId: string, habitId: string): string {
  return `${getHabitsCollectionPath(userId)}/${habitId}`;
}

export function getLogDocPath(userId: string, habitId: string, date: string): string {
  return `${getHabitDocPath(userId, habitId)}/logs/${date}`;
}

function normalizeHabit(data: Habit): Habit {
  const now = new Date().toISOString();
  return {
    id: data.id,
    name: data.name,
    categoryId: data.categoryId,
    order: data.order ?? 0,
    trackingMode: data.trackingMode,
    unitLabel: data.unitLabel,
    targetValue: data.targetValue,
    targetPeriod: data.targetPeriod ?? 'daily',
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now,
  };
}

export async function loadHabits(userId: string): Promise<Habit[]> {
  const db = getFirebaseFirestore();
  const snapshot = await getDocs(collection(db, getHabitsCollectionPath(userId)));

  if (snapshot.empty) {
    const defaults = createDefaultHabits();
    await Promise.all(defaults.map((habit) => saveHabit(userId, habit)));
    return defaults;
  }

  return snapshot.docs
    .map((docSnap) => normalizeHabit({ id: docSnap.id, ...docSnap.data() } as Habit))
    .sort((a, b) => a.order - b.order);
}

export async function saveHabit(userId: string, habit: Habit): Promise<void> {
  const db = getFirebaseFirestore();
  const ref = doc(db, getHabitDocPath(userId, habit.id));
  const normalized = normalizeHabit({
    ...habit,
    updatedAt: new Date().toISOString(),
  });

  await setDoc(ref, normalized, { merge: true });
}

export async function saveHabits(userId: string, habits: Habit[]): Promise<void> {
  await Promise.all(habits.map((habit) => saveHabit(userId, habit)));
}

export async function deleteHabit(userId: string, habitId: string): Promise<void> {
  const db = getFirebaseFirestore();
  const logsSnapshot = await getDocs(
    collection(db, `${getHabitDocPath(userId, habitId)}/logs`),
  );

  const batch = writeBatch(db);
  logsSnapshot.docs.forEach((logDoc) => batch.delete(logDoc.ref));
  batch.delete(doc(db, getHabitDocPath(userId, habitId)));
  await batch.commit();
}

function getMonthDatePrefix(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

export async function loadLogsForMonth(
  userId: string,
  habitIds: string[],
  year: number,
  month: number,
): Promise<LogsByHabitId> {
  const db = getFirebaseFirestore();
  const prefix = getMonthDatePrefix(year, month);
  const result: LogsByHabitId = {};

  await Promise.all(
    habitIds.map(async (habitId) => {
      const snapshot = await getDocs(
        collection(db, `${getHabitDocPath(userId, habitId)}/logs`),
      );

      const logs: Record<string, HabitLog> = {};
      snapshot.docs.forEach((logDoc) => {
        const log = logDoc.data() as HabitLog;
        if (log.date?.startsWith(prefix)) {
          logs[log.date] = log;
        }
      });

      result[habitId] = logs;
    }),
  );

  return result;
}

export async function upsertLog(
  userId: string,
  habitId: string,
  log: HabitLog,
): Promise<void> {
  const db = getFirebaseFirestore();
  const ref = doc(db, getLogDocPath(userId, habitId, log.date));

  await setDoc(
    ref,
    {
      ...log,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

export async function deleteLog(
  userId: string,
  habitId: string,
  date: string,
): Promise<void> {
  const db = getFirebaseFirestore();
  await deleteDoc(doc(db, getLogDocPath(userId, habitId, date)));
}

export async function deleteLogsForMonth(
  userId: string,
  habitIds: string[],
  year: number,
  month: number,
): Promise<void> {
  const db = getFirebaseFirestore();
  const prefix = getMonthDatePrefix(year, month);
  const batch = writeBatch(db);
  let hasWrites = false;

  await Promise.all(
    habitIds.map(async (habitId) => {
      const snapshot = await getDocs(
        collection(db, `${getHabitDocPath(userId, habitId)}/logs`),
      );

      snapshot.docs.forEach((logDoc) => {
        const log = logDoc.data() as HabitLog;
        if (log.date?.startsWith(prefix)) {
          batch.delete(logDoc.ref);
          hasWrites = true;
        }
      });
    }),
  );

  if (hasWrites) {
    await batch.commit();
  }
}

export function getMonthDateKeys(year: number, month: number): string[] {
  const days = getDaysInMonth(year, month);
  return Array.from({ length: days }, (_, index) =>
    formatDateKey(year, month, index + 1),
  );
}
