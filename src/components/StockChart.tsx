'use client';

import { useMarketStore } from '@/lib/store';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface StockChartProps {
  ticker: string;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

interface TooltipPayloadEntry {
  value: number;
  payload: { timestamp: number; price: number };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-md">
      <div className="text-xs text-gray-500">
        {formatTime(data.payload.timestamp)}
      </div>
      <div className="font-mono font-semibold text-base text-gray-900">
        ${data.value.toFixed(2)}
      </div>
    </div>
  );
}

export default function StockChart({ ticker }: StockChartProps) {
  const history = useMarketStore((s) => s.priceHistory[ticker] || []);

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center h-[400px] shadow-sm">
        <p className="text-gray-400 text-sm">No price data available</p>
      </div>
    );
  }

  const prices = history.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice;
  const padding = (range * 0.15) || (maxPrice * 0.02); // Increased padding for better vertical display

  const isPositive =
    history.length >= 2 &&
    history[history.length - 1].price >= history[0].price;
  const lineColor = isPositive ? '#16a34a' : '#dc2626';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
        Price Chart
      </h3>
      <div className="h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history}>
            <defs>
              <linearGradient id={`stockGrad-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.2} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              stroke="#cbd5e1"
              tick={{ fontSize: 12 }}
              minTickGap={50}
              axisLine={false}
            />
            <YAxis
              domain={[minPrice - padding, maxPrice + padding]}
              tickFormatter={(val: number) => `$${val.toFixed(2)}`}
              stroke="#cbd5e1"
              tick={{ fontSize: 12 }}
              width={70}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="natural"
              dataKey="price"
              stroke={lineColor}
              strokeWidth={3}
              fill={`url(#stockGrad-${ticker})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
