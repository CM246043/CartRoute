import React from 'react';
import { WifiOff, CheckCircle } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900/95 text-white border border-slate-700/80 px-4 py-2.5 text-xs shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <div className="flex flex-col">
        <span className="font-semibold text-white">Offline In-Store Mode</span>
        <span className="text-[11px] text-slate-300 flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-emerald-400 inline" />
          Full access: Local pricing, coupons & route checklists saved on device.
        </span>
      </div>
    </div>
  );
};
