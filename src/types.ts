export type HabitKind = 'boolean' | 'numeric';

export type Habit = {
  id: string;
  name: string;
  kind: HabitKind;
  unit: string;
  checks: Record<string, boolean>;
  values: Record<string, number>;
};

export type CharacterForm = {
  id: string;
  name: string;
  threshold: number;
  image: string;
};

export type MonthData = {
  year: number;
  month: number;
  habits: Habit[];
};

export type DayInfo = {
  dateKey: string;
  dayNumber: number;
  dayAbbr: string;
  inMonth: boolean;
};

export type WeekInfo = {
  weekNumber: number;
  days: DayInfo[];
};

export type HabitStats = {
  habitId: string;
  activeDays: number;
  totalDays: number;
  percentage: number;
  totalAmount: number;
  average: number;
  best: number;
};

export type DailyProgress = {
  dateKey: string;
  label: string;
  percentage: number;
};

export type DefaultHabitSeed = {
  name: string;
  kind: HabitKind;
  unit: string;
};
