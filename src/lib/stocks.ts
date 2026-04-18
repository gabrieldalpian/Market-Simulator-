import { Stock } from './types';

export const initialStocks: Stock[] = [
  // ═══ Technology ═══
  { ticker: 'NXAI', name: 'NexaAI Corp', sector: 'Technology', price: 342.50, openPrice: 342.50, change: 0, changePercent: 0, momentum: 0.020, volatility: 0.030, high: 342.50, low: 342.50 },
  { ticker: 'PLSR', name: 'Pulsar Robotics', sector: 'Technology', price: 267.15, openPrice: 267.15, change: 0, changePercent: 0, momentum: 0.012, volatility: 0.028, high: 267.15, low: 267.15 },
  { ticker: 'CLDX', name: 'CloudMatrix Inc', sector: 'Technology', price: 189.40, openPrice: 189.40, change: 0, changePercent: 0, momentum: 0.008, volatility: 0.032, high: 189.40, low: 189.40 },
  { ticker: 'ZYPHR', name: 'Zephyr Systems', sector: 'Technology', price: 412.80, openPrice: 412.80, change: 0, changePercent: 0, momentum: 0.018, volatility: 0.026, high: 412.80, low: 412.80 },
  { ticker: 'DTLK', name: 'DataLake AI', sector: 'Technology', price: 156.25, openPrice: 156.25, change: 0, changePercent: 0, momentum: -0.005, volatility: 0.038, high: 156.25, low: 156.25 },

  // ═══ Energy ═══
  { ticker: 'QFLX', name: 'QuantumFlux Energy', sector: 'Energy', price: 128.75, openPrice: 128.75, change: 0, changePercent: 0, momentum: -0.010, volatility: 0.040, high: 128.75, low: 128.75 },
  { ticker: 'SOLV', name: 'SolarVault Power', sector: 'Energy', price: 95.30, openPrice: 95.30, change: 0, changePercent: 0, momentum: 0.015, volatility: 0.035, high: 95.30, low: 95.30 },
  { ticker: 'FSNR', name: 'Fusion Reactor Ltd', sector: 'Energy', price: 287.60, openPrice: 287.60, change: 0, changePercent: 0, momentum: 0.022, volatility: 0.042, high: 287.60, low: 287.60 },
  { ticker: 'HDRG', name: 'HydroGen Systems', sector: 'Energy', price: 73.45, openPrice: 73.45, change: 0, changePercent: 0, momentum: 0.006, volatility: 0.048, high: 73.45, low: 73.45 },

  // ═══ Healthcare ═══
  { ticker: 'SYNR', name: 'Syntherix Biotech', sector: 'Healthcare', price: 215.30, openPrice: 215.30, change: 0, changePercent: 0, momentum: 0.010, volatility: 0.025, high: 215.30, low: 215.30 },
  { ticker: 'GNMX', name: 'GenoMax Labs', sector: 'Healthcare', price: 178.90, openPrice: 178.90, change: 0, changePercent: 0, momentum: 0.007, volatility: 0.030, high: 178.90, low: 178.90 },
  { ticker: 'NRVN', name: 'NeuraVein Medical', sector: 'Healthcare', price: 324.15, openPrice: 324.15, change: 0, changePercent: 0, momentum: 0.014, volatility: 0.022, high: 324.15, low: 324.15 },
  { ticker: 'BPHR', name: 'BioPharma Plus', sector: 'Healthcare', price: 142.70, openPrice: 142.70, change: 0, changePercent: 0, momentum: -0.003, volatility: 0.034, high: 142.70, low: 142.70 },

  // ═══ Finance ═══
  { ticker: 'CRDL', name: 'Cradle Finance', sector: 'Finance', price: 178.90, openPrice: 178.90, change: 0, changePercent: 0, momentum: -0.005, volatility: 0.030, high: 178.90, low: 178.90 },
  { ticker: 'VLTX', name: 'Vaultex Capital', sector: 'Finance', price: 256.40, openPrice: 256.40, change: 0, changePercent: 0, momentum: 0.009, volatility: 0.025, high: 256.40, low: 256.40 },
  { ticker: 'FNXY', name: 'FinexAI Trading', sector: 'Finance', price: 198.55, openPrice: 198.55, change: 0, changePercent: 0, momentum: 0.011, volatility: 0.036, high: 198.55, low: 198.55 },
  { ticker: 'LDGR', name: 'Ledger Prime', sector: 'Finance', price: 88.20, openPrice: 88.20, change: 0, changePercent: 0, momentum: -0.008, volatility: 0.032, high: 88.20, low: 88.20 },

  // ═══ Aerospace ═══
  { ticker: 'ORBX', name: 'OrbitX Aerospace', sector: 'Aerospace', price: 456.20, openPrice: 456.20, change: 0, changePercent: 0, momentum: 0.015, volatility: 0.020, high: 456.20, low: 456.20 },
  { ticker: 'STRX', name: 'StarAxis Corp', sector: 'Aerospace', price: 312.90, openPrice: 312.90, change: 0, changePercent: 0, momentum: 0.010, volatility: 0.024, high: 312.90, low: 312.90 },
  { ticker: 'LUNR', name: 'Lunar Industries', sector: 'Aerospace', price: 234.50, openPrice: 234.50, change: 0, changePercent: 0, momentum: 0.016, volatility: 0.028, high: 234.50, low: 234.50 },

  // ═══ Entertainment ═══
  { ticker: 'VRLD', name: 'VirtuWorld Media', sector: 'Entertainment', price: 89.45, openPrice: 89.45, change: 0, changePercent: 0, momentum: 0.005, volatility: 0.035, high: 89.45, low: 89.45 },
  { ticker: 'STRM', name: 'StreamWave Inc', sector: 'Entertainment', price: 145.60, openPrice: 145.60, change: 0, changePercent: 0, momentum: 0.009, volatility: 0.040, high: 145.60, low: 145.60 },
  { ticker: 'MTVS', name: 'Metaverse Studios', sector: 'Entertainment', price: 67.80, openPrice: 67.80, change: 0, changePercent: 0, momentum: -0.004, volatility: 0.045, high: 67.80, low: 67.80 },

  // ═══ Materials ═══
  { ticker: 'TRRN', name: 'TerraNova Mining', sector: 'Materials', price: 65.80, openPrice: 65.80, change: 0, changePercent: 0, momentum: 0.008, volatility: 0.045, high: 65.80, low: 65.80 },
  { ticker: 'ALLM', name: 'AlloyMet Corp', sector: 'Materials', price: 112.40, openPrice: 112.40, change: 0, changePercent: 0, momentum: 0.004, volatility: 0.038, high: 112.40, low: 112.40 },
  { ticker: 'GRPH', name: 'GrapheneX Ltd', sector: 'Materials', price: 203.10, openPrice: 203.10, change: 0, changePercent: 0, momentum: 0.013, volatility: 0.033, high: 203.10, low: 203.10 },

  // ═══ Consumer ═══
  { ticker: 'NBLX', name: 'NobleBrand Luxury', sector: 'Consumer', price: 334.70, openPrice: 334.70, change: 0, changePercent: 0, momentum: 0.006, volatility: 0.022, high: 334.70, low: 334.70 },
  { ticker: 'FMRT', name: 'FreshMart Global', sector: 'Consumer', price: 78.90, openPrice: 78.90, change: 0, changePercent: 0, momentum: -0.002, volatility: 0.018, high: 78.90, low: 78.90 },
  { ticker: 'RVLT', name: 'Revolt Apparel', sector: 'Consumer', price: 52.35, openPrice: 52.35, change: 0, changePercent: 0, momentum: 0.003, volatility: 0.042, high: 52.35, low: 52.35 },

  // ═══ Industrial ═══
  { ticker: 'MFGX', name: 'ManufactX Corp', sector: 'Industrial', price: 167.85, openPrice: 167.85, change: 0, changePercent: 0, momentum: 0.005, volatility: 0.026, high: 167.85, low: 167.85 },
  { ticker: 'ATMT', name: 'AutoMate Systems', sector: 'Industrial', price: 245.30, openPrice: 245.30, change: 0, changePercent: 0, momentum: 0.011, volatility: 0.030, high: 245.30, low: 245.30 },
  { ticker: 'DRNE', name: 'DroneForge Inc', sector: 'Industrial', price: 189.60, openPrice: 189.60, change: 0, changePercent: 0, momentum: 0.014, volatility: 0.036, high: 189.60, low: 189.60 },

  // ═══ Telecom ═══
  { ticker: 'WVLN', name: 'WaveLink Networks', sector: 'Telecom', price: 118.45, openPrice: 118.45, change: 0, changePercent: 0, momentum: 0.003, volatility: 0.020, high: 118.45, low: 118.45 },
  { ticker: 'SGNL', name: 'Signal Dynamics', sector: 'Telecom', price: 86.70, openPrice: 86.70, change: 0, changePercent: 0, momentum: -0.006, volatility: 0.028, high: 86.70, low: 86.70 },
];
