'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMarketStore } from '@/lib/store';

export default function Navigation() {
  const pathname = usePathname();
  const stocks = useMarketStore((s) => s.stocks);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/market', label: 'Market' },
    { path: '/trades', label: 'Trades' },
    { path: '/events', label: 'Events' },
    { path: '/insights', label: 'Insights' },
    { path: '/portfolio', label: 'Portfolio' },
    { path: '/simulation', label: 'Simulation' },
  ];

  // Duplicate stocks for seamless scroll loop
  const tickerStocks = [...stocks, ...stocks];

  return (
    <div className="sticky top-0 z-50">
      {/* Main nav */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-6">
          <div className="flex items-center justify-center h-16 gap-12">
            <Link href="/" className="absolute left-6 font-bold text-xl text-black tracking-tight flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Market Simulator
            </Link>
            <div className="flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`text-sm font-semibold transition-all pb-0.5 border-b-2 ${
                    isActive(item.path)
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-blue-400'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* LiveTicker bar - subtle, light background for blending with white theme */}
      <div className="w-full h-12 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 shadow-xs flex items-center px-6 overflow-hidden">
        <div className="flex items-center h-full ticker-scroll" style={{ width: 'max-content' }}>
          {tickerStocks.map((stock, idx) => {
            const pos = stock.changePercent >= 0;
            return (
              <Link
                key={`${stock.ticker}-${idx}`}
                href={`/stock/${stock.ticker}`}
                className="flex items-center gap-3 flex-shrink-0 hover:bg-gray-100 px-5 h-full transition-colors rounded"
              >
                <span className="text-sm font-mono font-bold text-gray-700">{stock.ticker}</span>
                <span className="text-sm font-mono text-gray-500">${stock.price.toFixed(2)}</span>
                <span className={`text-sm font-mono font-bold ${pos ? 'text-green-600' : 'text-red-600'}`}>
                  {pos ? '▲' : '▼'} {pos ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
