'use client';

import Link from 'next/link';
import { useMemo, useEffect, useState, useRef } from 'react';
import { useMarketStore } from '@/lib/store';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6'];

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function PortfolioPageClient() {
  const stocks = useMarketStore((s) => s.stocks);
  const holdings = useMarketStore((s) => s.holdings);
  const priceHistory = useMarketStore((s) => s.priceHistory);

  // Portfolio value history
  const [valueHistory, setValueHistory] = useState<{ timestamp: number; value: number }[]>([]);
  const holdingsRef = useRef(holdings);
  holdingsRef.current = holdings;

  const portfolioHoldings = holdings.map((h) => {
    const stock = stocks.find((s) => s.ticker === h.ticker);
    if (!stock) return null;

    const currentValue = stock.price * h.shares;
    const costBasis = h.avgCost * h.shares;
    const pnl = currentValue - costBasis;
    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

    return {
      ...h,
      stock,
      currentValue,
      costBasis,
      pnl,
      pnlPercent,
    };
  }).filter((h): h is NonNullable<typeof h> => h !== null);

  const totalValue = portfolioHoldings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCost = portfolioHoldings.reduce((sum, h) => sum + h.costBasis, 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
  const winCount = portfolioHoldings.filter((h) => h.pnl >= 0).length;
  const lossCount = portfolioHoldings.filter((h) => h.pnl < 0).length;

  // Track portfolio value over time
  useEffect(() => {
    if (totalValue > 0) {
      setValueHistory((prev) => {
        const next = [...prev, { timestamp: Date.now(), value: totalValue }];
        return next.slice(-100);
      });
    }
  }, [totalValue]);

  // Compute portfolio value from price history
  const portfolioValueHistory = useMemo(() => {
    if (portfolioHoldings.length === 0) return [];
    const firstTicker = portfolioHoldings[0].ticker;
    const refHist = priceHistory[firstTicker];
    if (!refHist || refHist.length === 0) return [];

    return refHist.map((_, idx) => {
      let total = 0;
      for (const h of holdingsRef.current) {
        const hist = priceHistory[h.ticker];
        if (hist && hist[idx]) {
          total += hist[idx].price * h.shares;
        }
      }
      return {
        timestamp: refHist[idx].timestamp,
        value: +total.toFixed(2),
      };
    });
  }, [priceHistory, portfolioHoldings]);

  // Pie chart data
  const pieData = portfolioHoldings.map((h) => ({
    name: h.ticker,
    value: +h.currentValue.toFixed(2),
  }));

  const isPositiveTotal = totalPnL >= 0;

  return (
    <div className="w-full px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
        <div className="flex items-center gap-4 text-sm font-mono">
          <span className="text-gray-500">Win: <span className="text-green-600 font-bold">{winCount}</span></span>
          <span className="text-gray-500">Loss: <span className="text-red-600 font-bold">{lossCount}</span></span>
        </div>
      </div>

      {/* 5-column metrics */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 px-5 py-4 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Total Value</div>
          <div className="text-2xl font-bold text-gray-900 font-mono">${totalValue.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-5 py-4 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Cost Basis</div>
          <div className="text-2xl font-bold text-gray-900 font-mono">${totalCost.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-5 py-4 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Total P&amp;L</div>
          <div className={`text-2xl font-bold font-mono ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-5 py-4 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">P&amp;L %</div>
          <div className={`text-2xl font-bold font-mono ${totalPnLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-5 py-4 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Holdings</div>
          <div className="text-2xl font-bold text-gray-900 font-mono">{portfolioHoldings.length}</div>
        </div>
      </div>

      {/* Portfolio Value Chart + Allocation Pie */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wider">Portfolio Value</h2>
            <span className={`text-xl font-mono font-bold ${isPositiveTotal ? 'text-green-600' : 'text-red-600'}`}>
              ${totalValue.toFixed(2)}
            </span>
          </div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioValueHistory}>
                <defs>
                  <linearGradient id="portValGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositiveTotal ? '#16a34a' : '#dc2626'} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={isPositiveTotal ? '#16a34a' : '#dc2626'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="#cbd5e1" tick={{ fontSize: 12 }} minTickGap={60} axisLine={false} />
                <YAxis stroke="#cbd5e1" tick={{ fontSize: 12 }} width={70} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} domain={['dataMin - 0.15 * (dataMax - dataMin)', 'dataMax + 0.15 * (dataMax - dataMin)']} axisLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 14, border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px' }}
                  labelFormatter={(v: number) => formatTime(v)}
                  formatter={(v: number) => [`$${v.toFixed(2)}`, 'Value']}
                />
                <Area type="natural" dataKey="value" stroke={isPositiveTotal ? '#16a34a' : '#dc2626'} strokeWidth={3} fill="url(#portValGrad)" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wider mb-3">Allocation</h2>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px' }}
                  formatter={(v: number, name: string) => [`$${v.toFixed(2)}`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
            {pieData.map((entry, i) => {
              const pct = totalValue > 0 ? (entry.value / totalValue * 100).toFixed(1) : '0';
              return (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-xs font-mono text-gray-700 truncate">{entry.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Holdings table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Holdings ({portfolioHoldings.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3">Ticker</th>
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">Sector</th>
                <th className="text-right px-5 py-3">Shares</th>
                <th className="text-right px-5 py-3">Avg Cost</th>
                <th className="text-right px-5 py-3">Current</th>
                <th className="text-right px-5 py-3">Value</th>
                <th className="text-right px-5 py-3">P&amp;L</th>
                <th className="text-right px-5 py-3">%</th>
                <th className="text-right px-5 py-3">Weight</th>
              </tr>
            </thead>
            <tbody>
              {portfolioHoldings.map((h, i) => {
                const isPositive = h.pnl >= 0;
                const pnlColor = isPositive ? 'text-green-600' : 'text-red-600';
                const weight = totalValue > 0 ? (h.currentValue / totalValue * 100) : 0;
                return (
                  <tr key={h.ticker} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <Link href={`/stock/${h.ticker}`} className="font-mono font-bold text-base text-blue-600 hover:text-blue-700">
                          {h.ticker}
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{h.stock.name}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600 font-medium">{h.stock.sector}</span>
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-sm font-bold text-gray-900">{h.shares}</td>
                    <td className="px-5 py-4 text-right font-mono text-sm text-gray-500">${h.avgCost.toFixed(2)}</td>
                    <td className="px-5 py-4 text-right font-mono text-base font-bold text-gray-900">${h.stock.price.toFixed(2)}</td>
                    <td className="px-5 py-4 text-right font-mono text-sm font-semibold text-gray-900">${h.currentValue.toFixed(2)}</td>
                    <td className={`px-5 py-4 text-right font-mono text-sm font-semibold ${pnlColor}`}>
                      {isPositive ? '+' : ''}{h.pnl.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`font-mono font-bold text-sm px-2.5 py-1 rounded-md ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {isPositive ? '+' : ''}{h.pnlPercent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${weight}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        </div>
                        <span className="text-xs font-mono text-gray-500">{weight.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
