import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_HABITS } from '../data/characterForms';
import { loadMonthData, saveMonthToFirestore } from '../lib/habitStore';
import type { Habit, HabitKind } from '../types';

const SAVE_DEBOUNCE_MS = 400;

function createDefaultHabits(): Habit[] {
  return DEFAULT_HABITS.map((habit, index) => ({
    id: `habit-${index + 1}`,
    name: habit.name,
    kind: habit.kind,
    unit: habit.unit,
    checks: {},
    values: {},
  }));
}

export function useHabits(userId: string, initialYear?: number, initialMonth?: number) {
  const now = new Date();
  const [year, setYear] = useState(initialYear ?? now.getFullYear());
  const [month, setMonth] = useState(initialMonth ?? now.getMonth());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    setIsReady(false);
    setError(null);

    loadMonthData(userId, year, month)
      .then((data) => {
        if (cancelled) return;
        setHabits(data.habits);
        setIsReady(true);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Error al cargar hábitos:', err);
        setError('No se pudieron cargar tus hábitos. Revisa tu conexión.');
        setHabits(createDefaultHabits());
        setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, year, month]);

  useEffect(() => {
    if (!userId || !isReady) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      saveMonthToFirestore(userId, { year, month, habits }).catch((err) => {
        console.error('Error al guardar hábitos:', err);
        setError('No se pudieron guardar los cambios. Revisa tu conexión.');
      });
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [habits, isReady, month, userId, year]);

  const toggleCheck = useCallback((habitId: string, dateKey: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId || habit.kind !== 'boolean') return habit;
        const nextChecks = { ...habit.checks };
        if (nextChecks[dateKey]) {
          delete nextChecks[dateKey];
        } else {
          nextChecks[dateKey] = true;
        }
        return { ...habit, checks: nextChecks };
      }),
    );
  }, []);

  const setValue = useCallback((habitId: string, dateKey: string, rawValue: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId || habit.kind !== 'numeric') return habit;
        const nextValues = { ...habit.values };
        const trimmed = rawValue.trim();

        if (trimmed === '') {
          delete nextValues[dateKey];
        } else {
          const parsed = Number(trimmed);
          if (Number.isNaN(parsed) || parsed < 0) return habit;
          if (parsed === 0) {
            delete nextValues[dateKey];
          } else {
            nextValues[dateKey] = parsed;
          }
        }

        return { ...habit, values: nextValues };
      }),
    );
  }, []);

  const addHabit = useCallback((name: string, kind: HabitKind, unit: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setHabits((prev) => [
      ...prev,
      {
        id: `habit-${crypto.randomUUID()}`,
        name: trimmedName,
        kind,
        unit: kind === 'numeric' ? unit.trim() || 'reps' : '—',
        checks: {},
        values: {},
      },
    ]);
  }, []);

  const renameHabit = useCallback((habitId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setHabits((prev) =>
      prev.map((habit) => (habit.id === habitId ? { ...habit, name: trimmed } : habit)),
    );
  }, []);

  const updateUnit = useCallback((habitId: string, unit: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId || habit.kind !== 'numeric') return habit;
        const trimmed = unit.trim();
        if (!trimmed) return habit;
        return { ...habit, unit: trimmed };
      }),
    );
  }, []);

  const removeHabit = useCallback((habitId: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
  }, []);

  const moveHabitUp = useCallback((habitId: string) => {
    setHabits((prev) => {
      const index = prev.findIndex((habit) => habit.id === habitId);
      if (index <= 0) return prev;
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const moveHabitDown = useCallback((habitId: string) => {
    setHabits((prev) => {
      const index = prev.findIndex((habit) => habit.id === habitId);
      if (index < 0 || index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  const resetMonth = useCallback(() => {
    const confirmed = window.confirm('¿Reiniciar todos los hábitos de este mes?');
    if (!confirmed) return;
    setHabits(createDefaultHabits());
  }, []);

  const goToPreviousMonth = useCallback(() => {
    setMonth((prev) => {
      if (prev === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setMonth((prev) => {
      if (prev === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  return {
    year,
    month,
    habits,
    isReady,
    error,
    toggleCheck,
    setValue,
    addHabit,
    renameHabit,
    updateUnit,
    removeHabit,
    moveHabitUp,
    moveHabitDown,
    resetMonth,
    goToPreviousMonth,
    goToNextMonth,
  };
}
