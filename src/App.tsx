/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import {
  UserShoppingItem,
  StoreId,
  RouteStrategyPlan,
  RegionProfile,
} from './types/grocery';
import { STARTER_LIST_PRESETS } from './data/starterLists';
import { EXCLUSIVE_COUPONS } from './data/coupons';
import { DEFAULT_REGION } from './data/regions';
import {
  generateAllRoutePlans,
  buildRoutePlanForStoreSet,
  DEFAULT_ROUTE_SETTINGS,
  RouteSettings,
} from './utils/optimizer';
import {
  validateAndSanitizeItem,
  safeLocalStorageSet,
  SECURITY_LIMITS,
  sanitizeQuantity,
  sanitizeText,
} from './utils/security';
import { Header } from './components/Header';
import { ShoppingListView } from './components/ShoppingListView';
import { StoreComparisonView } from './components/StoreComparisonView';
import { ExclusiveCouponsView } from './components/ExclusiveCouponsView';
import { RouteOptimizerView } from './components/RouteOptimizerView';
import { ExportModal } from './components/ExportModal';
import { ImportModal } from './components/ImportModal';
import { RegionSelectorModal } from './components/RegionSelectorModal';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<'list' | 'compare' | 'coupons' | 'route'>('list');

  // Shopping list items state with hardened localStorage initialization
  const [items, setItems] = useState<UserShoppingItem[]>(() => {
    try {
      const saved = localStorage.getItem('cartroute_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitizedList: UserShoppingItem[] = [];
          for (const raw of parsed.slice(0, SECURITY_LIMITS.MAX_LIST_ITEMS)) {
            const valid = validateAndSanitizeItem(raw, 'stored');
            if (valid) sanitizedList.push(valid);
          }
          if (sanitizedList.length > 0) return sanitizedList;
        }
      }
    } catch {
      // fallback
    }
    // Default to Weekly Family Staples preset
    const defaultPreset = STARTER_LIST_PRESETS[0];
    return defaultPreset.items.map((it, idx) => ({
      ...it,
      id: `init_${idx}_${Date.now()}`,
      checked: false,
    }));
  });

  // Clipped coupons state
  const [clippedCouponIds, setClippedCouponIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('cartroute_clipped_coupons');
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // fallback
    }
    // Default clip a couple of deals for immediate delight
    return new Set(['ald_c1', 'fry_c1', 'sfw_c1', 'wmt_c1']);
  });

  // Route calculation settings with backward compatibility
  const [routeSettings, setRouteSettings] = useState<RouteSettings>(() => {
    try {
      const saved = localStorage.getItem('cartroute_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const region =
            parsed.region && typeof parsed.region === 'object' && parsed.region.shortLabel
              ? parsed.region
              : DEFAULT_REGION;
          return {
            ...DEFAULT_ROUTE_SETTINGS,
            ...parsed,
            region,
          };
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_ROUTE_SETTINGS;
  });

  // Selected route plan ID
  const [selectedPlanId, setSelectedPlanId] = useState<RouteStrategyPlan['id']>('two_stop_optimal');

  // Custom store selection
  const [customStoreSelection, setCustomStoreSelection] = useState<StoreId[]>(['aldi', 'frys']);

  // Modals state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);

  const handleSelectRegion = (newRegion: RegionProfile) => {
    const valid = newRegion && newRegion.shortLabel ? newRegion : DEFAULT_REGION;
    setRouteSettings((prev) => ({
      ...prev,
      region: valid,
      gasPricePerGallon: valid.gasPricePerGallon,
      userHomeLabel: `Home (${valid.shortLabel})`,
    }));
  };

  // Sync to localStorage with quota protection
  useEffect(() => {
    safeLocalStorageSet('cartroute_items', items);
  }, [items]);

  useEffect(() => {
    safeLocalStorageSet('cartroute_clipped_coupons', Array.from(clippedCouponIds));
  }, [clippedCouponIds]);

  useEffect(() => {
    safeLocalStorageSet('cartroute_settings', routeSettings);
  }, [routeSettings]);

  // Compute all route plans and store summaries
  const {
    singleCheapest,
    twoStopOptimal,
    threeStopMax,
    storeSummaries,
  } = useMemo(() => {
    return generateAllRoutePlans(items, clippedCouponIds, EXCLUSIVE_COUPONS, routeSettings);
  }, [items, clippedCouponIds, routeSettings]);

  // Compute custom route plan
  const customPlan = useMemo(() => {
    const maxStoreTotal = Math.max(...storeSummaries.map((s) => s.finalTotal), 10);
    const baselineMaxCost = +(maxStoreTotal + 5.0).toFixed(2);

    return buildRoutePlanForStoreSet(
      'custom',
      'Custom Multi-Stop Route',
      `Custom selected stores (${customStoreSelection.length} stops)`,
      'Calculates cheapest basket split and fuel mileage for your selected stores.',
      customStoreSelection.length > 0 ? customStoreSelection : ['aldi', 'walmart'],
      items,
      clippedCouponIds,
      EXCLUSIVE_COUPONS,
      baselineMaxCost,
      routeSettings
    );
  }, [customStoreSelection, items, clippedCouponIds, storeSummaries, routeSettings]);

  // Active plan reference for header metrics and export
  const activePlan =
    selectedPlanId === 'single_cheapest'
      ? singleCheapest
      : selectedPlanId === 'two_stop_optimal'
      ? twoStopOptimal
      : selectedPlanId === 'three_stop_max_savings'
      ? threeStopMax
      : customPlan;

  // Best single store name
  const bestSingleStore = [...storeSummaries].sort((a, b) => a.finalTotal - b.finalTotal)[0];

  const currentRegion: RegionProfile =
    routeSettings?.region && typeof routeSettings.region === 'object' && routeSettings.region.shortLabel
      ? routeSettings.region
      : DEFAULT_REGION;

  // Item management handlers with security bounds
  const handleAddItem = (newItem: Omit<UserShoppingItem, 'id'>) => {
    if (items.length >= SECURITY_LIMITS.MAX_LIST_ITEMS) {
      alert(`Shopping list item limit reached (maximum ${SECURITY_LIMITS.MAX_LIST_ITEMS} items).`);
      return;
    }
    const validated = validateAndSanitizeItem(newItem);
    if (!validated) return;

    setItems((prev) => [...prev, validated]);
  };

  const handleUpdateItemQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((it) => {
          if (it.id === id) {
            const nextQty = Math.max(
              SECURITY_LIMITS.MIN_QUANTITY,
              Math.min(SECURITY_LIMITS.MAX_QUANTITY, +(it.quantity + delta).toFixed(1))
            );
            return { ...it, quantity: nextQty };
          }
          return it;
        })
        .filter((it) => it.quantity > 0)
    );
  };

  const handleToggleItemCheck = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it))
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleClearAll = () => {
    if (items.length > 0 && window.confirm('Clear all items from your shopping list?')) {
      setItems([]);
    }
  };

  // Coupon clipping handlers
  const handleToggleClipCoupon = (couponId: string) => {
    setClippedCouponIds((prev) => {
      const next = new Set(prev);
      if (next.has(couponId)) {
        next.delete(couponId);
      } else {
        next.add(couponId);
      }
      return next;
    });
  };

  const handleClipAllEligible = (eligibleIds: string[]) => {
    setClippedCouponIds((prev) => {
      const next = new Set(prev);
      eligibleIds.forEach((id) => next.add(id));
      return next;
    });
  };

  // Custom store toggle handler
  const handleToggleCustomStore = (storeId: StoreId) => {
    setCustomStoreSelection((prev) => {
      if (prev.includes(storeId)) {
        if (prev.length <= 1) return prev; // Keep at least 1
        return prev.filter((s) => s !== storeId);
      } else {
        return [...prev, storeId];
      }
    });
  };

  // Hardened import handler
  const handleImportItems = (newItems: UserShoppingItem[], replaceExisting: boolean) => {
    const validatedList: UserShoppingItem[] = [];
    for (const raw of newItems) {
      const valid = validateAndSanitizeItem(raw, 'import');
      if (valid) validatedList.push(valid);
    }

    if (replaceExisting) {
      setItems(validatedList.slice(0, SECURITY_LIMITS.MAX_LIST_ITEMS));
    } else {
      setItems((prev) => [...prev, ...validatedList].slice(0, SECURITY_LIMITS.MAX_LIST_ITEMS));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        itemCount={items.length}
        clippedCouponCount={clippedCouponIds.size}
        cheapestStoreName={bestSingleStore?.store.brand || ''}
        maxRouteSavings={twoStopOptimal.netSavingsVsBaseline}
        onOpenExport={() => setIsExportModalOpen(true)}
        regionName={currentRegion.shortLabel}
        onOpenRegionSelector={() => setIsRegionModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'list' && (
          <ShoppingListView
            items={items}
            onAddItem={handleAddItem}
            onUpdateItemQuantity={handleUpdateItemQuantity}
            onToggleItemCheck={handleToggleItemCheck}
            onDeleteItem={handleDeleteItem}
            onClearAll={handleClearAll}
            onOpenImport={() => setIsImportModalOpen(true)}
            onOpenExport={() => setIsExportModalOpen(true)}
            onNavigateTab={setActiveTab}
            storeSummaries={storeSummaries}
            regionName={currentRegion.shortLabel}
            onOpenRegionSelector={() => setIsRegionModalOpen(true)}
          />
        )}

        {activeTab === 'compare' && (
          <StoreComparisonView
            storeSummaries={storeSummaries}
            items={items}
            clippedCouponIds={clippedCouponIds}
            couponsList={EXCLUSIVE_COUPONS}
            onToggleClipCoupon={handleToggleClipCoupon}
            onNavigateTab={setActiveTab}
            region={currentRegion}
            onOpenRegionSelector={() => setIsRegionModalOpen(true)}
          />
        )}

        {activeTab === 'coupons' && (
          <ExclusiveCouponsView
            coupons={EXCLUSIVE_COUPONS}
            clippedCouponIds={clippedCouponIds}
            onToggleClipCoupon={handleToggleClipCoupon}
            onClipAllEligible={handleClipAllEligible}
            items={items}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'route' && (
          <RouteOptimizerView
            singleCheapestPlan={singleCheapest}
            twoStopPlan={twoStopOptimal}
            threeStopPlan={threeStopMax}
            customPlan={customPlan}
            selectedPlanId={selectedPlanId}
            onSelectPlanId={setSelectedPlanId}
            customStoreSelection={customStoreSelection}
            onToggleCustomStore={handleToggleCustomStore}
            routeSettings={{ ...routeSettings, region: currentRegion }}
            onUpdateRouteSettings={setRouteSettings}
            onToggleItemCheck={handleToggleItemCheck}
            onOpenExport={() => setIsExportModalOpen(true)}
          />
        )}
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        items={items}
        activePlan={activePlan}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportItems={handleImportItems}
      />

      {/* Region Selector Modal */}
      <RegionSelectorModal
        isOpen={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
        currentRegion={currentRegion}
        onSelectRegion={handleSelectRegion}
      />

      {/* Subtle Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <strong className="text-slate-800 font-semibold">CartRoute</strong> · Local grocery price comparison & route optimizer covering Walmart, Costco, ALDI, Kroger, Fry's, Safeway, and Bashas'.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Export List
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Transfer List
            </button>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>

      {/* Connectivity & Offline Mode Indicator */}
      <OfflineIndicator />
    </div>
  );
}
