import { useState } from 'react';
import {
  StoreBasketSummary,
  UserShoppingItem,
  StoreId,
  StoreCoupon,
  RegionProfile,
} from '../types/grocery';
import { STORES_DATA } from '../data/stores';
import { STORE_PRICING_TABLE } from '../data/catalog';
import {
  Check,
  AlertTriangle,
  XCircle,
  Tag,
  Scissors,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  Layers,
  Search,
} from 'lucide-react';

interface StoreComparisonViewProps {
  storeSummaries: StoreBasketSummary[];
  items: UserShoppingItem[];
  clippedCouponIds: Set<string>;
  couponsList: StoreCoupon[];
  onToggleClipCoupon: (couponId: string) => void;
  onNavigateTab: (tab: 'coupons' | 'route') => void;
  region?: RegionProfile;
  onOpenRegionSelector?: () => void;
}

export function StoreComparisonView({
  storeSummaries,
  items,
  clippedCouponIds,
  couponsList,
  onToggleClipCoupon,
  onNavigateTab,
  region,
  onOpenRegionSelector,
}: StoreComparisonViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterQuery, setFilterQuery] = useState('');
  const [activeStoreDetail, setActiveStoreDetail] = useState<StoreId | 'all'>('all');

  const categories = ['All', 'Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Pantry & Bakery', 'Beverages & Snacks', 'Household'];

  // Sort stores from lowest total to highest
  const rankedStores = [...storeSummaries].sort((a, b) => a.finalTotal - b.finalTotal);
  const lowestTotal = rankedStores[0]?.finalTotal || 0;

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(filterQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Section: Store Ranking Leaderboard */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Basket Totals & Availability by Store
              </h2>
              {region && (
                <button
                  onClick={onOpenRegionSelector}
                  className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                >
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>Market: {region.shortLabel || 'Phoenix, AZ'}</span>
                  <span className="underline font-normal text-slate-500 ml-0.5">Switch</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Ranked from cheapest to most expensive for all {items.length} items in your list
              {region && ` · Pricing adjusted for ${region.name} index`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('coupons')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
            >
              <Scissors className="w-3.5 h-3.5 text-amber-600" />
              <span>Browse Exclusive Coupons</span>
            </button>
            <button
              onClick={() => onNavigateTab('route')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
            >
              <span>Build Shopping Route</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 7 Store Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {rankedStores.map((summary, rankIdx) => {
            const isWinner = rankIdx === 0;
            const diffFromLowest = summary.finalTotal - lowestTotal;
            const isCostco = summary.storeId === 'costco';
            const availableRate = Math.round((summary.itemsAvailableCount / (items.length || 1)) * 100);

            return (
              <div
                key={summary.storeId}
                onClick={() => setActiveStoreDetail(summary.storeId === activeStoreDetail ? 'all' : summary.storeId)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isWinner
                    ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400/40 shadow-xs'
                    : activeStoreDetail === summary.storeId
                    ? 'bg-slate-100/70 border-slate-400 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                {isWinner && (
                  <div className="absolute -top-2.5 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase tracking-wide">
                    Lowest Basket Total
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {summary.store.brand}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      #{rankIdx + 1}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                      ${summary.finalTotal.toFixed(2)}
                    </div>
                    {diffFromLowest > 0 ? (
                      <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                        +${diffFromLowest.toFixed(2)} vs lowest
                      </div>
                    ) : (
                      <div className="text-[11px] text-emerald-700 font-semibold">
                        Best 1-stop value
                      </div>
                    )}
                  </div>

                  {/* Coupon savings badge if any */}
                  {summary.couponSavings > 0 && (
                    <div className="mt-2 text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-mono font-medium flex items-center gap-1">
                      <Scissors className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                      <span>Saved ${summary.couponSavings.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Stock Availability status */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100/80 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">In Stock:</span>
                      <span className={`font-semibold font-mono tabular-nums ${availableRate >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {summary.itemsAvailableCount}/{items.length}
                      </span>
                    </div>
                    {summary.itemsOutOfStockCount > 0 && (
                      <div className="text-[10px] text-rose-600 flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                        <span>{summary.itemsOutOfStockCount} unavailable</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100/80 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>{summary.store.distanceMiles} mi</span>
                  <span>{summary.store.drivingMinutes} min</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Detailed Price Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              Itemized Store Price Comparison
            </h3>
            <span className="text-xs text-slate-400">· Green highlights indicate lowest local shelf price</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter items..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                    selectedCategory === cat ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[980px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-60">Item & Quantity</th>
                <th className="py-3 px-3 text-center">Walmart</th>
                <th className="py-3 px-3 text-center">Costco Wholesale</th>
                <th className="py-3 px-3 text-center">ALDI</th>
                <th className="py-3 px-3 text-center">Kroger</th>
                <th className="py-3 px-3 text-center">Fry's Food</th>
                <th className="py-3 px-3 text-center">Safeway</th>
                <th className="py-3 px-3 text-center">Bashas'</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredItems.map((item) => {
                // Find minimum price for this item across all 7 stores
                let minPrice = Infinity;
                storeSummaries.forEach((sum) => {
                  const ip = sum.itemPrices.find((p) => p.userItem.id === item.id);
                  if (ip && ip.availability !== 'out_of_stock' && ip.price < minPrice) {
                    minPrice = ip.price;
                  }
                });

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Item Column */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.quantity} {item.unit} · {item.category}
                      </div>
                    </td>

                    {/* Stores: Walmart, Costco, Aldi, Kroger, Frys, Safeway, Bashas */}
                    {(['walmart', 'costco', 'aldi', 'kroger', 'frys', 'safeway', 'bashas'] as StoreId[]).map((sid) => {
                      const summary = storeSummaries.find((s) => s.storeId === sid);
                      const ip = summary?.itemPrices.find((p) => p.userItem.id === item.id);

                      if (!ip || ip.availability === 'out_of_stock') {
                        return (
                          <td key={sid} className="py-3 px-3 text-center bg-slate-50/30">
                            <span className="text-[11px] text-slate-400 font-medium">Out of Stock</span>
                          </td>
                        );
                      }

                      const isLowest = Math.abs(ip.price - minPrice) < 0.01;
                      const hasCoupon = !!ip.couponApplied;

                      return (
                        <td
                          key={sid}
                          className={`py-3 px-3 text-center ${
                            isLowest ? 'bg-emerald-50/40 font-bold' : ''
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-center gap-1">
                              <span
                                className={`font-mono tabular-nums ${
                                  isLowest
                                    ? 'text-emerald-700 font-bold text-sm'
                                    : 'text-slate-800'
                                }`}
                              >
                                ${ip.price.toFixed(2)}
                              </span>
                              {isLowest && (
                                <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-1 rounded font-normal">
                                  Best
                                </span>
                              )}
                            </div>

                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[120px] mx-auto">
                              {ip.unitPriceLabel}
                            </div>

                            {ip.isClubBulk && (
                              <div className="text-[9px] text-indigo-700 font-medium">
                                Bulk Pack
                              </div>
                            )}

                            {hasCoupon && (
                              <div className="inline-flex items-center gap-0.5 text-[10px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded font-mono">
                                <Scissors className="w-2.5 h-2.5" />
                                <span>-${ip.couponApplied?.discountValue.toFixed(2)}</span>
                              </div>
                            )}

                            {ip.availability === 'low_stock' && (
                              <div className="text-[10px] text-amber-600 font-medium">
                                Low Stock
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Matrix Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>Green: Lowest Local Price</span>
            </span>
            <span className="flex items-center gap-1">
              <Scissors className="w-3 h-3 text-amber-600" />
              <span>Coupon Clipped</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-indigo-600 font-semibold text-[11px]">Bulk</span>
              <span>Costco Wholesale Club Size</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('route')}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <span>Build Budget Route</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
