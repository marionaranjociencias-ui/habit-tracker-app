import { useCallback } from 'react';
import { AuthHeader } from './components/AuthHeader';
import { Dashboard } from './components/Dashboard';
import { HabitGrid } from './components/HabitGrid';
import { HabitManager } from './components/HabitManager';
import { LoginScreen } from './components/LoginScreen';
import { useAuth } from './hooks/useAuth';
import { useHabits } from './hooks/useHabits';
import { useMonthCalendar } from './hooks/useMonthCalendar';
import { getDailyProgress, getGlobalPercentage } from './utils/calculations';
import { getMonthLabel } from './utils/dateHelpers';
import { exportHabitsToExcel } from './utils/exportExcel';
import './App.css';

function AppContent({ userId }: { userId: string }) {
  const {
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
    resetMonth,
    goToPreviousMonth,
    goToNextMonth,
  } = useHabits(userId);

  const weeks = useMonthCalendar(year, month);
  const globalPercentage = getGlobalPercentage(habits, year, month);
  const chartData = getDailyProgress(habits, year, month);

  const handleExportExcel = useCallback(() => {
    exportHabitsToExcel(habits, weeks, year, month);
  }, [habits, weeks, year, month]);

  if (!isReady) {
    return (
      <div className="app-loading">
        <p>Cargando tus hábitos...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {error && (
        <div className="app__error" role="alert">
          {error}
        </div>
      )}
      <header className="app__header">
        <div>
          <p className="app__tagline">Sí/No y cantidades — tu app de hábitos</p>
          <h1 className="app__title">Habit Tracker App</h1>
          <p className="app__phase">Fase 3 — Datos sincronizados en la nube</p>
        </div>
        <div className="app__header-actions">
          <AuthHeader />
          <div className="app__month-nav">
            <button type="button" onClick={goToPreviousMonth} aria-label="Mes anterior">
              ‹
            </button>
            <span>{getMonthLabel(year, month)}</span>
            <button type="button" onClick={goToNextMonth} aria-label="Mes siguiente">
              ›
            </button>
          </div>
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
          <strong>✓</strong> son sí/no. Tus datos se sincronizan con tu cuenta de Google en todos
          tus dispositivos.
        </p>
      </footer>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <p>Verificando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <AppContent userId={user.uid} />;
}

export default App;
