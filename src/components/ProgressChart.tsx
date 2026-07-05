import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DailyProgress } from '../types';

type ProgressChartProps = {
  data: DailyProgress[];
};

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <div className="progress-chart">
      <h3 className="progress-chart__title">Tendencia del mes</h3>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7EC8E3" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#7EC8E3" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8f4f8" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#7a8a94" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#7a8a94" />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Progreso']}
            labelFormatter={(label) => `Día ${label}`}
          />
          <Area
            type="monotone"
            dataKey="percentage"
            stroke="#5eb3d4"
            fill="url(#progressGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
