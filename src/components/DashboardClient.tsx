'use client';

import Link from 'next/link';
import { useMemo, useEffect, useState, useRef } from 'react';
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
import MiniChart from './MiniChart';

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

interface RecentTrade {
  id: string;
  timestamp: number;
  ticker: string;
  side: 'BUY' | 'SELL';
  price: number;
  volume: number;
}

export default function DashboardClient() {
  const stocks = useMarketStore((s) => s.stocks);
  const priceHistory = useMarketStore((s) => s.priceHistory);
  const eventLog = useMarketStore((s) => s.eventLog);
  const stocksRef = useRef(stocks);
  stocksRef.current = stocks;

  // Recent trades for dashboard
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const tradeIdRef = useRef(0);

  useEffect(() => {
    const s = stocksRef.current;
    if (s.length === 0) return;
    const initial: RecentTrade[] = [];
    const now = Date.now();
    for (let i = 0; i < 20; i++) {
      const stock = s[Math.floor(Math.random() * s.length)];
      tradeIdRef.current += 1;
      initial.push({
        id: `dt-${tradeIdRef.current}`,
        timestamp: now - (20 - i) * 1500,
        ticker: stock.ticker,
        side: Math.random() > 0.48 ? 'BUY' : 'SELL',
        price: Math.max(0.01, stock.price + (Math.random() - 0.5) * stock.price * 0.005),
        volume: Math.floor(Math.random() * 3000) + 100,
      });
    }
    setRecentTrades(initial.reverse());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const s = stocksRef.current;
      if (s.length === 0) return;
      const stock = s[Math.floor(Math.random() * s.length)];
      tradeIdRef.current += 1;
      const t: RecentTrade = {
        id: `dt-${tradeIdRef.current}`,
        timestamp: Date.now(),
        ticker: stock.ticker,
        side: Math.random() > 0.48 ? 'BUY' : 'SELL',
        price: Math.max(0.01, stock.price + (Math.random() - 0.5) * stock.price * 0.005),
        volume: Math.floor(Math.random() * 3000) + 100,
      };
      setRecentTrades((prev) => [t, ...prev].slice(0, 25));
    }, 800);
    return () => clearInterval(interval);
  }, []);

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

  const totalMarketCap = stocks.reduce((acc, s) => acc + s.price * 1000000, 0);
  const avgChange = stocks.length > 0
    ? stocks.reduce((acc, s) => acc + s.changePercent, 0) / stocks.length
    : 0;
  const advancing = stocks.filter((s) => s.changePercent > 0).length;
  const declining = stocks.filter((s) => s.changePercent < 0).length;
  const avgVolatility = stocks.reduce((acc, s) => acc + s.volatility, 0) / (stocks.length || 1);

  const gainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 10);
  const losers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 10);

  const indexPositive = marketIndex.length >= 2 && marketIndex[marketIndex.length - 1]?.value >= marketIndex[0]?.value;

  return (
    <div className="w-full px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-3xl font-bold text-gray-900">Market Overview</h1>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Live</span>
        </div>
      </div>

      {/* Metrics bar */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Market Cap', value: `$${(totalMarketCap / 1e9).toFixed(2)}B`, color: 'text-gray-900' },
          { label: 'Avg Change', value: `${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%`, color: avgChange >= 0 ? 'text-green-600' : 'text-red-600' },
          { label: 'Advancing', value: `${advancing}`, color: 'text-green-600' },
          { label: 'Declining', value: `${declining}`, color: 'text-red-600' },
          { label: 'Volatility', value: `${(avgVolatility * 100).toFixed(1)}%`, color: 'text-gray-900' },
        ].map((m) => (
          <div key={m.label} className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">{m.label}</div>
            <div className={`text-2xl font-bold font-mono ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Market composite chart + Top Movers */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wider">Composite Market Index</h2>
            <span className={`text-xl font-mono font-bold ${indexPositive ? 'text-green-600' : 'text-red-600'}`}>
              {marketIndex.length > 0 ? marketIndex[marketIndex.length - 1].value.toFixed(2) : '—'}
            </span>
          </div>
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marketIndex}>
                <defs>
                  <linearGradient id="dashIdxGrad" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="natural" dataKey="value" stroke={indexPositive ? '#16a34a' : '#dc2626'} strokeWidth={3} fill="url(#dashIdxGrad)" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Movers sidebar */}
        <div className="space-y-4">
          {/* Gainers */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-200 bg-green-50">
              <h3 className="text-xs font-bold text-green-700 uppercase tracking-wider">🔺 Top Gainers</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[220px] overflow-y-auto">
              {gainers.map((s) => {
                const hist = priceHistory[s.ticker] || [];
                const cd = hist.slice(-20).map((p) => ({ price: p.price }));
                return (
                  <Link key={s.ticker} href={`/stock/${s.ticker}`} className="flex items-center justify-between px-5 py-3 hover:bg-green-50/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-base text-blue-600">{s.ticker}</span>
                      <MiniChart data={cd} width={56} height={22} positive={true} />
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-gray-900">${s.price.toFixed(2)}</div>
                      <div className="font-mono text-sm font-bold text-green-600">+{Math.abs(s.changePercent).toFixed(2)}%</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Losers */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-200 bg-red-50">
              <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider">🔻 Top Losers</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[220px] overflow-y-auto">
              {losers.map((s) => {
                const hist = priceHistory[s.ticker] || [];
                const cd = hist.slice(-20).map((p) => ({ price: p.price }));
                return (
                  <Link key={s.ticker} href={`/stock/${s.ticker}`} className="flex items-center justify-between px-5 py-3 hover:bg-red-50/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-base text-blue-600">{s.ticker}</span>
                      <MiniChart data={cd} width={56} height={22} positive={false} />
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-gray-900">${s.price.toFixed(2)}</div>
                      <div className="font-mono text-sm font-bold text-red-600">{s.changePercent.toFixed(2)}%</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Full stock table + Recent trades */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Stock table */}
        <div className="xl:col-span-3 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">All Stocks ({stocks.length})</h2>
            <Link href="/market" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">View Full Market →</Link>
          </div>
          <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="text-xs text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3">Ticker</th>
                  <th className="text-left px-5 py-3">Name</th>
                  <th className="text-left px-5 py-3">Sector</th>
                  <th className="text-right px-5 py-3">Price</th>
                  <th className="text-right px-5 py-3">Change</th>
                  <th className="text-right px-5 py-3">%</th>
                  <th className="px-5 py-3 text-center">Trend</th>
                  <th className="text-right px-5 py-3">High</th>
                  <th className="text-right px-5 py-3">Low</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => {
                  const pos = stock.changePercent >= 0;
                  const cc = pos ? 'text-green-600' : 'text-red-600';
                  const hist = priceHistory[stock.ticker] || [];
                  const chartData = hist.slice(-20).map((p) => ({ price: p.price }));
                  return (
                    <tr key={stock.ticker} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors">
                      <td className="px-5 py-4">
                        <Link href={`/stock/${stock.ticker}`} className="font-mono font-bold text-blue-600 hover:text-blue-700 text-base">
                          {stock.ticker}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{stock.name}</td>
                      <td className="px-5 py-4">
                        <span className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600 font-medium">{stock.sector}</span>
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-base text-gray-900">${stock.price.toFixed(2)}</td>
                      <td className={`px-5 py-4 text-right font-mono text-sm font-semibold ${cc}`}>{pos ? '+' : ''}{stock.change.toFixed(2)}</td>
                      <td className={`px-5 py-4 text-right`}>
                        <span className={`font-mono font-bold text-sm px-2.5 py-1 rounded-md ${pos ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {pos ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-center">
                          <MiniChart data={chartData} width={80} height={28} positive={pos} />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-sm text-gray-500">${stock.high.toFixed(2)}</td>
                      <td className="px-5 py-4 text-right font-mono text-sm text-gray-500">${stock.low.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent trades + Events sidebar */}
        <div className="space-y-4">
          {/* Recent Trades */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Recent Trades</h3>
              <Link href="/trades" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">All →</Link>
            </div>
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {recentTrades.map((trade) => (
                <div key={trade.id} className={`px-5 py-3 ${trade === recentTrades[0] ? (trade.side === 'BUY' ? 'flash-buy' : 'flash-sell') : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${trade.side === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{trade.side}</span>
                      <span className="font-mono font-bold text-sm text-gray-900">{trade.ticker}</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-gray-900">${trade.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">{new Date(trade.timestamp).toLocaleTimeString()}</span>
                    <span className="text-xs font-mono text-gray-500">{trade.volume.toLocaleString()} shares</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Recent Events</h3>
              <Link href="/events" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">All →</Link>
            </div>
            <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
              {eventLog.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm text-gray-400">No events yet — trigger one in Simulation</div>
              ) : (
                eventLog.slice(0, 8).map((e) => (
                  <div key={e.id} className="px-5 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">{e.name}</span>
                      <span className="text-xs text-gray-400">{new Date(e.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {Object.entries(e.impacts).slice(0, 4).map(([sector, impact]) => (
                        <span key={sector} className={`text-xs px-1.5 py-0.5 rounded ${impact >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {sector} {impact >= 0 ? '+' : ''}{(impact * 100).toFixed(0)}%
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
