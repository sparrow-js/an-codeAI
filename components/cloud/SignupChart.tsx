'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartDataItem {
  date: string;
  count: number;
  label: string;
}

interface SignupChartProps {
  data: ChartDataItem[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-800 text-white text-xs rounded px-3 py-2 shadow-lg border border-zinc-700">
        <div className="font-semibold mb-1">
          {new Date(data.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </div>
        <div className="text-gray-400">
          New Users: <span className="text-blue-400 font-semibold">{data.count}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function SignupChart({ data }: SignupChartProps) {
  // Check if all data points are zero
  const hasData = data.some(d => d.count > 0);
  const totalSignups = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="h-64 w-full relative">
      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-gray-500 text-sm">No signups in this period</div>
            <div className="text-gray-600 text-xs mt-1">Data will appear here once users sign up</div>
          </div>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data}
          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#3f3f46" 
            vertical={false}
          />
          <XAxis 
            dataKey="label" 
            stroke="#71717a"
            tick={{ fill: '#a1a1aa', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#3f3f46' }}
          />
          <YAxis 
            stroke="#71717a"
            tick={{ fill: '#a1a1aa', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#3f3f46' }}
            allowDecimals={false}
            width={40}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
          <Bar 
            dataKey="count" 
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
            animationDuration={500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

