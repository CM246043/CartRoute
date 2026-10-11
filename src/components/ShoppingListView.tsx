import { useState } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  FileDown,
  FileUp,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Search,
  ArrowRight,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { UserShoppingItem, StoreBasketSummary } from '../types/grocery';
import { CATALOG_ITEMS } from '../data/catalog';
import { STORE_PRICING_TABLE } from '../data/catalog';
import { STORES_DATA } from '../data/stores';
import { sanitizeText, SECURITY_LIMITS } from '../utils/security';

interface ShoppingListViewProps {
  items: UserShoppingItem[];
  onAddItem: (newItem: Omit<UserShoppingItem, 'id'>) => void;
  onUpdateItemQuantity: (id: string, delta: number) => void;
  onToggleItemCheck: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onOpenImport: () => void;
  onOpenExport: () => void;
  onNavigateTab: (tab: 'compare' | 'coupons' | 'route') => void;
  storeSummaries: StoreBasketSummary[];
  regionName?: string;
  onOpenRegionSelector?: () => void;
}

export function ShoppingListView({
  items,
  onAddItem,
  onUpdateItemQuantity,
  onToggleItemCheck,
  onDeleteItem,
  onClearAll,
  onOpenImport,
  onOpenExport,
  onNavigateTab,
  storeSummaries,
  regionName,
  onOpenRegionSelector,
}: ShoppingListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showQuickCatalog, setShowQuickCatalog] = useState(false);

  const categories = ['All', 'Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Pantry & Bakery', 'Beverages & Snacks', 'Household'];

  // Filter catalog items for autocomplete
  const filteredCatalog = CATALOG_ITEMS.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleSelectCatalogItem = (catalogItem: typeof CATALOG_ITEMS[0]) => {
    onAddItem({
      catalogItemId: catalogItem.id,
      name: catalogItem.name,
      quantity: catalogItem.defaultQty,
      unit: catalogItem.defaultUnit,
      category: catalogItem.category,
      allowSubstitutions: true,
    });
    setSearchQuery('');
    setShowQuickCatalog(false);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if matches exact catalog
    const exact = CATALOG_ITEMS.find((c) => c.name.toLowerCase() === searchQuery.toLowerCase());
    if (exact) {
      handleSelectCatalogItem(exact);
    } else {
      const safeName = sanitizeText(searchQuery, SECURITY_LIMITS.MAX_ITEM_NAME_LENGTH);
      if (!safeName) return;

      onAddItem({
        catalogItemId: 'pasta_spaghetti', // fallback for pricing benchmark
        name: safeName,
        quantity: 1,
        unit: 'each',
        category: 'Pantry & Bakery',
        allowSubstitutions: true,
      });
      setSearchQuery('');
      setShowQuickCatalog(false);
    }
  };

  // Find lowest single store
  const bestSingle = [...storeSummaries].sort((a, b) => a.finalTotal - b.finalTotal)[0];
  const worstSingle = [...storeSummaries].sort((a, b) => b.finalTotal - a.finalTotal)[0];
  const spreadSavings = worstSingle && bestSingle ? +(worstSingle.finalTotal - bestSingle.finalTotal).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stat Strip */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shopping List</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{items.length}</span>
              <span className="text-xs text-slate-500">items listed</span>
            </div>
            <div className="text-xs text-slate-400">
              {items.filter((i) => i.checked).length} marked completed
            </div>
          </div>

          <div className="space-y-1 md:pl-4 pt-3 md:pt-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cheapest Single Store</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
                ${bestSingle ? bestSingle.finalTotal.toFixed(2) : '0.00'}
              </span>
              <span className="text-xs font-semibold text-slate-800">
                {bestSingle ? bestSingle.store.brand : '—'}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              100% of items at 1 single stop
            </div>
          </div>

          <div className="space-y-1 md:pl-4 pt-3 md:pt-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Store Price Spread</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-700 font-mono tabular-nums">
                +${spreadSavings.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500">difference</span>
            </div>
            <div className="text-xs text-slate-500">
              Between {bestSingle?.store.brand} vs {worstSingle?.store.brand}
            </div>
          </div>

          <div className="space-y-2 md:pl-4 pt-3 md:pt-0 flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenImport}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              >
                <FileUp className="w-3.5 h-3.5 text-slate-500" />
                <span>Import / Paste</span>
              </button>
              <button
                onClick={onOpenExport}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export List</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-500 text-center">
              Never re-type items: export & import anytime
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <form onSubmit={handleAddCustom} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              maxLength={SECURITY_LIMITS.MAX_ITEM_NAME_LENGTH}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowQuickCatalog(true);
              }}
              onFocus={() => setShowQuickCatalog(true)}
              placeholder="Add an item (e.g. Milk, Eggs, Boneless Chicken, Avocados, Oats)..."
              className="w-full pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Item</span>
          </button>
        </form>

        {/* Category Filter Chips for Quick Picking */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setShowQuickCatalog(true);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
          {items.length > 0 && (
            <button
              onClick={onClearAll}
              className="ml-auto text-xs text-slate-400 hover:text-rose-600 transition-colors whitespace-nowrap flex items-center gap-1 px-2 py-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear list</span>
            </button>
          )}
        </div>

        {/* Quick Suggestion Dropdown Grid */}
        {showQuickCatalog && filteredCatalog.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Popular Catalog Staples (Click to add)
              </span>
              <button
                onClick={() => setShowQuickCatalog(false)}
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Hide
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {filteredCatalog.slice(0, 12).map((item) => {
                // Find lowest price
                let minP = Infinity;
                let minStore = '';
                Object.entries(STORE_PRICING_TABLE).forEach(([sid, prices]) => {
                  if (prices[item.id]) {
                    const cost = prices[item.id].salePrice ?? prices[item.id].regularPrice;
                    if (cost < minP) {
                      minP = cost;
                      minStore = STORES_DATA[sid]?.brand;
                    }
                  }
                });

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectCatalogItem(item)}
                    className="p-2 text-left bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 rounded-lg transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-800 line-clamp-1">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {item.standardSizeLabel}
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-700 font-semibold font-mono tabular-nums">
                        ${minP.toFixed(2)}
                      </span>
                      <span className="text-slate-400 text-[10px]">at {minStore}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Shopping List Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">Items in Your Cart</h3>
            <span className="text-xs text-slate-500 font-mono tabular-nums">({items.length})</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => onNavigateTab('compare')}
              className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 transition-colors"
            >
              <span>Compare All 7 Stores</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-700">Your shopping list is empty</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Add groceries above, paste text from your notes, or load a pre-built starter basket to find the cheapest local prices.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                onClick={onOpenImport}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Import / Load Preset Basket
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => {
              // Calculate price range across stores for this item
              let lowestPrice = Infinity;
              let lowestStore = '';
              let highestPrice = 0;
              let highestStore = '';

              Object.entries(STORE_PRICING_TABLE).forEach(([sid, prices]) => {
                const pr = prices[item.catalogItemId];
                if (pr && pr.availability !== 'out_of_stock') {
                  const effective = pr.salePrice ?? pr.regularPrice;
                  if (effective < lowestPrice) {
                    lowestPrice = effective;
                    lowestStore = STORES_DATA[sid]?.brand;
                  }
                  if (effective > highestPrice) {
                    highestPrice = effective;
                    highestStore = STORES_DATA[sid]?.brand;
                  }
                }
              });

              return (
                <div
                  key={item.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors ${
                    item.checked ? 'bg-slate-50/40 opacity-60' : ''
                  }`}
                >
                  {/* Left: Checkbox + Name + Details */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => onToggleItemCheck(item.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                    >
                      {item.checked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold text-slate-900 ${
                            item.checked ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {item.name}
                        </span>
                        <span className="text-xs text-slate-400">· {item.category}</span>
                      </div>
                      {/* Price spread across local stores */}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="text-emerald-700 font-semibold font-mono tabular-nums">
                          Low: ${lowestPrice.toFixed(2)} ({lowestStore})
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-500 font-mono tabular-nums">
                          High: ${highestPrice.toFixed(2)} ({highestStore})
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-amber-700 font-medium">
                          Save ${(highestPrice - lowestPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantity controls + Unit + Delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-8 sm:pl-0">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                      <button
                        onClick={() => onUpdateItemQuantity(item.id, -1)}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors text-xs font-bold"
                      >
                        -
                      </button>
                      <div className="px-3 py-1 text-xs font-semibold text-slate-800 font-mono tabular-nums min-w-[3.5rem] text-center bg-slate-50/50">
                        {item.quantity} {item.unit}
                      </div>
                      <button
                        onClick={() => onUpdateItemQuantity(item.id, 1)}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors text-xs font-bold"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Footer */}
        {items.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 text-center sm:text-left flex items-center gap-1.5 flex-wrap">
              <span>Prices benchmarked for local <strong className="text-slate-700">{regionName || 'Phoenix, AZ'}</strong> stores (Walmart, Costco, ALDI, Kroger, Fry's, Safeway, Bashas').</span>
              {onOpenRegionSelector && (
                <button
                  onClick={onOpenRegionSelector}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold underline text-[11px]"
                >
                  Change Market
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => onNavigateTab('compare')}
                className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
              >
                Compare Store Prices
              </button>
              <button
                onClick={() => onNavigateTab('route')}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
              >
                <span>Optimize Shopping Route</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
