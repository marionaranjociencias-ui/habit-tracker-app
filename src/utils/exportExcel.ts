import * as XLSX from 'xlsx';
import type { Category, Habit, LogsByHabitId, WeekInfo } from '../types';
import { getActiveForm, getGlobalPercentage, getHabitStats, getLevel } from './calculations';
import { getMonthLabel } from './dateHelpers';
import { formatTarget, getLogDisplayValue, getModeLabel } from './habitTracking';

function getCategoryName(categories: Category[], categoryId: string): string {
  return categories.find((category) => category.id === categoryId)?.name ?? '—';
}

function buildTrackingSheet(
  habits: Habit[],
  categories: Category[],
  logsByHabitId: LogsByHabitId,
  weeks: WeekInfo[],
  year: number,
  month: number,
): XLSX.WorkSheet {
  const monthLabel = getMonthLabel(year, month);
  const globalPercentage = getGlobalPercentage(habits, logsByHabitId, year, month);

  const weekHeaderRow: (string | number)[] = [
    'Orden',
    'Hábito',
    'Categoría',
    'Modo',
    'Unidad',
    'Meta',
  ];
  const dayHeaderRow: string[] = ['', '', '', '', '', ''];
  const merges: XLSX.Range[] = [];

  let colIndex = 6;
  weeks.forEach((week) => {
    const startCol = colIndex;
    week.days.forEach((day, dayIndex) => {
      if (dayIndex === 0) weekHeaderRow.push(`semana ${week.weekNumber}`);
      else weekHeaderRow.push('');
      dayHeaderRow.push(`${day.dayNumber} ${day.dayAbbr}`);
      colIndex += 1;
    });
    if (week.days.length > 1) {
      merges.push({ s: { r: 2, c: startCol }, e: { r: 2, c: colIndex - 1 } });
    }
  });

  weekHeaderRow.push('Total/Mejor', 'Días meta', 'Racha', 'Progreso %');
  dayHeaderRow.push('', '', '', '');

  const dataRows: (string | number)[][] = [];
  let order = 0;

  habits.forEach((habit, index) => {
    const prevCategoryId = index > 0 ? habits[index - 1].categoryId : null;
    if (habit.categoryId !== prevCategoryId) {
      const categoryName = getCategoryName(categories, habit.categoryId).toUpperCase();
      const headerRow: (string | number)[] = [categoryName];
      for (let i = 1; i < weekHeaderRow.length; i += 1) {
        headerRow.push('');
      }
      dataRows.push(headerRow);
    }

    order += 1;
    const stats = getHabitStats(habit, logsByHabitId, year, month);
    const row: (string | number)[] = [
      order,
      habit.name,
      getCategoryName(categories, habit.categoryId),
      getModeLabel(habit.trackingMode),
      habit.unitLabel ?? '—',
      formatTarget(habit),
    ];

    weeks.forEach((week) => {
      week.days.forEach((day) => {
        const log = logsByHabitId[habit.id]?.[day.dateKey];
        row.push(getLogDisplayValue(habit, log));
      });
    });

    row.push(
      habit.trackingMode === 'units' ? stats.totalAmount : stats.activeDays,
      `${stats.targetDays}/${stats.totalDays}`,
      stats.streak,
      Number(stats.percentage.toFixed(2)),
    );
    dataRows.push(row);
  });

  const sheetData: (string | number)[][] = [
    [`Habit Tracker App — ${monthLabel}`],
    [],
    weekHeaderRow,
    dayHeaderRow,
    ...dataRows,
    [],
    ['Progreso global completado', Number(globalPercentage.toFixed(2))],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(colIndex + 3, 9) } },
    ...merges,
  ];
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 14 },
    { wch: 14 },
    { wch: 10 },
    { wch: 12 },
    ...Array.from({ length: colIndex }, () => ({ wch: 10 })),
  ];
  return worksheet;
}

function buildSummarySheet(
  habits: Habit[],
  categories: Category[],
  logsByHabitId: LogsByHabitId,
  year: number,
  month: number,
): XLSX.WorkSheet {
  const monthLabel = getMonthLabel(year, month);
  const globalPercentage = getGlobalPercentage(habits, logsByHabitId, year, month);

  const sheetData: (string | number)[][] = [
    ['Resumen del mes', monthLabel],
    ['Progreso global (%)', Number(globalPercentage.toFixed(2))],
    ['Nivel alcanzado', getLevel(globalPercentage)],
    ['Forma activa', getActiveForm(globalPercentage).name],
    [],
    [
      'Orden',
      'Hábito',
      'Categoría',
      'Modo',
      'Unidad',
      'Meta',
      'Total',
      'Mejor/Prom',
      'Días meta',
      'Racha',
      'Progreso (%)',
    ],
    ...habits.map((habit, index) => {
      const stats = getHabitStats(habit, logsByHabitId, year, month);
      return [
        index + 1,
        habit.name,
        getCategoryName(categories, habit.categoryId),
        getModeLabel(habit.trackingMode),
        habit.unitLabel ?? '—',
        formatTarget(habit),
        habit.trackingMode === 'units' ? stats.totalAmount : '—',
        habit.trackingMode === 'units' ? stats.best : '—',
        `${stats.targetDays}/${stats.totalDays}`,
        stats.streak,
        Number(stats.percentage.toFixed(2)),
      ];
    }),
  ];

  return XLSX.utils.aoa_to_sheet(sheetData);
}

export function exportHabitsToExcel(
  habits: Habit[],
  categories: Category[],
  logsByHabitId: LogsByHabitId,
  weeks: WeekInfo[],
  year: number,
  month: number,
): void {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    buildTrackingSheet(habits, categories, logsByHabitId, weeks, year, month),
    'Hábitos',
  );
  XLSX.utils.book_append_sheet(
    workbook,
    buildSummarySheet(habits, categories, logsByHabitId, year, month),
    'Resumen',
  );
  XLSX.writeFile(workbook, `habit-tracker-app-${year}-${String(month + 1).padStart(2, '0')}.xlsx`);
}
