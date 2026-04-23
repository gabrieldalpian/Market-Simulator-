'use client';

import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface MiniChartProps {
  data: { price: number }[];
  width?: number;
  height?: number;
  positive?: boolean;
}

export default function MiniChart({ data, width = 100, height = 60, positive }: MiniChartProps) {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className="bg-gray-50 rounded" />;
  }

  const isUp = positive !== undefined ? positive : data[data.length - 1].price >= data[0].price;
  const color = isUp ? '#16a34a' : '#dc2626';
  
  // Calculate domain with better padding to show vertical movement
  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice;
  const padding = range * 0.2 || maxPrice * 0.05; // 20% padding for dramatic movement

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <YAxis hide domain={[minPrice - padding, maxPrice + padding]} />
          <Line
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
