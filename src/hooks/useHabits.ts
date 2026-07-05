import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_HABITS, STORAGE_PREFIX } from '../data/characterForms';
import type { Habit, HabitKind, MonthData } from '../types';

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

function getStorageKey(year: number, month: number): string {
  const m = String(month + 1).padStart(2, '0');
  return `${STORAGE_PREFIX}-${year}-${m}`;
}

function loadMonthData(year: number, month: number): MonthData {
  const key = getStorageKey(year, month);
  const raw = localStorage.getItem(key);

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as MonthData;
      return {
        ...parsed,
        habits: parsed.habits.map((habit) => ({
          ...habit,
          kind: habit.kind ?? 'boolean',
          unit: habit.unit ?? '—',
          checks: habit.checks ?? {},
          values: habit.values ?? {},
        })),
      };
    } catch {
      // fall through to defaults
    }
  }

  return { year, month, habits: createDefaultHabits() };
}

export function useHabits(initialYear?: number, initialMonth?: number) {
  const now = new Date();
  const [year, setYear] = useState(initialYear ?? now.getFullYear());
  const [month, setMonth] = useState(initialMonth ?? now.getMonth());
  const [habits, setHabits] = useState<Habit[]>(() => loadMonthData(year, month).habits);

  const storageKey = useMemo(() => getStorageKey(year, month), [year, month]);

  useEffect(() => {
    setHabits(loadMonthData(year, month).habits);
  }, [year, month]);

  useEffect(() => {
    const payload: MonthData = { year, month, habits };
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [habits, month, storageKey, year]);

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
    toggleCheck,
    setValue,
    addHabit,
    renameHabit,
    updateUnit,
    removeHabit,
    resetMonth,
    goToPreviousMonth,
    goToNextMonth,
  };
}
