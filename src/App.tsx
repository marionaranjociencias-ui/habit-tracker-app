import { useCallback } from 'react';
import { AuthHeader } from './components/AuthHeader';
import { CategoryManager } from './components/CategoryManager';
import { Dashboard } from './components/Dashboard';
import { HabitGrid } from './components/HabitGrid';
import { HabitManager } from './components/HabitManager';
import { LoginScreen } from './components/LoginScreen';
import { DEFAULT_CATEGORY_ID } from './data/defaultCategories';
import { useAuth } from './hooks/useAuth';
import { useCategories } from './hooks/useCategories';
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
    logsByHabitId,
    isReady: habitsReady,
    error: habitsError,
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
  } = useHabits(userId);

  const {
    categories,
    isReady: categoriesReady,
    error: categoriesError,
    addCategory,
    renameCategory,
    updateCategoryColor,
    removeCategory,
    getNextPaletteColor,
  } = useCategories(userId);

  const weeks = useMonthCalendar(year, month);
  const globalPercentage = getGlobalPercentage(habits, logsByHabitId, year, month);
  const chartData = getDailyProgress(habits, logsByHabitId, year, month);

  const handleExportExcel = useCallback(() => {
    exportHabitsToExcel(habits, categories, logsByHabitId, weeks, year, month);
  }, [habits, categories, logsByHabitId, weeks, year, month]);

  const habitCountByCategory = useCallback(
    (categoryId: string) => habits.filter((habit) => habit.categoryId === categoryId).length,
    [habits],
  );

  const handleRemoveCategory = useCallback(
    (categoryId: string) => {
      const fallback = categories.find((category) => category.id !== categoryId);
      if (!fallback) return;
      reassignCategory(categoryId, fallback.id);
      removeCategory(categoryId);
    },
    [categories, reassignCategory, removeCategory],
  );

  const isReady = habitsReady && categoriesReady;
  const error = habitsError ?? categoriesError;

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
          <p className="app__tagline">Modo simple o con unidades — tu app de hábitos</p>
          <h1 className="app__title">Habit Tracker App</h1>
          <p className="app__phase">Hábitos persistentes con registros diarios en la nube</p>
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

      <CategoryManager
        categories={categories}
        habitCountByCategory={habitCountByCategory}
        onAdd={addCategory}
        onRename={renameCategory}
        onUpdateColor={updateCategoryColor}
        onRemove={handleRemoveCategory}
        getNextPaletteColor={getNextPaletteColor}
      />

      <HabitManager
        categories={categories}
        defaultCategoryId={categories[0]?.id ?? DEFAULT_CATEGORY_ID}
        onAdd={addHabit}
        onReset={resetMonth}
        onExportExcel={handleExportExcel}
      />

      <HabitGrid
        habits={habits}
        categories={categories}
        logsByHabitId={logsByHabitId}
        weeks={weeks}
        year={year}
        month={month}
        globalPercentage={globalPercentage}
        onToggleSimple={toggleSimple}
        onSetUnitsValue={setUnitsValue}
        onIncrementUnits={incrementUnits}
        onRename={renameHabit}
        onUpdateUnitLabel={updateUnitLabel}
        onUpdateTargetValue={updateTargetValue}
        onUpdateTrackingMode={updateTrackingMode}
        onUpdateCategory={updateHabitCategory}
        onRemove={removeHabit}
        onMoveUp={moveHabitUp}
        onMoveDown={moveHabitDown}
      />

      <footer className="app__footer">
        <p>
          Marca hábitos en <strong>modo simple</strong> (sí/no) o registra cantidades en{' '}
          <strong>modo con unidades</strong>. Las metas diarias se muestran en el grid. Tus datos
          se sincronizan con tu cuenta de Google.
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
