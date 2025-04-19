import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '00:00', value: 8 },
  { time: '04:00', value: 24 },
  { time: '08:00', value: 32 },
  { time: '12:00', value: 16 },
  { time: '16:00', value: 24 },
  { time: '20:00', value: 32 },
  { time: '23:59', value: 16 },
];

export function ActivityChart() {
  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#888' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#888' }}
            domain={[0, 40]}
            ticks={[0, 8, 16, 24, 32]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: '8px 12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#6366F1"
            strokeWidth={2}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
