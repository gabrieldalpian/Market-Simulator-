'use client';

import Link from 'next/link';
import { useMarketStore } from '@/lib/store';
import MiniChart from './MiniChart';

export default function MarketTable() {
  const stocks = useMarketStore((s) => s.stocks);
  const priceHistory = useMarketStore((s) => s.priceHistory);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Market Overview ({stocks.length} Stocks)</h2>
      </div>
      <div className="overflow-x-auto max-h-[800px] overflow-y-auto">
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
              <th className="text-right px-5 py-3">Momentum</th>
              <th className="text-right px-5 py-3">Volatility</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => {
              const isPositive = stock.change >= 0;
              const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
              const hist = priceHistory[stock.ticker] || [];
              const chartData = hist.slice(-25).map((p) => ({ price: p.price }));

              return (
                <tr
                  key={stock.ticker}
                  className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/stock/${stock.ticker}`}
                      className="font-mono font-bold text-blue-600 hover:text-blue-700 text-base"
                    >
                      {stock.ticker}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {stock.name}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600 font-medium">
                      {stock.sector}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-mono font-bold text-base text-gray-900">
                    ${stock.price.toFixed(2)}
                  </td>
                  <td className={`px-5 py-4 text-right font-mono text-sm font-semibold ${changeColor}`}>
                    {isPositive ? '+' : ''}{stock.change.toFixed(2)}
                  </td>
                  <td className={`px-5 py-4 text-right`}>
                    <span className={`font-mono font-bold text-sm px-2.5 py-1 rounded-md ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-center">
                      <MiniChart data={chartData} width={80} height={28} positive={isPositive} />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-sm text-gray-500">
                    {stock.momentum > 0 ? '+' : ''}{stock.momentum.toFixed(4)}
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-sm text-gray-500">
                    {(stock.volatility * 100).toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
