import { useState } from 'react';
import {
  RouteStrategyPlan,
  UserShoppingItem,
  StoreId,
  StoreCoupon,
} from '../types/grocery';
import { RouteSettings } from '../utils/optimizer';
import { STORES_DATA } from '../data/stores';
import { DEFAULT_REGION } from '../data/regions';
import { generateGoogleMapsRouteUrl } from '../utils/exportImport';
import {
  Navigation,
  Fuel,
  Clock,
  MapPin,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Share2,
  Settings2,
  CheckCircle2,
  Circle,
  Scissors,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface RouteOptimizerViewProps {
  singleCheapestPlan: RouteStrategyPlan;
  twoStopPlan: RouteStrategyPlan;
  threeStopPlan: RouteStrategyPlan;
  customPlan: RouteStrategyPlan;
  selectedPlanId: RouteStrategyPlan['id'];
  onSelectPlanId: (id: RouteStrategyPlan['id']) => void;
  customStoreSelection: StoreId[];
  onToggleCustomStore: (storeId: StoreId) => void;
  routeSettings: RouteSettings;
  onUpdateRouteSettings: (settings: RouteSettings) => void;
  onToggleItemCheck: (itemId: string) => void;
  onOpenExport: () => void;
}

export function RouteOptimizerView({
  singleCheapestPlan,
  twoStopPlan,
  threeStopPlan,
  customPlan,
  selectedPlanId,
  onSelectPlanId,
  customStoreSelection,
  onToggleCustomStore,
  routeSettings,
  onUpdateRouteSettings,
  onToggleItemCheck,
  onOpenExport,
}: RouteOptimizerViewProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [activePinDetail, setActivePinDetail] = useState<StoreId | 'home' | null>(null);

  // Pick active plan
  const activePlan =
    selectedPlanId === 'single_cheapest'
      ? singleCheapestPlan
      : selectedPlanId === 'two_stop_optimal'
      ? twoStopPlan
      : selectedPlanId === 'three_stop_max_savings'
      ? threeStopPlan
      : customPlan;

  const mapsUrl = generateGoogleMapsRouteUrl(activePlan);

  // Home coordinates for SVG map
  const homeCoords = { x: 50, y: 50 };

  return (
    <div className="space-y-6">
      {/* Strategy Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* 1-Stop Plan */}
        <div
          onClick={() => onSelectPlanId('single_cheapest')}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
            selectedPlanId === 'single_cheapest'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                selectedPlanId === 'single_cheapest' ? 'text-emerald-400' : 'text-slate-500'
              }`}>
                1-Stop Quick Run
              </span>
              <span className="text-xs font-mono">
                {singleCheapestPlan.totalDistanceMiles} mi
              </span>
            </div>
            <div className="text-xl font-bold font-mono tabular-nums mb-1">
              ${singleCheapestPlan.netCost.toFixed(2)}
            </div>
            <p className={`text-xs leading-relaxed ${
              selectedPlanId === 'single_cheapest' ? 'text-slate-300' : 'text-slate-500'
            }`}>
              {singleCheapestPlan.subtitle}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/20 flex items-center justify-between text-[11px]">
            <span>Fuel: ${singleCheapestPlan.fuelCost.toFixed(2)}</span>
            <span>~{singleCheapestPlan.totalDrivingMinutes} min driving</span>
          </div>
        </div>

        {/* 2-Stop Sweet Spot Plan */}
        <div
          onClick={() => onSelectPlanId('two_stop_optimal')}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
            selectedPlanId === 'two_stop_optimal'
              ? 'bg-emerald-900 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500/30'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
          }`}
        >
          <div className="absolute -top-2.5 right-3 bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase tracking-wide">
            Sweet Spot
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                selectedPlanId === 'two_stop_optimal' ? 'text-emerald-300' : 'text-emerald-700'
              }`}>
                2-Stop Sweet Spot
              </span>
              <span className="text-xs font-mono">
                {twoStopPlan.totalDistanceMiles} mi
              </span>
            </div>
            <div className="text-xl font-bold font-mono tabular-nums mb-1">
              ${twoStopPlan.netCost.toFixed(2)}
            </div>
            <p className={`text-xs leading-relaxed ${
              selectedPlanId === 'two_stop_optimal' ? 'text-emerald-100' : 'text-slate-500'
            }`}>
              {twoStopPlan.subtitle}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-700/50 flex items-center justify-between text-[11px]">
            <span className={selectedPlanId === 'two_stop_optimal' ? 'text-emerald-300 font-semibold' : 'text-emerald-700 font-semibold'}>
              +${(singleCheapestPlan.netCost - twoStopPlan.netCost).toFixed(2)} extra savings
            </span>
            <span>~{twoStopPlan.totalDrivingMinutes} min</span>
          </div>
        </div>

        {/* 3-Stop Max Savings Plan */}
        <div
          onClick={() => onSelectPlanId('three_stop_max_savings')}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
            selectedPlanId === 'three_stop_max_savings'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                selectedPlanId === 'three_stop_max_savings' ? 'text-amber-400' : 'text-amber-700'
              }`}>
                3-Stop Max Savings
              </span>
              <span className="text-xs font-mono">
                {threeStopPlan.totalDistanceMiles} mi
              </span>
            </div>
            <div className="text-xl font-bold font-mono tabular-nums mb-1">
              ${threeStopPlan.netCost.toFixed(2)}
            </div>
            <p className={`text-xs leading-relaxed ${
              selectedPlanId === 'three_stop_max_savings' ? 'text-slate-300' : 'text-slate-500'
            }`}>
              {threeStopPlan.subtitle}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/20 flex items-center justify-between text-[11px]">
            <span>Lowest Grocery Total</span>
            <span>~{threeStopPlan.totalDrivingMinutes} min</span>
          </div>
        </div>

        {/* Custom Stop Planner */}
        <div
          onClick={() => onSelectPlanId('custom')}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
            selectedPlanId === 'custom'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                selectedPlanId === 'custom' ? 'text-indigo-400' : 'text-indigo-700'
              }`}>
                Custom Store Route
              </span>
              <span className="text-xs font-mono">
                {customPlan.totalDistanceMiles} mi
              </span>
            </div>
            <div className="text-xl font-bold font-mono tabular-nums mb-1">
              ${customPlan.netCost.toFixed(2)}
            </div>
            <p className={`text-xs leading-relaxed ${
              selectedPlanId === 'custom' ? 'text-slate-300' : 'text-slate-500'
            }`}>
              Select your own favorite stores to compare & route
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/20 flex items-center justify-between text-[11px]">
            <span>{customStoreSelection.length} stores chosen</span>
            <span>Configure below</span>
          </div>
        </div>
      </div>

      {/* Custom Store Selector (Visible if custom plan active) */}
      {selectedPlanId === 'custom' && (
        <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Choose Stores to Include in Your Custom Route:
            </span>
            <span className="text-xs text-slate-400">
              Items will be routed to the cheapest store in your selection
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['walmart', 'costco', 'aldi', 'kroger', 'frys', 'safeway', 'bashas'] as StoreId[]).map((sid) => {
              const isSelected = customStoreSelection.includes(sid);
              const store = STORES_DATA[sid];
              return (
                <button
                  key={sid}
                  onClick={() => onToggleCustomStore(sid)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: store.primaryColor }}
                  />
                  <span>{store.brand}</span>
                  {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Route Dashboard Grid: Map + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Visual SVG Route Map (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-600" />
                  <span>Interactive Route & Store Waypoints</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Fuel-optimized route starting and ending at your home location
                </p>
              </div>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                title="Vehicle MPG and Fuel Settings"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </div>

            {/* Fuel Settings Drawer */}
            {showSettings && (
              <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-600 font-medium">
                      Gas Price ($/gal):
                    </label>
                    <span className="text-[10px] text-emerald-700 font-semibold font-mono">
                      {routeSettings?.region?.shortLabel || DEFAULT_REGION.shortLabel}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.05"
                    min="0.5"
                    max="25"
                    value={routeSettings.gasPricePerGallon}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const safeVal = isNaN(val) ? 3.45 : Math.max(0.5, Math.min(25, val));
                      onUpdateRouteSettings({
                        ...routeSettings,
                        gasPricePerGallon: safeVal,
                      });
                    }}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Vehicle MPG:
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="5"
                    max="150"
                    value={routeSettings.vehicleMpg}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const safeVal = isNaN(val) ? 25 : Math.max(5, Math.min(150, val));
                      onUpdateRouteSettings({
                        ...routeSettings,
                        vehicleMpg: safeVal,
                      });
                    }}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Interactive SVG Map Canvas */}
            <div className="relative w-full aspect-16/10 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Background road grid */}
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" />
                  </pattern>
                  <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />

                {/* Major thoroughfares / roads */}
                <path d="M 0 50 L 100 50" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="0.8" />
                <path d="M 50 0 L 50 100" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="0.8" />
                <path d="M 0 25 L 100 25" stroke="rgba(255, 255, 255, 0.07)" strokeWidth="0.5" />
                <path d="M 0 75 L 100 75" stroke="rgba(255, 255, 255, 0.07)" strokeWidth="0.5" />
                <path d="M 25 0 L 25 100" stroke="rgba(255, 255, 255, 0.07)" strokeWidth="0.5" />
                <path d="M 75 0 L 75 100" stroke="rgba(255, 255, 255, 0.07)" strokeWidth="0.5" />

                {/* Route Connecting Lines */}
                {activePlan.stops.length > 0 && (() => {
                  const points = [
                    homeCoords,
                    ...activePlan.stops.map((s) => s.store.mapCoords),
                    homeCoords,
                  ];
                  const d = points
                    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                    .join(' ');

                  return (
                    <>
                      {/* Glow path */}
                      <path
                        d={d}
                        fill="none"
                        stroke="rgba(16, 185, 129, 0.25)"
                        strokeWidth="3.5"
                        strokeLinejoin="round"
                      />
                      {/* Animated dashed line */}
                      <path
                        d={d}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="1.6"
                        strokeDasharray="3 2"
                        strokeLinejoin="round"
                        className="animate-pulse"
                      />
                    </>
                  );
                })()}

                {/* All store nodes */}
                {(['walmart', 'costco', 'aldi', 'kroger', 'frys', 'safeway', 'bashas'] as StoreId[]).map((sid) => {
                  const s = STORES_DATA[sid];
                  const activeStop = activePlan.stops.find((st) => st.store.id === sid);
                  const isVisited = !!activeStop;

                  return (
                    <g
                      key={sid}
                      onClick={() => setActivePinDetail(sid)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      {/* Marker Outer Circle */}
                      <circle
                        cx={s.mapCoords.x}
                        cy={s.mapCoords.y}
                        r={isVisited ? 4.5 : 3}
                        fill={isVisited ? s.primaryColor : '#334155'}
                        stroke={isVisited ? '#FFFFFF' : '#1E293B'}
                        strokeWidth={isVisited ? '1' : '0.5'}
                      />
                      {/* Letter Logo */}
                      <text
                        x={s.mapCoords.x}
                        y={s.mapCoords.y + 1.2}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize={isVisited ? '3' : '2.2'}
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        {s.logoLetter}
                      </text>

                      {/* Visited Stop Order Badge */}
                      {isVisited && (
                        <circle
                          cx={s.mapCoords.x + 3.2}
                          cy={s.mapCoords.y - 3.2}
                          r="2.2"
                          fill="#10B981"
                          stroke="#FFFFFF"
                          strokeWidth="0.5"
                        />
                      )}
                      {isVisited && (
                        <text
                          x={s.mapCoords.x + 3.2}
                          y={s.mapCoords.y - 2.2}
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize="1.8"
                          fontWeight="bold"
                        >
                          {activeStop.stopNumber}
                        </text>
                      )}

                      {/* Store Brand Name Label */}
                      <text
                        x={s.mapCoords.x}
                        y={s.mapCoords.y + (isVisited ? 7 : 5.5)}
                        textAnchor="middle"
                        fill={isVisited ? '#FFFFFF' : '#94A3B8'}
                        fontSize="2.4"
                        fontWeight={isVisited ? '600' : '400'}
                      >
                        {s.brand}
                      </text>
                    </g>
                  );
                })}

                {/* Home Node */}
                <g
                  onClick={() => setActivePinDetail('home')}
                  className="cursor-pointer transition-transform hover:scale-110"
                >
                  <circle
                    cx={homeCoords.x}
                    cy={homeCoords.y}
                    r="4.2"
                    fill="#3B82F6"
                    stroke="#FFFFFF"
                    strokeWidth="1.2"
                  />
                  <text
                    x={homeCoords.x}
                    y={homeCoords.y + 1.3}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="3"
                    fontWeight="bold"
                  >
                    H
                  </text>
                  <text
                    x={homeCoords.x}
                    y={homeCoords.y + 6.8}
                    textAnchor="middle"
                    fill="#93C5FD"
                    fontSize="2.4"
                    fontWeight="600"
                  >
                    Home
                  </text>
                </g>
              </svg>
            </div>
          </div>

          {/* Quick Map Legend & Navigation CTA */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 text-slate-500 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                <span>Home Starting Point</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Optimized Waypoint Sequence</span>
              </span>
            </div>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors shrink-0"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Right Column: Route Financial Metrics & Summary (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Route Financial Summary
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {activePlan.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {activePlan.description}
              </p>
            </div>

            {/* Price Calculations Card */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Grocery Items Subtotal:</span>
                <span className="font-semibold text-slate-900 font-mono tabular-nums">
                  ${activePlan.groceryTotal.toFixed(2)}
                </span>
              </div>

              {activePlan.couponTotalSavings > 0 && (
                <div className="flex items-center justify-between text-xs text-amber-700">
                  <span className="flex items-center gap-1">
                    <Scissors className="w-3 h-3" />
                    <span>Exclusive Coupon Discounts:</span>
                  </span>
                  <span className="font-semibold font-mono tabular-nums">
                    -${activePlan.couponTotalSavings.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-slate-400" />
                  <span>Estimated Fuel Cost ({activePlan.totalDistanceMiles} mi @ ${routeSettings.gasPricePerGallon}/gal):</span>
                </span>
                <span className="font-semibold text-slate-900 font-mono tabular-nums">
                  +${activePlan.fuelCost.toFixed(2)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Total Net Cost (With Fuel):</div>
                  <div className="text-[11px] text-slate-400">Everything inclusive</div>
                </div>
                <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
                  ${activePlan.netCost.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Metrics Chips */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <div className="text-slate-500 text-[11px]">Total Driving Distance</div>
                <div className="text-base font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                  {activePlan.totalDistanceMiles} miles
                </div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <div className="text-slate-500 text-[11px]">Est. Drive Time</div>
                <div className="text-base font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                  ~{activePlan.totalDrivingMinutes} mins
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              onClick={onOpenExport}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Export Route & Shopping Checklist</span>
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              Transfers full stop-by-stop list to Apple Notes, SMS, or Sheets
            </p>
          </div>
        </div>
      </div>

      {/* Stop-by-Stop Detailed Checklist */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Stop-by-Stop Shopping Checklist
            </h3>
            <p className="text-xs text-slate-500">
              Check off items as you shop at each specific store
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-mono">
            {activePlan.stops.length} STOPS TOTAL
          </span>
        </div>

        <div className="space-y-4">
          {activePlan.stops.map((stop) => (
            <div
              key={stop.store.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
            >
              {/* Stop Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs"
                    style={{ backgroundColor: stop.store.primaryColor }}
                  >
                    #{stop.stopNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {stop.store.name}
                      </h4>
                      <span className="text-xs text-slate-400">
                        · {stop.items.length} items to pick up
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{stop.store.address}, {stop.store.city}</span>
                      <span>·</span>
                      <span>{stop.legDistanceMiles} mi leg (~{stop.legDrivingMinutes} min)</span>
                      <span>·</span>
                      <span>Hours: {stop.store.storeHours}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Stop Subtotal</div>
                    <div className="text-base font-bold text-slate-900 font-mono tabular-nums">
                      ${stop.finalTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List Inside This Stop */}
              <div className="divide-y divide-slate-100">
                {stop.items.map((itemObj) => {
                  const u = itemObj.userItem;
                  const coupon = itemObj.couponApplied;

                  return (
                    <div
                      key={u.id}
                      className={`p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors ${
                        u.checked ? 'bg-slate-50/30 opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => onToggleItemCheck(u.id)}
                          className="text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                        >
                          {u.checked ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold text-slate-900 ${
                              u.checked ? 'line-through text-slate-400' : ''
                            }`}>
                              {u.quantity} {u.unit} {u.name}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>Located: {itemObj.aisle}</span>
                            {itemObj.savingsVsAverage > 0 && (
                              <span className="text-emerald-700 font-medium">
                                · Saves ${itemObj.savingsVsAverage.toFixed(2)} vs local avg
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {coupon && (
                          <div className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1">
                            <Scissors className="w-2.5 h-2.5" />
                            <span>-${coupon.discountValue.toFixed(2)} clipped</span>
                          </div>
                        )}
                        <span className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                          ${itemObj.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
