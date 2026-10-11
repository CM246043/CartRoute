import { ShoppingBag, MapPin, Share2, Sparkles, Navigation } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: 'list' | 'compare' | 'coupons' | 'route';
  setActiveTab: (tab: 'list' | 'compare' | 'coupons' | 'route') => void;
  itemCount: number;
  clippedCouponCount: number;
  cheapestStoreName: string;
  maxRouteSavings: number;
  onOpenExport: () => void;
  regionName?: string;
  onOpenRegionSelector: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  itemCount,
  clippedCouponCount,
  cheapestStoreName,
  maxRouteSavings,
  onOpenExport,
  regionName,
  onOpenRegionSelector,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('list');
                }}
                className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap"
              >
                CartRoute
              </a>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 font-medium">
                Local Grocery & Route Optimizer
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
                activeTab === 'list'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Shopping List</span>
              <span className="text-xs bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded font-mono tabular-nums">
                {itemCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'compare'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Store Comparison</span>
              {cheapestStoreName && (
                <span className="hidden xl:inline text-xs text-emerald-700 font-normal">
                  · Best: {cheapestStoreName}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
                activeTab === 'coupons'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Exclusive Coupons</span>
              {clippedCouponCount > 0 && (
                <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono tabular-nums">
                  {clippedCouponCount} clipped
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('route')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'route'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>Route Optimizer</span>
              {maxRouteSavings > 0 && (
                <span className="text-xs font-mono tabular-nums text-emerald-600 font-medium">
                  +${maxRouteSavings.toFixed(0)} saved
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Primary action button, PWA install, and market selector */}
          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton />

            <button
              onClick={onOpenRegionSelector}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="Change your local grocery market & pricing index"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{regionName || 'Phoenix, AZ'}</span>
            </button>

            <button
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Export List</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation bar */}
        <div className="md:hidden flex items-center justify-between border-t border-slate-100 py-2 overflow-x-auto gap-2 text-xs font-medium scrollbar-none">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'list' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            List ({itemCount})
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'compare' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            Stores (7)
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'coupons' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            Coupons ({clippedCouponCount})
          </button>
          <button
            onClick={() => setActiveTab('route')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'route' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            Route Map
          </button>
        </div>
      </div>
    </header>
  );
}
