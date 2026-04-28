import { Stock, SectorStats } from './types';

export function getSectorStats(stocks: Stock[]): Map<string, SectorStats> {
  const sectors = new Map<string, SectorStats>();

  for (const stock of stocks) {
    if (!sectors.has(stock.sector)) {
      sectors.set(stock.sector, {
        sector: stock.sector,
        avgPrice: 0,
        avgChange: 0,
        avgVolatility: 0,
        avgMomentum: 0,
        stockCount: 0,
      });
    }

    const stat = sectors.get(stock.sector)!;
    stat.avgPrice += stock.price;
    stat.avgChange += stock.changePercent;
    stat.avgVolatility += stock.volatility;
    stat.avgMomentum += stock.momentum;
    stat.stockCount += 1;
  }

  for (const stat of Array.from(sectors.values())) {
    stat.avgPrice /= stat.stockCount;
    stat.avgChange /= stat.stockCount;
    stat.avgVolatility /= stat.stockCount;
    stat.avgMomentum /= stat.stockCount;
  }

  return sectors;
}

export function getRelativeMomentum(stock: Stock, sectorStats: Map<string, SectorStats>): number {
  const sectorStat = sectorStats.get(stock.sector);
  if (!sectorStat) return 0;
  return stock.momentum - sectorStat.avgMomentum;
}

export function getMomentumTrend(stock: Stock): 'accelerating' | 'rising' | 'flat' | 'falling' | 'crashing' {
  if (stock.momentum > 0.015) return 'accelerating';
  if (stock.momentum > 0.005) return 'rising';
  if (stock.momentum > -0.005) return 'flat';
  if (stock.momentum > -0.015) return 'falling';
  return 'crashing';
}

export function getMarketBreadth(stocks: Stock[]): { advancing: number; declining: number; ratio: number } {
  const advancing = stocks.filter(s => s.changePercent > 0).length;
  const declining = stocks.filter(s => s.changePercent < 0).length;
  const ratio = declining > 0 ? advancing / declining : advancing;

  return { advancing, declining, ratio };
}

export function getVolatilityScore(stocks: Stock[]): { avg: number; max: number; min: number } {
  const volatilities = stocks.map(s => s.volatility);
  return {
    avg: volatilities.reduce((a, b) => a + b, 0) / volatilities.length,
    max: Math.max(...volatilities),
    min: Math.min(...volatilities),
  };
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getEventImpactText(impact: number): string {
  const absImpact = Math.abs(impact);
  if (absImpact > 0.05) return 'Severe';
  if (absImpact > 0.03) return 'Major';
  if (absImpact > 0.01) return 'Moderate';
  return 'Minor';
}
