'use client';

import { useMarketStore } from '@/lib/store';
import { formatDate, getEventImpactText } from '@/lib/calculations';
import Link from 'next/link';
import { useState, useMemo } from 'react';

type SentimentFilter = 'all' | 'bullish' | 'bearish' | 'neutral';

interface EventWithMetrics {
  event: any;
  totalImpact: number;
  isPositive: boolean;
  severity: 'high' | 'medium' | 'low';
  affectedSectors: number;
}

export default function EventsPageClient() {
  const eventLog = useMarketStore((s) => s.eventLog);
  const stocks = useMarketStore((s) => s.stocks);
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'time' | 'impact'>('time');

  // Get unique sectors from events
  const sectors = useMemo(() => {
    const sectorSet = new Set<string>();
    eventLog.forEach((e) => {
      Object.keys(e.impacts).forEach((s) => sectorSet.add(s));
    });
    return Array.from(sectorSet).sort();
  }, [eventLog]);

  // Process events with metrics
  const processedEvents = useMemo(() => {
    return eventLog.map((event) => {
      const totalImpact = Object.values(event.impacts).reduce((a, b) => a + b, 0);
      const affectedSectors = Object.keys(event.impacts).length;
      const severity =
        Math.abs(totalImpact) > 0.15 ? 'high' : Math.abs(totalImpact) > 0.08 ? 'medium' : 'low';

      return {
        event,
        totalImpact,
        isPositive: totalImpact > 0,
        severity,
        affectedSectors,
      } as EventWithMetrics;
    });
  }, [eventLog]);

  // Filter events by sentiment and sector
  const filteredEvents = useMemo(() => {
    let filtered = processedEvents.filter((item) => {
      // Sentiment filter
      if (sentimentFilter === 'bullish' && item.totalImpact <= 0) return false;
      if (sentimentFilter === 'bearish' && item.totalImpact >= 0) return false;
      if (sentimentFilter === 'neutral' && item.totalImpact !== 0) return false;

      // Sector filter
      if (sectorFilter !== 'all' && !item.event.impacts[sectorFilter]) return false;

      return true;
    });

    // Sort
    if (sortBy === 'impact') {
      filtered = filtered.sort((a, b) => Math.abs(b.totalImpact) - Math.abs(a.totalImpact));
    }

    return filtered;
  }, [processedEvents, sentimentFilter, sectorFilter, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const bullishCount = processedEvents.filter((e) => e.totalImpact > 0).length;
    const bearishCount = processedEvents.filter((e) => e.totalImpact < 0).length;
    const neutralCount = processedEvents.filter((e) => e.totalImpact === 0).length;
    const highImpactCount = processedEvents.filter((e) => e.severity === 'high').length;

    return { bullishCount, bearishCount, neutralCount, highImpactCount, totalEvents: eventLog.length };
  }, [processedEvents, eventLog]);

  // Get top affected stocks for each event
  const getTopMoversForEvent = (impacts: Record<string, number>) => {
    const stocksByImpact: Array<[string, number]> = [];
    stocks.forEach((stock) => {
      const sectorImpact = impacts[stock.sector] || 0;
      if (sectorImpact !== 0) {
        stocksByImpact.push([stock.ticker, sectorImpact]);
      }
    });
    return stocksByImpact
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 3);
  };

  const getSeverityColor = (severity: string, isPositive: boolean) => {
    if (isPositive) {
      return severity === 'high' ? 'bg-green-50 border-green-200' :
             severity === 'medium' ? 'bg-emerald-50 border-emerald-200' :
             'bg-teal-50 border-teal-200';
    } else {
      return severity === 'high' ? 'bg-red-50 border-red-200' :
             severity === 'medium' ? 'bg-orange-50 border-orange-200' :
             'bg-amber-50 border-amber-200';
    }
  };

  const getSeverityBadgeColor = (severity: string, isPositive: boolean) => {
    if (isPositive) {
      return severity === 'high' ? 'bg-green-100 text-green-700' :
             severity === 'medium' ? 'bg-emerald-100 text-emerald-700' :
             'bg-teal-100 text-teal-700';
    } else {
      return severity === 'high' ? 'bg-red-100 text-red-700' :
             severity === 'medium' ? 'bg-orange-100 text-orange-700' :
             'bg-amber-100 text-amber-700';
    }
  };

  return (
    <div className="w-full px-6 py-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Market Events</h1>
        <p className="text-gray-500 text-lg">Track market-moving events and their impact across sectors</p>
      </div>

      {/* KPI Cards - Enhanced */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Total Events</p>
          <div className="text-3xl font-bold text-gray-900">{stats.totalEvents}</div>
          <p className="text-xs text-gray-400 mt-2">All recorded events</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-3">Bullish</p>
          <div className="text-3xl font-bold text-green-600">{stats.bullishCount}</div>
          <p className="text-xs text-green-600 mt-2">Positive events</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-3">Bearish</p>
          <div className="text-3xl font-bold text-red-600">{stats.bearishCount}</div>
          <p className="text-xs text-red-600 mt-2">Negative events</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3">Neutral</p>
          <div className="text-3xl font-bold text-blue-600">{stats.neutralCount}</div>
          <p className="text-xs text-blue-600 mt-2">Balanced impact</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-3">High Impact</p>
          <div className="text-3xl font-bold text-purple-600">{stats.highImpactCount}</div>
          <p className="text-xs text-purple-600 mt-2">Major events</p>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="mb-10">
        <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-5">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sentiment Filter */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">Sentiment</p>
            <div className="space-y-2">
              {(['all', 'bullish', 'bearish', 'neutral'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSentimentFilter(filter)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                    sentimentFilter === filter
                      ? filter === 'all'
                        ? 'bg-gray-900 text-white shadow-sm'
                        : filter === 'bullish'
                          ? 'bg-green-600 text-white shadow-sm'
                          : filter === 'bearish'
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {filter === 'all' && '📊 All Events'}
                  {filter === 'bullish' && '📈 Bullish Only'}
                  {filter === 'bearish' && '📉 Bearish Only'}
                  {filter === 'neutral' && '➖ Neutral Only'}
                </button>
              ))}
            </div>
          </div>

          {/* Sector Filter */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">Sector</p>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all hover:border-gray-300"
            >
              <option value="all">All Sectors</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">Sort By</p>
            <div className="space-y-2">
              {[
                { value: 'time', label: '⏰ Most Recent' },
                { value: 'impact', label: '💥 Highest Impact' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as 'time' | 'impact')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                    sortBy === option.value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Events Timeline */}
      <div className="space-y-5">
        {filteredEvents.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-16 text-center shadow-sm">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-600 text-lg font-semibold">No events match your filters</p>
            <p className="text-gray-400 text-sm mt-3">Try adjusting your filter selection</p>
          </div>
        ) : (
          filteredEvents.map((item, idx) => {
            const { event, totalImpact, isPositive, severity, affectedSectors } = item;
            const topMovers = getTopMoversForEvent(event.impacts);
            const impactPercent = totalImpact * 100;

            return (
              <div
                key={event.id}
                className={`border-l-4 rounded-lg p-6 transition-all shadow-sm hover:shadow-md bg-white ${getSeverityColor(severity, isPositive)}`}
                style={{
                  borderLeftColor: isPositive
                    ? severity === 'high'
                      ? '#16a34a'
                      : severity === 'medium'
                        ? '#059669'
                        : '#0d9488'
                    : severity === 'high'
                      ? '#dc2626'
                      : severity === 'medium'
                        ? '#ea580c'
                        : '#d97706',
                }}
              >
                {/* Event Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{event.name}</h3>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${getSeverityBadgeColor(severity, isPositive)}`}>
                        {severity === 'high' ? '⚡ High Impact' : severity === 'medium' ? '⚠️ Medium' : '📌 Low'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{event.description}</p>
                  </div>
                  <div className="flex-shrink-0 ml-6 text-right">
                    <div
                      className={`text-3xl font-bold font-mono ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {isPositive ? '+' : ''}{impactPercent.toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{affectedSectors} sectors affected</p>
                  </div>
                </div>

                {/* Timestamp */}
                <p className="text-xs text-gray-500 mb-5 flex items-center gap-2 pb-4 border-b border-gray-100">
                  🕐 {formatDate(event.timestamp)}
                </p>

                {/* Sector Impacts Grid */}
                <div className="mb-5">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Sector Impacts</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Object.entries(event.impacts).map(([sector, impact]) => {
                      const impactValue = impact as number;
                      return (
                        <div
                          key={sector}
                          className={`p-3 rounded-lg border transition-all ${impactValue >= 0 ? 'bg-green-50 border-green-200 hover:border-green-300' : 'bg-red-50 border-red-200 hover:border-red-300'}`}
                        >
                          <p className="text-xs font-semibold text-gray-600 mb-2">{sector}</p>
                          <p className={`font-mono font-bold text-sm ${impactValue >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {impactValue >= 0 ? '+' : ''}{(impactValue * 100).toFixed(1)}%
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Movers */}
                {topMovers.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Top Affected Stocks</p>
                    <div className="flex flex-wrap gap-2">
                      {topMovers.map(([ticker, impact]) => {
                        const stock = stocks.find((s) => s.ticker === ticker);
                        return (
                          <Link
                            key={ticker}
                            href={`/stock/${ticker}`}
                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:scale-105 ${
                              impact >= 0
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            {ticker} {impact >= 0 ? '+' : ''}{(impact * 100).toFixed(1)}%
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
