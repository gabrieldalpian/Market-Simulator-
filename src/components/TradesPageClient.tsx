'use client';

import { useEffect, useState, useRef } from 'react';
import { useMarketStore } from '@/lib/store';

interface Trade {
  id: string;
  timestamp: number;
  ticker: string;
  name: string;
  side: 'BUY' | 'SELL';
  price: number;
  volume: number;
  total: number;
  isNew: boolean;
}

export default function TradesPageClient() {
  const stocks = useMarketStore((s) => s.stocks);
  const [trades, setTrades] = useState<Trade[]>([]);
  const stocksRef = useRef(stocks);
  const tradeIdRef = useRef(0);
  stocksRef.current = stocks;

  // Generate initial batch of historical trades
  useEffect(() => {
    const s = stocksRef.current;
    if (s.length === 0) return;
    const initial: Trade[] = [];
    const now = Date.now();
    for (let i = 0; i < 200; i++) {
      const stock = s[Math.floor(Math.random() * s.length)];
      const side: 'BUY' | 'SELL' = Math.random() > 0.48 ? 'BUY' : 'SELL';
      const volume = Math.floor(Math.random() * 5000) + 50;
      const spread = (Math.random() - 0.5) * stock.price * 0.006;
      const price = Math.max(0.01, stock.price + spread);
      tradeIdRef.current += 1;
      initial.push({
        id: `init-${tradeIdRef.current}`,
        timestamp: now - (200 - i) * 600,
        ticker: stock.ticker,
        name: stock.name,
        side,
        price,
        volume,
        total: price * volume,
        isNew: false,
      });
    }
    setTrades(initial.reverse());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Continuous trade generation
  useEffect(() => {
    const addTrade = () => {
      const s = stocksRef.current;
      if (s.length === 0) return;
      const stock = s[Math.floor(Math.random() * s.length)];
      const side: 'BUY' | 'SELL' = Math.random() > 0.48 ? 'BUY' : 'SELL';
      const volume = Math.floor(Math.random() * 5000) + 50;
      const spread = (Math.random() - 0.5) * stock.price * 0.006;
      const price = Math.max(0.01, stock.price + spread);
      tradeIdRef.current += 1;
      const t: Trade = {
        id: `t-${tradeIdRef.current}`,
        timestamp: Date.now(),
        ticker: stock.ticker,
        name: stock.name,
        side,
        price,
        volume,
        total: price * volume,
        isNew: true,
      };
      setTrades((prev) => {
        const updated = prev.map((p) => (p.isNew ? { ...p, isNew: false } : p));
        return [t, ...updated].slice(0, 300);
      });
    };

    const interval = setInterval(addTrade, 600);
    return () => clearInterval(interval);
  }, []);

  const totalVolume = trades.reduce((acc, t) => acc + t.volume, 0);
  const buyCount = trades.filter((t) => t.side === 'BUY').length;
  const sellCount = trades.filter((t) => t.side === 'SELL').length;
  const totalValue = trades.reduce((acc, t) => acc + t.total, 0);
  const buyRatio = trades.length > 0 ? (buyCount / trades.length * 100) : 50;

  return (
    <div className="w-full px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-3xl font-bold text-gray-900">Trade Feed</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 font-mono">{trades.length} trades</span>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Live</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Volume</div>
          <div className="text-2xl font-bold font-mono text-gray-900">{totalVolume.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Value</div>
          <div className="text-2xl font-bold font-mono text-gray-900">${(totalValue / 1e6).toFixed(2)}M</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Buys</div>
          <div className="text-2xl font-bold font-mono text-green-600">{buyCount}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Sells</div>
          <div className="text-2xl font-bold font-mono text-red-600">{sellCount}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Buy Ratio</div>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${buyRatio}%` }} />
            </div>
            <span className="text-sm font-mono font-bold text-gray-600">{buyRatio.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Trade table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="text-xs text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 w-28">Time</th>
                <th className="text-left px-5 py-3 w-20">Ticker</th>
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-center px-5 py-3 w-16">Side</th>
                <th className="text-right px-5 py-3 w-24">Price</th>
                <th className="text-right px-5 py-3 w-24">Volume</th>
                <th className="text-right px-5 py-3 w-32">Total</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr
                  key={trade.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    trade.isNew
                      ? trade.side === 'BUY' ? 'flash-buy' : 'flash-sell'
                      : ''
                  }`}
                >
                  <td className="px-5 py-3.5 text-sm text-gray-500 font-mono">
                    {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-bold text-base text-blue-600">{trade.ticker}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">{trade.name}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                      trade.side === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {trade.side}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-base font-semibold text-gray-900">${trade.price.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-sm text-gray-600">{trade.volume.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-sm font-semibold text-gray-700">
                    ${trade.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
