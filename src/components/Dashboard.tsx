import type { DailyProgress } from '../types';
import { CharacterRow } from './CharacterRow';
import { MainAvatar } from './MainAvatar';
import { ProgressChart } from './ProgressChart';

type DashboardProps = {
  globalPercentage: number;
  chartData: DailyProgress[];
};

export function Dashboard({ globalPercentage, chartData }: DashboardProps) {
  return (
    <section className="dashboard">
      <div className="dashboard__left">
        <ProgressChart data={chartData} />
      </div>
      <div className="dashboard__center">
        <CharacterRow globalPercentage={globalPercentage} />
      </div>
      <div className="dashboard__right">
        <MainAvatar globalPercentage={globalPercentage} />
      </div>
    </section>
  );
}
