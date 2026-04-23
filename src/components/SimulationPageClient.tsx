'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useMarketStore } from '@/lib/store';
import { eventDefinitions } from '@/lib/events';
import { formatDate, getMarketBreadth } from '@/lib/calculations';
import type { EventDefinition } from '@/lib/types';

interface TriggeredEvent {
  id: string;
  name: string;
  color: string;
  timestamp: number;
  impacts: Record<string, number>;
}

export default function SimulationPageClient() {
  const triggerEvent = useMarketStore((s) => s.triggerEvent);
  const stocks = useMarketStore((s) => s.stocks);
  const eventLog = useMarketStore((s) => s.eventLog);
  const isRunning = useMarketStore((s) => s.isRunning);
  const startEngine = useMarketStore((s) => s.startEngine);
  const stopEngine = useMarketStore((s) => s.stopEngine);

  const [recentTriggers, setRecentTriggers] = useState<TriggeredEvent[]>([]);
  const [flashId, setFlashId] = useState<string | null>(null);

  const handleTrigger = useCallback((eventDef: EventDefinition) => {
    triggerEvent(eventDef);
    const trigger: TriggeredEvent = {
      id: `sim-${Date.now()}-${eventDef.id}`,
      name: eventDef.name,
      color: eventDef.color,
      timestamp: Date.now(),
      impacts: eventDef.impacts,
    };
    setRecentTriggers((prev) => [trigger, ...prev].slice(0, 15));
    setFlashId(eventDef.id);
    setTimeout(() => setFlashId(null), 1000);
  }, [triggerEvent]);

  const positiveEvents = eventDefinitions.filter((e) => {
    const totalImpact = Object.values(e.impacts).reduce((a, b) => a + b, 0);
    return totalImpact > 0;
  });

  const negativeEvents = eventDefinitions.filter((e) => {
    const totalImpact = Object.values(e.impacts).reduce((a, b) => a + b, 0);
    return totalImpact < 0;
  });

  const neutralEvents = eventDefinitions.filter((e) => {
    const totalImpact = Object.values(e.impacts).reduce((a, b) => a + b, 0);
    return totalImpact === 0;
  });

  // Performance metrics
  const bullishEventCount = eventLog.filter((e) => Object.values(e.impacts).reduce((a, b) => a + b, 0) > 0).length;
  const bearishEventCount = eventLog.filter((e) => Object.values(e.impacts).reduce((a, b) => a + b, 0) < 0).length;
  const bullishBias = bullishEventCount - bearishEventCount;

  // Get most impacted stocks from recent trigger
  const lastImpacts = recentTriggers.length > 0 ? recentTriggers[0].impacts : {};
  const impactedStocks = useMemo(() => {
    return Object.entries(lastImpacts)
      .flatMap(([sector, impact]) => {
        return stocks
          .filter((s) => s.sector === sector)
          .map((s) => ({ ticker: s.ticker, name: s.name, sector, impact, price: s.price, changePercent: s.changePercent }));
      })
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
      .slice(0, 5);
  }, [lastImpacts, stocks]);

  const breadth = getMarketBreadth(stocks);

  return (
    <div className="w-full px-6 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="section-title mb-2">Market Simulation Lab</h1>
            <p className="text-gray-500">Trigger market events and observe real-time reactions across sectors</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isRunning ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className={`text-sm font-semibold uppercase tracking-wider ${isRunning ? 'text-green-700' : 'text-gray-600'}`}>
                {isRunning ? 'Market Live' : 'Paused'}
              </span>
            </div>
            <button
              onClick={isRunning ? stopEngine : startEngine}
              className={`px-5 py-2.5 rounded-lg font-semibold uppercase tracking-wider text-sm transition-all font-medium ${
                isRunning
                  ? 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
              }`}
            >
              {isRunning ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>
        </div>
      </div>

      {/* Performance Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="section-subtitle mb-3">Total Events</p>
          <div className="text-3xl font-bold text-gray-900">{eventLog.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="section-subtitle text-green-700 mb-3">Bullish Events</p>
          <div className="text-3xl font-bold text-green-600">{bullishEventCount}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="section-subtitle text-red-700 mb-3">Bearish Events</p>
          <div className="text-3xl font-bold text-red-600">{bearishEventCount}</div>
        </div>
        <div className={`${bullishBias > 0 ? 'bg-green-50 border-green-200' : bullishBias < 0 ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
          <p className={`section-subtitle ${bullishBias > 0 ? 'text-green-700' : bullishBias < 0 ? 'text-red-700' : 'text-blue-700'} mb-3`}>Bias</p>
          <div className={`text-3xl font-bold ${bullishBias > 0 ? 'text-green-600' : bullishBias < 0 ? 'text-red-600' : 'text-blue-600'}`}>
            {bullishBias > 0 ? '+' : ''}{bullishBias}
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="section-subtitle text-purple-700 mb-3">Advancing</p>
          <div className="text-3xl font-bold text-purple-600">{breadth.advancing}</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="section-subtitle text-orange-700 mb-3">Declining</p>
          <div className="text-3xl font-bold text-orange-600">{breadth.declining}</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Event Trigger Controls */}
        <div className="xl:col-span-2 space-y-8">
          {/* Bullish Events Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-green-500 rounded-full"></div>
              <h2 className="subsection-title">Bullish Catalysts</h2>
              <span className="ml-auto text-xs font-semibold text-gray-500">{positiveEvents.length} events</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {positiveEvents.map((eventDef) => {
                  const totalImpact = Object.values(eventDef.impacts).reduce((a, b) => a + b, 0);
                  const isFlashing = flashId === eventDef.id;
                  return (
                    <button
                      key={eventDef.id}
                      onClick={() => handleTrigger(eventDef)}
                      className={`group relative text-left px-5 py-4 rounded-lg border-2 transition-all hover:shadow-lg active:scale-95 ${
                        isFlashing ? 'ring-2 ring-offset-2' : ''
                      }`}
                      style={{
                        borderColor: eventDef.color + 'cc',
                        backgroundColor: isFlashing ? eventDef.color + '15' : '#ffffff',
                        boxShadow: isFlashing ? `0 0 20px ${eventDef.color}40` : 'none',
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <span className="font-bold text-sm block" style={{ color: eventDef.color }}>
                            {eventDef.name}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-md ml-2 flex-shrink-0">
                          +{(totalImpact * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{eventDef.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(eventDef.impacts).slice(0, 3).map(([sector, impact]) => (
                          <span
                            key={sector}
                            className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${
                              impact > 0 ? 'bg-green-100 text-green-700' : impact < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {sector} {impact > 0 ? '+' : ''}{(impact * 100).toFixed(0)}%
                          </span>
                        ))}
                      </div>
                      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ backgroundColor: eventDef.color + '05' }} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bearish Events Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-red-500 rounded-full"></div>
              <h2 className="subsection-title">Bearish Catalysts</h2>
              <span className="ml-auto text-xs font-semibold text-gray-500">{negativeEvents.length} events</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {negativeEvents.map((eventDef) => {
                  const totalImpact = Object.values(eventDef.impacts).reduce((a, b) => a + b, 0);
                  const isFlashing = flashId === eventDef.id;
                  return (
                    <button
                      key={eventDef.id}
                      onClick={() => handleTrigger(eventDef)}
                      className={`group relative text-left px-5 py-4 rounded-lg border-2 transition-all hover:shadow-lg active:scale-95 ${
                        isFlashing ? 'ring-2 ring-offset-2' : ''
                      }`}
                      style={{
                        borderColor: eventDef.color + 'cc',
                        backgroundColor: isFlashing ? eventDef.color + '15' : '#ffffff',
                        boxShadow: isFlashing ? `0 0 20px ${eventDef.color}40` : 'none',
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <span className="font-bold text-sm block" style={{ color: eventDef.color }}>
                            {eventDef.name}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-md ml-2 flex-shrink-0">
                          {(totalImpact * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{eventDef.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(eventDef.impacts).slice(0, 3).map(([sector, impact]) => (
                          <span
                            key={sector}
                            className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${
                              impact > 0 ? 'bg-green-100 text-green-700' : impact < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {sector} {impact > 0 ? '+' : ''}{(impact * 100).toFixed(0)}%
                          </span>
                        ))}
                      </div>
                      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ backgroundColor: eventDef.color + '05' }} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Neutral Events Section */}
          {neutralEvents.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gray-500 rounded-full"></div>
                <h2 className="subsection-title">Mixed Impact Events</h2>
                <span className="ml-auto text-xs font-semibold text-gray-500">{neutralEvents.length} events</span>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {neutralEvents.map((eventDef) => {
                    const isFlashing = flashId === eventDef.id;
                    return (
                      <button
                        key={eventDef.id}
                        onClick={() => handleTrigger(eventDef)}
                        className={`group relative text-left px-5 py-4 rounded-lg border-2 transition-all hover:shadow-lg active:scale-95 ${
                          isFlashing ? 'ring-2 ring-offset-2' : ''
                        }`}
                        style={{
                          borderColor: eventDef.color + 'cc',
                          backgroundColor: isFlashing ? eventDef.color + '15' : '#ffffff',
                          boxShadow: isFlashing ? `0 0 20px ${eventDef.color}40` : 'none',
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="font-bold text-sm block flex-1" style={{ color: eventDef.color }}>
                            {eventDef.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{eventDef.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(eventDef.impacts).slice(0, 3).map(([sector, impact]) => (
                            <span
                              key={sector}
                              className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${
                                impact > 0 ? 'bg-green-100 text-green-700' : impact < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {sector} {impact > 0 ? '+' : ''}{(impact * 100).toFixed(0)}%
                            </span>
                          ))}
                        </div>
                        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ backgroundColor: eventDef.color + '05' }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Live Monitoring */}
        <div className="space-y-6">
          {/* Market Breadth Monitor */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="subsection-title mb-5">Market Breadth</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Advancing Stocks</span>
                  <span className="text-sm font-mono font-bold text-green-600">{breadth.advancing}</span>
                </div>
                <div className="w-full h-2.5 bg-white rounded-full border border-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, (breadth.advancing / stocks.length) * 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Declining Stocks</span>
                  <span className="text-sm font-mono font-bold text-red-600">{breadth.declining}</span>
                </div>
                <div className="w-full h-2.5 bg-white rounded-full border border-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, (breadth.declining / stocks.length) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="pt-3 mt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Breadth Ratio</p>
                <p className="text-2xl font-bold text-gray-900">{((breadth.advancing / stocks.length) * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>

          {/* Most Affected Stocks */}
          {impactedStocks.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-amber-50">
                <h3 className="subsection-title text-amber-900">⚡ Recently Impacted</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {impactedStocks.map((s) => (
                  <Link
                    key={s.ticker}
                    href={`/stock/${s.ticker}`}
                    className="flex items-center justify-between px-6 py-3 hover:bg-white transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-mono font-bold text-sm text-blue-600 block">{s.ticker}</span>
                      <span className="text-xs text-gray-500">{s.name.substring(0, 20)}</span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="font-mono text-sm font-semibold text-gray-900">${s.price.toFixed(2)}</div>
                      <div className={`font-mono text-xs font-bold ${s.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {s.changePercent >= 0 ? '▲' : '▼'} {Math.abs(s.changePercent).toFixed(2)}%
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Event History Feed */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="subsection-title">Event Timeline</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
              {recentTriggers.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-400 text-sm">No events triggered yet</p>
                  <p className="text-gray-500 text-xs mt-1">Trigger catalysts to see real-time market impact</p>
                </div>
              ) : (
                recentTriggers.map((t, idx) => {
                  const totalImpact = Object.values(t.impacts).reduce((a, b) => a + b, 0);
                  return (
                    <div key={t.id} className="px-6 py-3 hover:bg-white transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: t.color }}
                            />
                            <span className="font-semibold text-sm text-gray-900 truncate">{t.name}</span>
                          </div>
                          <p className="text-xs text-gray-400">{formatDate(t.timestamp)}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div
                            className={`font-mono font-bold text-sm ${totalImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {totalImpact >= 0 ? '+' : ''}{(totalImpact * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
            <h3 className="subsection-title text-blue-900 mb-3">Getting Started</h3>
            <ul className="text-xs text-gray-700 space-y-2">
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold flex-shrink-0">1.</span>
                <span>Select a catalyst button from any section</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold flex-shrink-0">2.</span>
                <span>Watch market breadth and affected stocks update</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold flex-shrink-0">3.</span>
                <span>Track all events in the timeline</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold flex-shrink-0">4.</span>
                <span>Analyze results and patterns in other pages</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
