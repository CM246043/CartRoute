import { useState } from 'react';
import { StoreCoupon, UserShoppingItem, StoreId } from '../types/grocery';
import { STORES_DATA } from '../data/stores';
import { CATALOG_ITEMS } from '../data/catalog';
import { Scissors, Check, Sparkles, Filter, Tag, Calendar, ArrowRight, CheckCheck } from 'lucide-react';

interface ExclusiveCouponsViewProps {
  coupons: StoreCoupon[];
  clippedCouponIds: Set<string>;
  onToggleClipCoupon: (couponId: string) => void;
  onClipAllEligible: (eligibleIds: string[]) => void;
  items: UserShoppingItem[];
  onNavigateTab: (tab: 'route' | 'compare') => void;
}

export function ExclusiveCouponsView({
  coupons,
  clippedCouponIds,
  onToggleClipCoupon,
  onClipAllEligible,
  items,
  onNavigateTab,
}: ExclusiveCouponsViewProps) {
  const [selectedStore, setSelectedStore] = useState<StoreId | 'all'>('all');
  const [onlyMatchingCart, setOnlyMatchingCart] = useState(false);

  const cartCatalogIds = new Set(items.map((i) => i.catalogItemId));

  // Filter coupons
  const filteredCoupons = coupons.filter((coupon) => {
    const matchesStore = selectedStore === 'all' || coupon.storeId === selectedStore;
    const matchesCart = !onlyMatchingCart || cartCatalogIds.has(coupon.appliedItemId);
    return matchesStore && matchesCart;
  });

  // Calculate potential savings for current cart items
  const eligibleCouponsForCart = coupons.filter((c) => cartCatalogIds.has(c.appliedItemId));
  const totalEligibleSavings = eligibleCouponsForCart.reduce((acc, c) => acc + c.discountValue, 0);

  const currentlyClippedSavings = coupons
    .filter((c) => clippedCouponIds.has(c.id) && cartCatalogIds.has(c.appliedItemId))
    .reduce((acc, c) => acc + c.discountValue, 0);

  const handleClipAll = () => {
    const ids = eligibleCouponsForCart.map((c) => c.id);
    onClipAllEligible(ids);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">
                Exclusive Store Coupons & Loyalty Deals
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              Digital clip coupons, member book savings, and circular rollbacks across Walmart, Costco, ALDI, Kroger, Fry's, Safeway, and Bashas'.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">Cart Coupon Savings</div>
              <div className="text-xl font-bold text-amber-700 font-mono tabular-nums">
                ${currentlyClippedSavings.toFixed(2)}
              </div>
            </div>

            <button
              onClick={handleClipAll}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs shrink-0"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Clip All {eligibleCouponsForCart.length} Matching Deals</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs by Store */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedStore('all')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              selectedStore === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Stores ({coupons.length})
          </button>
          {(['walmart', 'costco', 'aldi', 'kroger', 'frys', 'safeway', 'bashas'] as StoreId[]).map((sid) => {
            const count = coupons.filter((c) => c.storeId === sid).length;
            return (
              <button
                key={sid}
                onClick={() => setSelectedStore(sid)}
                className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                  selectedStore === sid
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {STORES_DATA[sid]?.brand} ({count})
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
          <input
            type="checkbox"
            checked={onlyMatchingCart}
            onChange={(e) => setOnlyMatchingCart(e.target.checked)}
            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          <span className="font-medium">Only show coupons for items on my list ({eligibleCouponsForCart.length})</span>
        </label>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCoupons.map((coupon) => {
          const isClipped = clippedCouponIds.has(coupon.id);
          const isRelevantToCart = cartCatalogIds.has(coupon.appliedItemId);
          const store = STORES_DATA[coupon.storeId];
          const matchedItem = CATALOG_ITEMS.find((c) => c.id === coupon.appliedItemId);

          return (
            <div
              key={coupon.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between relative ${
                isClipped
                  ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-300/40 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              {/* Header: Store Identity + Badge */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: store.primaryColor }}
                    />
                    <span className="text-xs font-bold text-slate-900">
                      {store.brand}
                    </span>
                  </div>

                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                    {coupon.exclusiveBadge || 'Exclusive'}
                  </span>
                </div>

                {/* Discount Header */}
                <div className="space-y-1">
                  <div className="text-base font-bold text-slate-900 leading-snug">
                    {coupon.title}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {coupon.description}
                  </p>
                </div>

                {/* Target Item Tag */}
                {matchedItem && (
                  <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600 truncate mr-2">
                      Applies to: <strong className="text-slate-800">{matchedItem.name}</strong>
                    </span>
                    {isRelevantToCart ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded shrink-0">
                        In Your Cart
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 shrink-0">
                        Not in cart
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Card Footer: Code + Expiration + Clip Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                  <div className="text-slate-700 font-semibold">{coupon.code}</div>
                  <div>{coupon.expiration}</div>
                </div>

                <button
                  onClick={() => onToggleClipCoupon(coupon.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                    isClipped
                      ? 'bg-amber-600 text-white shadow-2xs hover:bg-amber-700'
                      : 'bg-slate-900 text-white hover:bg-slate-800 shadow-2xs'
                  }`}
                >
                  {isClipped ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Clipped (-${coupon.discountValue.toFixed(2)})</span>
                    </>
                  ) : (
                    <>
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Clip Deal</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-slate-500">
          Clipped coupons automatically discount your shopping route totals and store comparisons.
        </span>
        <button
          onClick={() => onNavigateTab('route')}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <span>Calculate Route Savings with Clipped Deals</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
