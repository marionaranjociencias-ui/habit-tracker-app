export type TrackingMode = 'simple' | 'units';
export type TargetPeriod = 'daily';

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type Habit = {
  id: string;
  name: string;
  categoryId: string;
  order: number;
  trackingMode: TrackingMode;
  unitLabel?: string;
  targetValue?: number;
  targetPeriod: TargetPeriod;
  createdAt: string;
  updatedAt: string;
};

export type HabitLog = {
  date: string;
  completed: boolean;
  value?: number;
  updatedAt: string;
};

export type CharacterForm = {
  id: string;
  name: string;
  threshold: number;
  image: string;
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
  targetDays: number;
  targetPercentage: number;
  streak: number;
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
  trackingMode: TrackingMode;
  unitLabel?: string;
  targetValue?: number;
  categoryId: string;
};

export type UserSettings = {
  categories: Category[];
  updatedAt: string;
};

export type LogsByHabitId = Record<string, Record<string, HabitLog>>;
