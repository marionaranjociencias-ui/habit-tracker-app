import { useCallback, useEffect, useRef, useState } from 'react';
import { CATEGORY_COLOR_PALETTE, createDefaultCategories } from '../data/defaultCategories';
import { loadUserCategories, saveUserCategories } from '../lib/categoryStore';
import type { Category } from '../types';

const SAVE_DEBOUNCE_MS = 400;

export function useCategories(userId: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    setIsReady(false);
    setError(null);

    loadUserCategories(userId)
      .then((loaded) => {
        if (cancelled) return;
        setCategories(loaded);
        setIsReady(true);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Error al cargar categorías:', err);
        setError('No se pudieron cargar las categorías.');
        setCategories(createDefaultCategories());
        setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || !isReady) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      saveUserCategories(userId, categories).catch((err) => {
        console.error('Error al guardar categorías:', err);
        setError('No se pudieron guardar las categorías.');
      });
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [categories, isReady, userId]);

  const addCategory = useCallback((name: string, color: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setCategories((prev) => [
      ...prev,
      {
        id: `cat-${crypto.randomUUID()}`,
        name: trimmed,
        color,
      },
    ]);
  }, []);

  const renameCategory = useCallback((categoryId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId ? { ...category, name: trimmed } : category,
      ),
    );
  }, []);

  const updateCategoryColor = useCallback((categoryId: string, color: string) => {
    setCategories((prev) =>
      prev.map((category) => (category.id === categoryId ? { ...category, color } : category)),
    );
  }, []);

  const removeCategory = useCallback((categoryId: string) => {
    setCategories((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((category) => category.id !== categoryId);
    });
  }, []);

  const getNextPaletteColor = useCallback((): string => {
    const usedColors = new Set(categories.map((category) => category.color));
    const available = CATEGORY_COLOR_PALETTE.find((color) => !usedColors.has(color));
    return available ?? CATEGORY_COLOR_PALETTE[categories.length % CATEGORY_COLOR_PALETTE.length];
  }, [categories]);

  return {
    categories,
    isReady,
    error,
    addCategory,
    renameCategory,
    updateCategoryColor,
    removeCategory,
    getNextPaletteColor,
  };
}
