import { useCallback, useEffect, useRef, useState } from 'react';
import {
  deleteHabit,
  deleteLog,
  deleteLogsForMonth,
  loadHabits,
  loadLogsForMonth,
  saveHabit,
  upsertLog,
} from '../lib/habitStore';
import type { Habit, HabitLog, LogsByHabitId, TrackingMode } from '../types';
import { computeCompleted, isSimpleMode, isUnitsMode } from '../utils/habitTracking';

const SAVE_DEBOUNCE_MS = 400;

type PendingHabitSave = { userId: string; habit: Habit };
type PendingLogSave = { userId: string; habitId: string; log: HabitLog };
type PendingLogDelete = { userId: string; habitId: string; date: string };

export function useHabits(userId: string, initialYear?: number, initialMonth?: number) {
  const now = new Date();
  const [year, setYear] = useState(initialYear ?? now.getFullYear());
  const [month, setMonth] = useState(initialMonth ?? now.getMonth());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logsByHabitId, setLogsByHabitId] = useState<LogsByHabitId>({});
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const habitSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingHabitsRef = useRef<Map<string, PendingHabitSave>>(new Map());
  const pendingLogsRef = useRef<Map<string, PendingLogSave>>(new Map());
  const pendingLogDeletesRef = useRef<Map<string, PendingLogDelete>>(new Map());

  const flushHabitSaves = useCallback(async () => {
    const pending = [...pendingHabitsRef.current.values()];
    pendingHabitsRef.current.clear();
    await Promise.all(pending.map(({ userId: uid, habit }) => saveHabit(uid, habit)));
  }, []);

  const flushLogSaves = useCallback(async () => {
    const pendingDeletes = [...pendingLogDeletesRef.current.values()];
    const pendingSaves = [...pendingLogsRef.current.values()];
    pendingLogDeletesRef.current.clear();
    pendingLogsRef.current.clear();

    await Promise.all([
      ...pendingDeletes.map(({ userId: uid, habitId, date }) => deleteLog(uid, habitId, date)),
      ...pendingSaves.map(({ userId: uid, habitId, log }) => upsertLog(uid, habitId, log)),
    ]);
  }, []);

  const queueHabitSave = useCallback(
    (habit: Habit) => {
      if (!userId) return;
      pendingHabitsRef.current.set(habit.id, { userId, habit });
      if (habitSaveTimerRef.current) clearTimeout(habitSaveTimerRef.current);
      habitSaveTimerRef.current = setTimeout(() => {
        flushHabitSaves().catch((err) => {
          console.error('Error al guardar hábito:', err);
          setError('No se pudieron guardar los cambios. Revisa tu conexión.');
        });
      }, SAVE_DEBOUNCE_MS);
    },
    [flushHabitSaves, userId],
  );

  const queueLogSave = useCallback(
    (habitId: string, log: HabitLog) => {
      if (!userId) return;
      pendingLogDeletesRef.current.delete(`${habitId}:${log.date}`);
      pendingLogsRef.current.set(`${habitId}:${log.date}`, { userId, habitId, log });
      if (logSaveTimerRef.current) clearTimeout(logSaveTimerRef.current);
      logSaveTimerRef.current = setTimeout(() => {
        flushLogSaves().catch((err) => {
          console.error('Error al guardar registro:', err);
          setError('No se pudieron guardar los cambios. Revisa tu conexión.');
        });
      }, SAVE_DEBOUNCE_MS);
    },
    [flushLogSaves, userId],
  );

  const queueLogDelete = useCallback(
    (habitId: string, date: string) => {
      if (!userId) return;
      pendingLogsRef.current.delete(`${habitId}:${date}`);
      pendingLogDeletesRef.current.set(`${habitId}:${date}`, { userId, habitId, date });
      if (logSaveTimerRef.current) clearTimeout(logSaveTimerRef.current);
      logSaveTimerRef.current = setTimeout(() => {
        flushLogSaves().catch((err) => {
          console.error('Error al eliminar registro:', err);
          setError('No se pudieron guardar los cambios. Revisa tu conexión.');
        });
      }, SAVE_DEBOUNCE_MS);
    },
    [flushLogSaves, userId],
  );

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    setIsReady(false);
    setError(null);

    loadHabits(userId)
      .then(async (loadedHabits) => {
        if (cancelled) return;
        const logs = await loadLogsForMonth(
          userId,
          loadedHabits.map((habit) => habit.id),
          year,
          month,
        );
        if (cancelled) return;
        setHabits(loadedHabits);
        setLogsByHabitId(logs);
        setIsReady(true);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Error al cargar hábitos:', err);
        setError('No se pudieron cargar tus hábitos. Revisa tu conexión.');
        setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || !isReady || habits.length === 0) return;

    let cancelled = false;
    loadLogsForMonth(
      userId,
      habits.map((habit) => habit.id),
      year,
      month,
    )
      .then((logs) => {
        if (!cancelled) setLogsByHabitId(logs);
      })
      .catch((err) => {
        console.error('Error al cargar registros del mes:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, year, month, isReady, habits.length]);

  const updateHabits = useCallback(
    (updater: (prev: Habit[]) => Habit[]) => {
      setHabits((prev) => {
        const next = updater(prev);
        next.forEach((habit, index) => {
          const prevHabit = prev.find((item) => item.id === habit.id);
          if (!prevHabit || JSON.stringify(prevHabit) !== JSON.stringify(habit)) {
            queueHabitSave({ ...habit, order: index });
          }
        });
        return next.map((habit, index) => ({ ...habit, order: index }));
      });
    },
    [queueHabitSave],
  );

  const updateLog = useCallback(
    (habit: Habit, date: string, nextLog: HabitLog | null) => {
      setLogsByHabitId((prev) => {
        const habitLogs = { ...(prev[habit.id] ?? {}) };
        if (nextLog) {
          habitLogs[date] = nextLog;
          queueLogSave(habit.id, nextLog);
        } else {
          delete habitLogs[date];
          queueLogDelete(habit.id, date);
        }
        return { ...prev, [habit.id]: habitLogs };
      });
    },
    [queueLogDelete, queueLogSave],
  );

  const toggleSimple = useCallback(
    (habitId: string, date: string) => {
      const habit = habits.find((item) => item.id === habitId);
      if (!habit || !isSimpleMode(habit)) return;

      const current = logsByHabitId[habitId]?.[date];
      const completed = !current?.completed;
      if (!completed) {
        updateLog(habit, date, null);
        return;
      }

      updateLog(habit, date, {
        date,
        completed: true,
        updatedAt: new Date().toISOString(),
      });
    },
    [habits, logsByHabitId, updateLog],
  );

  const setUnitsValue = useCallback(
    (habitId: string, date: string, rawValue: string) => {
      const habit = habits.find((item) => item.id === habitId);
      if (!habit || !isUnitsMode(habit)) return;

      const trimmed = rawValue.trim();
      if (trimmed === '') {
        updateLog(habit, date, null);
        return;
      }

      const parsed = Number(trimmed);
      if (Number.isNaN(parsed) || parsed < 0) return;
      if (parsed === 0) {
        updateLog(habit, date, null);
        return;
      }

      updateLog(habit, date, {
        date,
        value: parsed,
        completed: computeCompleted(habit, parsed),
        updatedAt: new Date().toISOString(),
      });
    },
    [habits, updateLog],
  );

  const incrementUnits = useCallback(
    (habitId: string, date: string, delta = 1) => {
      const habit = habits.find((item) => item.id === habitId);
      if (!habit || !isUnitsMode(habit)) return;

      const current = logsByHabitId[habitId]?.[date]?.value ?? 0;
      const nextValue = current + delta;
      if (nextValue <= 0) {
        updateLog(habit, date, null);
        return;
      }

      updateLog(habit, date, {
        date,
        value: nextValue,
        completed: computeCompleted(habit, nextValue),
        updatedAt: new Date().toISOString(),
      });
    },
    [habits, logsByHabitId, updateLog],
  );

  const addHabit = useCallback(
    (
      name: string,
      trackingMode: TrackingMode,
      categoryId: string,
      unitLabel?: string,
      targetValue?: number,
    ) => {
      const trimmedName = name.trim();
      if (!trimmedName) return;

      const now = new Date().toISOString();
      const habit: Habit = {
        id: `habit-${crypto.randomUUID()}`,
        name: trimmedName,
        categoryId,
        order: habits.length,
        trackingMode,
        unitLabel: trackingMode === 'units' ? unitLabel?.trim() || 'reps' : undefined,
        targetValue: trackingMode === 'units' && targetValue && targetValue > 0 ? targetValue : undefined,
        targetPeriod: 'daily',
        createdAt: now,
        updatedAt: now,
      };

      setHabits((prev) => [...prev, habit]);
      queueHabitSave(habit);
    },
    [habits.length, queueHabitSave],
  );

  const updateHabit = useCallback(
    (habitId: string, patch: Partial<Pick<Habit, 'name' | 'unitLabel' | 'targetValue' | 'categoryId'>>) => {
      updateHabits((prev) =>
        prev.map((habit) => {
          if (habit.id !== habitId) return habit;
          return {
            ...habit,
            ...patch,
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [updateHabits],
  );

  const updateTrackingMode = useCallback(
    (habitId: string, trackingMode: TrackingMode) => {
      const habit = habits.find((item) => item.id === habitId);
      if (!habit || habit.trackingMode === trackingMode) return;

      const confirmed = window.confirm(
        'Al cambiar el modo, la forma de registrar este hábito cambiará. Tus registros anteriores se conservan.',
      );
      if (!confirmed) return;

      updateHabits((prev) =>
        prev.map((item) => {
          if (item.id !== habitId) return item;
          if (trackingMode === 'simple') {
            return {
              ...item,
              trackingMode,
              unitLabel: undefined,
              targetValue: undefined,
              updatedAt: new Date().toISOString(),
            };
          }
          return {
            ...item,
            trackingMode,
            unitLabel: item.unitLabel || 'reps',
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [habits, updateHabits],
  );

  const renameHabit = useCallback(
    (habitId: string, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      updateHabit(habitId, { name: trimmed });
    },
    [updateHabit],
  );

  const updateUnitLabel = useCallback(
    (habitId: string, unitLabel: string) => {
      const trimmed = unitLabel.trim();
      if (!trimmed) return;
      updateHabit(habitId, { unitLabel: trimmed });
    },
    [updateHabit],
  );

  const updateTargetValue = useCallback(
    (habitId: string, rawValue: string) => {
      const trimmed = rawValue.trim();
      if (!trimmed) {
        updateHabit(habitId, { targetValue: undefined });
        return;
      }
      const parsed = Number(trimmed);
      if (Number.isNaN(parsed) || parsed <= 0) return;
      updateHabit(habitId, { targetValue: parsed });
    },
    [updateHabit],
  );

  const updateHabitCategory = useCallback(
    (habitId: string, categoryId: string) => {
      updateHabit(habitId, { categoryId });
    },
    [updateHabit],
  );

  const reassignCategory = useCallback(
    (fromCategoryId: string, toCategoryId: string) => {
      updateHabits((prev) =>
        prev.map((habit) =>
          habit.categoryId === fromCategoryId ? { ...habit, categoryId: toCategoryId } : habit,
        ),
      );
    },
    [updateHabits],
  );

  const removeHabit = useCallback(
    async (habitId: string) => {
      setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
      setLogsByHabitId((prev) => {
        const next = { ...prev };
        delete next[habitId];
        return next;
      });
      try {
        await deleteHabit(userId, habitId);
      } catch (err) {
        console.error('Error al eliminar hábito:', err);
        setError('No se pudo eliminar el hábito.');
      }
    },
    [userId],
  );

  const moveHabitUp = useCallback(
    (habitId: string) => {
      updateHabits((prev) => {
        const index = prev.findIndex((habit) => habit.id === habitId);
        if (index <= 0) return prev;
        const next = [...prev];
        [next[index - 1], next[index]] = [next[index], next[index - 1]];
        return next;
      });
    },
    [updateHabits],
  );

  const moveHabitDown = useCallback(
    (habitId: string) => {
      updateHabits((prev) => {
        const index = prev.findIndex((habit) => habit.id === habitId);
        if (index < 0 || index >= prev.length - 1) return prev;
        const next = [...prev];
        [next[index], next[index + 1]] = [next[index + 1], next[index]];
        return next;
      });
    },
    [updateHabits],
  );

  const resetMonth = useCallback(async () => {
    const confirmed = window.confirm(
      '¿Borrar todos los registros de este mes? Los hábitos se conservan.',
    );
    if (!confirmed) return;

    const habitIds = habits.map((habit) => habit.id);
    try {
      await deleteLogsForMonth(userId, habitIds, year, month);
      setLogsByHabitId(() => {
        const next: LogsByHabitId = {};
        habitIds.forEach((habitId) => {
          next[habitId] = {};
        });
        return next;
      });
    } catch (err) {
      console.error('Error al reiniciar mes:', err);
      setError('No se pudo reiniciar el mes.');
    }
  }, [habits, month, userId, year]);

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
    logsByHabitId,
    isReady,
    error,
    toggleSimple,
    setUnitsValue,
    incrementUnits,
    addHabit,
    renameHabit,
    updateUnitLabel,
    updateTargetValue,
    updateTrackingMode,
    updateHabitCategory,
    reassignCategory,
    removeHabit,
    moveHabitUp,
    moveHabitDown,
    resetMonth,
    goToPreviousMonth,
    goToNextMonth,
  };
}
