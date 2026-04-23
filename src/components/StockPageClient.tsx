'use client';

import { useMarketStore } from '@/lib/store';
import { getSectorStats, getRelativeMomentum, getMomentumTrend } from '@/lib/calculations';
import StockChart from './StockChart';
import MiniChart from './MiniChart';
import Link from 'next/link';
import { useState, useMemo } from 'react';

interface StockPageClientProps {
  ticker: string;
}

type TabType = 'performance' | 'risk' | 'events';

export default function StockPageClient({ ticker }: StockPageClientProps) {
  const stocks = useMarketStore((s) => s.stocks);
  const holdings = useMarketStore((s) => s.holdings);
  const eventLog = useMarketStore((s) => s.eventLog);
  const [activeTab, setActiveTab] = useState<TabType>('performance');

  const stock = useMemo(() => stocks.find((s) => s.ticker === ticker), [stocks, ticker]);
  const holding = useMemo(() => holdings.find((h) => h.ticker === ticker), [holdings, ticker]);
  const sectorStats = useMemo(() => getSectorStats(stocks), [stocks]);
  const sectorStat = useMemo(() => sectorStats.get(stock?.sector || ''), [sectorStats, stock?.sector]);
  const relMomentum = useMemo(() => (stock ? getRelativeMomentum(stock, sectorStats) : 0), [stock, sectorStats]);
  const momentumTrend = useMemo(() => (stock ? getMomentumTrend(stock) : 'flat'), [stock]);

  // Related stocks in same sector
  const relatedStocks = useMemo(
    () =>
      stocks.filter((s) => s.sector === stock?.sector && s.ticker !== ticker).slice(0, 5),
    [stocks, stock?.sector, ticker]
  );

  // Events that affected this stock
  const relevantEvents = useMemo(
    () =>
      eventLog
        .filter((e) => e.impacts[stock?.sector || ''] !== undefined)
        .slice(-10)
        .reverse(),
    [eventLog, stock?.sector]
  );

  if (!stock) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-gray-400">Stock not found</p>
      </div>
    );
  }

  const isPositive = stock.changePercent >= 0;
  const holdingValue = holding ? holding.shares * stock.price : 0;
  const holdingCost = holding ? holding.shares * holding.avgCost : 0;
  const holdingGainLoss = holdingValue - holdingCost;
  const holdingGainLossPercent = holdingCost > 0 ? (holdingGainLoss / holdingCost) * 100 : 0;

  return (
    <div className="w-full px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{stock.name}</h1>
        <div className="flex items-center gap-4">
          <span className="text-3xl font-mono font-bold text-gray-900">${stock.price.toFixed(2)}</span>
          <span
            className={`text-lg font-mono font-bold px-3 py-1 rounded-lg ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
          >
            {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </span>
          <span className="text-sm text-gray-500 uppercase tracking-wider font-semibold">{stock.sector}</span>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">52W High</div>
          <div className="text-lg font-mono font-bold text-gray-900">${stock.weekHighPrice.toFixed(2)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">52W Low</div>
          <div className="text-lg font-mono font-bold text-gray-900">${stock.weekLowPrice.toFixed(2)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Volatility</div>
          <div className="text-lg font-mono font-bold text-gray-900">{(stock.volatility * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Momentum</div>
          <div className={`text-lg font-mono font-bold ${stock.momentum > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stock.momentum > 0 ? '+' : ''}{(stock.momentum * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Trend</div>
          <div className="text-lg font-mono font-bold text-gray-900 capitalize">{momentumTrend}</div>
        </div>
      </div>

      {/* Main chart + sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2">
          <StockChart ticker={ticker} />
        </div>

        {/* Sidebar: Sector Comparison + Holdings */}
        <div className="space-y-4">
          {/* Sector Comparison */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Sector Comparison</h3>
            <div className="space-y-3">
              {sectorStat && (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Sector Avg Change</span>
                      <span
                        className={`text-xs font-mono font-bold ${sectorStat.avgChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {sectorStat.avgChange >= 0 ? '+' : ''}{sectorStat.avgChange.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isPositive ? 'bg-green-400' : 'bg-red-400'}`}
                          style={{
                            width: `${Math.min(100, Math.abs(stock.changePercent - sectorStat.avgChange) * 50)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-600">
                        {stock.changePercent > sectorStat.avgChange ? '+' : ''}{(stock.changePercent - sectorStat.avgChange).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Your Performance</span>
                      <span className={`text-xs font-bold ${stock.changePercent > sectorStat.avgChange ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.changePercent > sectorStat.avgChange ? 'Outperforming' : 'Underperforming'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Holdings */}
          {holding && (
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Your Position</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Shares</span>
                  <span className="font-mono font-bold text-gray-900">{holding.shares}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost Basis</span>
                  <span className="font-mono font-bold text-gray-900">${holding.avgCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="text-gray-600">Value</span>
                  <span className="font-mono font-bold text-gray-900">${holdingValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gain/Loss</span>
                  <span
                    className={`font-mono font-bold ${holdingGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {holdingGainLoss >= 0 ? '+' : ''}${holdingGainLoss.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Return</span>
                  <span
                    className={`font-mono font-bold ${holdingGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {holdingGainLossPercent >= 0 ? '+' : ''}{holdingGainLossPercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-6">
        <div className="flex border-b border-gray-200">
          {(['performance', 'risk', 'events'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-5 py-4 font-semibold text-sm uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? 'bg-gray-50 text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'performance' && '📈 Performance'}
              {tab === 'risk' && '⚠️ Risk'}
              {tab === 'events' && '📢 Events'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'performance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Today's Change</p>
                  <p className={`text-2xl font-mono font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{stock.change.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">52W Range</p>
                  <p className="text-sm font-mono text-gray-900">
                    ${stock.weekLowPrice.toFixed(2)} - ${stock.weekHighPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Volatility</span>
                  <span className="text-sm font-mono text-gray-900">{(stock.volatility * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${stock.volatility > (sectorStat?.avgVolatility || 0) ? 'bg-red-400' : 'bg-green-400'}`}
                    style={{ width: `${Math.min(100, stock.volatility * 200)}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Vs Sector</span>
                <span className="text-sm font-mono text-gray-900">
                  {stock.volatility > (sectorStat?.avgVolatility || 0) ? '↑ Higher' : '↓ Lower'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Price Stability</span>
                <span className="text-sm font-mono text-gray-900">
                  {(100 - stock.volatility * 100).toFixed(0)}% stable
                </span>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {relevantEvents.length === 0 ? (
                <p className="text-sm text-gray-500">No recent events affecting this stock</p>
              ) : (
                relevantEvents.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm text-gray-900">{event.name}</span>
                      <span
                        className={`text-xs font-mono font-bold ${
                          (event.impacts[stock.sector] || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {(event.impacts[stock.sector] || 0) >= 0 ? '+' : ''}
                        {((event.impacts[stock.sector] || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleTimeString()}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Stocks */}
      {relatedStocks.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Related Stocks in {stock.sector}</h3>
          <div className="space-y-2">
            {relatedStocks.map((relStock) => (
              <Link
                key={relStock.ticker}
                href={`/stock/${relStock.ticker}`}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="font-semibold text-gray-900 group-hover:text-blue-600">{relStock.ticker}</span>
                  <span className="text-sm text-gray-500 truncate">{relStock.name}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-16 h-6">
                    <MiniChart
                      data={(useMarketStore((s) => s.priceHistory[relStock.ticker]) || []).slice(-20)}
                      width={60}
                      height={24}
                    />
                  </div>
                  <span
                    className={`font-mono font-bold text-sm ${relStock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {relStock.changePercent >= 0 ? '+' : ''}{relStock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
