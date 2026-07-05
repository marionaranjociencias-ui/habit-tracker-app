import { useMemo } from 'react';
import type { WeekInfo } from '../types';
import { buildMonthWeeks } from '../utils/dateHelpers';

export function useMonthCalendar(year: number, month: number): WeekInfo[] {
  return useMemo(() => buildMonthWeeks(year, month), [year, month]);
}
