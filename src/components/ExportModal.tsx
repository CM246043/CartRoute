import { useState } from 'react';
import { X, Copy, Check, Download, ExternalLink, Printer, FileText, FileSpreadsheet } from 'lucide-react';
import { UserShoppingItem, RouteStrategyPlan } from '../types/grocery';
import {
  formatListAsText,
  formatListAsCSV,
  triggerFileDownload,
  generateGoogleMapsRouteUrl,
} from '../utils/exportImport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: UserShoppingItem[];
  activePlan?: RouteStrategyPlan;
}

export function ExportModal({ isOpen, onClose, items, activePlan }: ExportModalProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [exportMode, setExportMode] = useState<'route' | 'categories'>('route');

  if (!isOpen) return null;

  const currentPlan = exportMode === 'route' ? activePlan : undefined;
  const formattedText = formatListAsText(items, currentPlan);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(formattedText);
      setCopiedFormat('text');
      setTimeout(() => setCopiedFormat(null), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadCSV = () => {
    const csvContent = formatListAsCSV(items);
    triggerFileDownload(csvContent, `CartRoute_Shopping_List_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
    setCopiedFormat('csv');
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handleDownloadJSON = () => {
    const backupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      items,
      itemCount: items.length,
    };
    triggerFileDownload(
      JSON.stringify(backupData, null, 2),
      `CartRoute_Backup_${new Date().toISOString().slice(0, 10)}.json`,
      'application/json'
    );
    setCopiedFormat('json');
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const mapsUrl = activePlan ? generateGoogleMapsRouteUrl(activePlan) : '#';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Export Shopping List</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Transfer your list to notes, spreadsheets, or open turn-by-turn driving routes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Format Selector */}
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Format Style</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setExportMode('route')}
                className={`px-3 py-1 rounded transition-colors ${
                  exportMode === 'route' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Organized by Store Stops
              </button>
              <button
                onClick={() => setExportMode('categories')}
                className={`px-3 py-1 rounded transition-colors ${
                  exportMode === 'categories' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                By Grocery Department
              </button>
            </div>
          </div>

          {/* Quick Action Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={handleCopyText}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-center group"
            >
              {copiedFormat === 'text' ? (
                <Check className="w-5 h-5 text-emerald-600 mb-1.5" />
              ) : (
                <Copy className="w-5 h-5 text-slate-600 group-hover:text-slate-900 mb-1.5" />
              )}
              <span className="text-xs font-semibold text-slate-800">
                {copiedFormat === 'text' ? 'Copied!' : 'Copy to Clipboard'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">For Notes & SMS</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-center group"
            >
              {copiedFormat === 'csv' ? (
                <Check className="w-5 h-5 text-emerald-600 mb-1.5" />
              ) : (
                <FileSpreadsheet className="w-5 h-5 text-slate-600 group-hover:text-slate-900 mb-1.5" />
              )}
              <span className="text-xs font-semibold text-slate-800">
                {copiedFormat === 'csv' ? 'Downloaded' : 'Download CSV'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">Excel & Sheets</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-center group"
            >
              {copiedFormat === 'json' ? (
                <Check className="w-5 h-5 text-emerald-600 mb-1.5" />
              ) : (
                <Download className="w-5 h-5 text-slate-600 group-hover:text-slate-900 mb-1.5" />
              )}
              <span className="text-xs font-semibold text-slate-800">
                {copiedFormat === 'json' ? 'Saved' : 'Backup JSON'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">Save & Re-import</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-center group"
            >
              <Printer className="w-5 h-5 text-slate-600 group-hover:text-slate-900 mb-1.5" />
              <span className="text-xs font-semibold text-slate-800">Print List</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Physical Paper</span>
            </button>
          </div>

          {/* Navigation Route Link */}
          {activePlan && activePlan.stops.length > 0 && (
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-lg flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-emerald-950 flex items-center gap-1.5">
                  <span>Google Maps Navigation Route</span>
                  <span className="text-[10px] bg-emerald-200/70 text-emerald-800 px-1.5 py-0.2 rounded font-mono">
                    {activePlan.stops.length} STOPS
                  </span>
                </div>
                <p className="text-xs text-emerald-700">
                  Open waypoint directions in Google Maps from Home through {activePlan.stops.map((s) => s.store.brand).join(' → ')}.
                </p>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md shadow-xs transition-colors whitespace-nowrap shrink-0"
              >
                <span>Open Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Formatted Text Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">List Preview</span>
              <span className="text-xs text-slate-400 font-mono tabular-nums">{items.length} items</span>
            </div>
            <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap select-all border border-slate-800">
              {formattedText}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Tip: Save JSON to restore your exact list on any device without retyping.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
