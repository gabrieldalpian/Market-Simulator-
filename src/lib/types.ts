export interface Stock {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  openPrice: number;
  change: number;
  changePercent: number;
  momentum: number;
  volatility: number;
  high: number;
  low: number;
}

export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface MarketEvent {
  id: string;
  name: string;
  description: string;
  timestamp: number;
  impacts: Record<string, number>;
}

export interface EventDefinition {
  id: string;
  name: string;
  description: string;
  impacts: Record<string, number>;
  color: string;
}

export interface Holding {
  ticker: string;
  shares: number;
  avgCost: number;
}
