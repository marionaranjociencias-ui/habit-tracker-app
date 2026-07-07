import type { DayInfo, WeekInfo } from '../types';

const DAY_ABBR = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

export function formatDateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getMonthLabel(year: number, month: number): string {
  const formatter = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });
  return formatter.format(new Date(year, month, 1));
}

export function buildMonthWeeks(year: number, month: number): WeekInfo[] {
  const daysInMonth = getDaysInMonth(year, month);
  const weeks: WeekInfo[] = [];

  for (let start = 1, weekNumber = 1; start <= daysInMonth; start += 7, weekNumber += 1) {
    const days: DayInfo[] = [];
    const end = Math.min(start + 6, daysInMonth);

    for (let day = start; day <= end; day += 1) {
      const date = new Date(year, month, day);
      days.push({
        dateKey: formatDateKey(year, month, day),
        dayNumber: day,
        dayAbbr: DAY_ABBR[date.getDay()],
        inMonth: true,
      });
    }

    weeks.push({ weekNumber, days });
  }

  return weeks;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2).replace('.', ',')}%`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('es-MX');
}
