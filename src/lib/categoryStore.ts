import { doc, getDoc, setDoc } from 'firebase/firestore';
import { createDefaultCategories } from '../data/defaultCategories';
import type { Category, UserSettings } from '../types';
import { getFirebaseFirestore } from './firebase';

export function getSettingsDocPath(userId: string): string {
  return `users/${userId}/settings`;
}

function normalizeCategories(categories: Category[]): Category[] {
  return categories.map((category) => ({
    id: category.id,
    name: category.name.trim() || 'Sin nombre',
    color: category.color || '#5b9bd5',
  }));
}

export async function loadUserCategories(userId: string): Promise<Category[]> {
  const db = getFirebaseFirestore();
  const ref = doc(db, getSettingsDocPath(userId));
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return createDefaultCategories();
  }

  const data = snapshot.data() as UserSettings;
  const categories = data.categories ?? [];

  if (categories.length === 0) {
    return createDefaultCategories();
  }

  return normalizeCategories(categories);
}

export async function saveUserCategories(userId: string, categories: Category[]): Promise<void> {
  const db = getFirebaseFirestore();
  const ref = doc(db, getSettingsDocPath(userId));

  await setDoc(
    ref,
    {
      categories: normalizeCategories(categories),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}
