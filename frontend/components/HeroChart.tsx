'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Jun', value: 320 },
  { name: 'Jul', value: 540 },
  { name: 'Aug', value: 860 },
  { name: 'Sep', value: 1130 },
  { name: 'Oct', value: 1475 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-[color:var(--surface-card)] rounded-lg shadow-lg border border-border-subtle">
        <p className="text-sm font-semibold text-text-primary">{label}</p>
        <p className="text-xs text-text-secondary">
          {`New followers: ${new Intl.NumberFormat().format(payload[0].value)}`}
        </p>
      </div>
    );
  }
  return null;
};

const HeroChart: React.FC = () => {
  return (
    <div className="w-full h-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="heroChartColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.12} />
              <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide domain={['dataMin - 100000', 'dataMax + 100000']} />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: 'var(--accent-primary)',
              strokeWidth: 1,
              strokeDasharray: '3 3',
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--accent-primary)"
            fill="url(#heroChartColor)"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 5,
              strokeWidth: 2,
              fill: 'var(--accent-primary)',
              stroke: 'var(--surface-card)',
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HeroChart;

