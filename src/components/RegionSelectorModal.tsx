import { useState } from 'react';
import { X, MapPin, Check, Info, Fuel, TrendingUp, Sparkles, Navigation } from 'lucide-react';
import { RegionProfile, REGIONS_DATA, DEFAULT_REGION } from '../data/regions';

interface RegionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRegion: RegionProfile;
  onSelectRegion: (region: RegionProfile) => void;
}

export function RegionSelectorModal({
  isOpen,
  onClose,
  currentRegion,
  onSelectRegion,
}: RegionSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Select Your Regional Grocery Market
              </h3>
              <p className="text-xs text-slate-500">
                Local prices reflect regional transport freight, agricultural sourcing, and fuel costs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Callout */}
        <div className="p-4 mx-6 mt-4 bg-amber-50/80 border border-amber-200/80 rounded-lg flex items-start gap-3 text-xs">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-amber-900">
            <span className="font-semibold">Why grocery prices vary by state:</span>
            <p className="text-amber-800 leading-relaxed">
              A pound of bananas or a gallon of milk costs substantially more in California or New York than in Illinois or Texas due to state fuel taxes, refrigerated interstate freight logistics, retail real estate overhead, and regional agricultural supply chains.
            </p>
          </div>
        </div>

        {/* Region Cards Grid */}
        <div className="p-6 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {REGIONS_DATA.map((region) => {
              const isSelected = region.id === (currentRegion?.id || DEFAULT_REGION.id);
              const percentDiff = Math.round((region.overallMultiplier - 1.0) * 100);

              return (
                <div
                  key={region.id}
                  onClick={() => {
                    onSelectRegion(region);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-400/30 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 text-emerald-700 flex items-center gap-1 text-[11px] font-semibold">
                      <Check className="w-4 h-4" />
                      <span>Active</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {region.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                      <span className="flex items-center gap-1 text-slate-700 font-semibold">
                        <Fuel className="w-3 h-3 text-slate-400" />
                        <span>${region.gasPricePerGallon.toFixed(2)}/gal</span>
                      </span>
                      <span>·</span>
                      <span className={percentDiff > 0 ? 'text-amber-700 font-semibold' : percentDiff < 0 ? 'text-emerald-700 font-semibold' : 'text-slate-600'}>
                        {percentDiff > 0 ? `+${percentDiff}% index` : percentDiff < 0 ? `${percentDiff}% index` : 'Baseline benchmark'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed pt-1">
                      {region.regionalNotes}
                    </p>
                  </div>

                  {/* Regional Banner notes */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 space-y-0.5">
                    <div className="truncate">
                      <strong className="text-slate-600">Fry's Banner:</strong> {region.bannerNotes.frys}
                    </div>
                    <div className="truncate">
                      <strong className="text-slate-600">Bashas' Tier:</strong> {region.bannerNotes.bashas}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Selected market: <strong className="text-slate-800">{currentRegion.name}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
