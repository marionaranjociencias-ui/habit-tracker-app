import { useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { HabitGrid } from './components/HabitGrid';
import { HabitManager } from './components/HabitManager';
import { useHabits } from './hooks/useHabits';
import { useMonthCalendar } from './hooks/useMonthCalendar';
import { getDailyProgress, getGlobalPercentage } from './utils/calculations';
import { getMonthLabel } from './utils/dateHelpers';
import { exportHabitsToExcel } from './utils/exportExcel';
import './App.css';

function App() {
  const {
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
  } = useHabits();

  const weeks = useMonthCalendar(year, month);
  const globalPercentage = getGlobalPercentage(habits, year, month);
  const chartData = getDailyProgress(habits, year, month);

  const handleExportExcel = useCallback(() => {
    exportHabitsToExcel(habits, weeks, year, month);
  }, [habits, weeks, year, month]);

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <p className="app__tagline">Sí/No y cantidades — tu app de hábitos</p>
          <h1 className="app__title">Habit Tracker App</h1>
          <p className="app__phase">Fase 1 — Web app (datos en este navegador)</p>
        </div>
        <div className="app__month-nav">
          <button type="button" onClick={goToPreviousMonth} aria-label="Mes anterior">
            ‹
          </button>
          <span>{getMonthLabel(year, month)}</span>
          <button type="button" onClick={goToNextMonth} aria-label="Mes siguiente">
            ›
          </button>
        </div>
      </header>

      <Dashboard globalPercentage={globalPercentage} chartData={chartData} />

      <HabitManager onAdd={addHabit} onReset={resetMonth} onExportExcel={handleExportExcel} />

      <HabitGrid
        habits={habits}
        weeks={weeks}
        year={year}
        month={month}
        globalPercentage={globalPercentage}
        onToggle={toggleCheck}
        onSetValue={setValue}
        onRename={renameHabit}
        onUpdateUnit={updateUnit}
        onRemove={removeHabit}
      />

      <footer className="app__footer">
        <p>
          Hábitos con <strong>#</strong> aceptan números (lagartijas, pull-ups). Hábitos con{' '}
          <strong>✓</strong> son sí/no. Próxima fase: login con Gmail y datos en la nube.
        </p>
      </footer>
    </div>
  );
}

export default App;
