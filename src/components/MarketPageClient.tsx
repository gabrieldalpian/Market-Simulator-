'use client';

import { useMemo } from 'react';
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
import MarketTable from './MarketTable';
import EventButtons from './EventButtons';
import EventFeed from './EventFeed';

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function MarketPageClient() {
  const stocks = useMarketStore((s) => s.stocks);
  const priceHistory = useMarketStore((s) => s.priceHistory);

  const marketIndex = useMemo(() => {
    const tickers = Object.keys(priceHistory);
    if (tickers.length === 0) return [];
    const refHistory = priceHistory[tickers[0]] || [];
    return refHistory.map((_, idx) => {
      let sum = 0;
      let count = 0;
      for (const ticker of tickers) {
        const h = priceHistory[ticker];
        if (h && h[idx]) {
          const base = h[0]?.price || 1;
          sum += (h[idx].price / base) * 100;
          count++;
        }
      }
      return {
        timestamp: refHistory[idx]?.timestamp || 0,
        value: count > 0 ? +(sum / count).toFixed(2) : 100,
      };
    });
  }, [priceHistory]);

  const avgChange = stocks.length > 0
    ? stocks.reduce((acc, s) => acc + s.changePercent, 0) / stocks.length
    : 0;
  const advancing = stocks.filter((s) => s.changePercent > 0).length;
  const declining = stocks.filter((s) => s.changePercent < 0).length;
  const indexPositive = marketIndex.length >= 2 && marketIndex[marketIndex.length - 1]?.value >= marketIndex[0]?.value;

  return (
    <div className="w-full px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Market</h1>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-4 text-sm font-mono">
            <span className="text-gray-500">Adv: <span className="text-green-600 font-bold">{advancing}</span></span>
            <span className="text-gray-500">Dec: <span className="text-red-600 font-bold">{declining}</span></span>
            <span className="text-gray-500">Avg: <span className={`font-bold ${avgChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>{avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Live</span>
          </div>
        </div>
      </div>

      {/* Market index chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wider">Market Index</h2>
          <span className={`text-xl font-mono font-bold ${indexPositive ? 'text-green-600' : 'text-red-600'}`}>
            {marketIndex.length > 0 ? marketIndex[marketIndex.length - 1].value.toFixed(2) : '—'}
          </span>
        </div>
        <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={marketIndex}>
              <defs>
                <linearGradient id="mktIdxGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={indexPositive ? '#16a34a' : '#dc2626'} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={indexPositive ? '#16a34a' : '#dc2626'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="#cbd5e1" tick={{ fontSize: 12 }} minTickGap={60} axisLine={false} />
              <YAxis stroke="#cbd5e1" tick={{ fontSize: 12 }} width={55} tickFormatter={(v: number) => v.toFixed(1)} domain={['dataMin - 0.15 * (dataMax - dataMin)', 'dataMax + 0.15 * (dataMax - dataMin)']} axisLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 14, border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px' }}
                labelFormatter={(v: number) => formatTime(v)}
                formatter={(v: number) => [v.toFixed(2), 'Index']}
              />
              <Area type="natural" dataKey="value" stroke={indexPositive ? '#16a34a' : '#dc2626'} strokeWidth={3} fill="url(#mktIdxGrad)" dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <MarketTable />
        </div>
        <div className="space-y-4">
          <EventButtons />
          <EventFeed />
        </div>
      </div>
    </div>
  );
}
