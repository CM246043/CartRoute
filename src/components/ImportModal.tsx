import { useState, useRef } from 'react';
import { X, Upload, Plus, FileText, Check, AlertCircle } from 'lucide-react';
import { UserShoppingItem } from '../types/grocery';
import { parsePastedShoppingText } from '../utils/exportImport';
import { STARTER_LIST_PRESETS } from '../data/starterLists';
import { validateAndSanitizeItem, SECURITY_LIMITS } from '../utils/security';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportItems: (newItems: UserShoppingItem[], replaceExisting: boolean) => void;
}

export function ImportModal({ isOpen, onClose, onImportItems }: ImportModalProps) {
  const [activeMode, setActiveMode] = useState<'paste' | 'preset' | 'file'>('paste');
  const [pasteText, setPasteText] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [previewItems, setPreviewItems] = useState<UserShoppingItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleTextChange = (text: string) => {
    setPasteText(text);
    if (!text.trim()) {
      setPreviewItems([]);
      setErrorMessage(null);
      return;
    }
    const parsed = parsePastedShoppingText(text);
    setPreviewItems(parsed);
    setErrorMessage(null);
  };

  const handleApplyImport = () => {
    if (previewItems.length === 0) {
      setErrorMessage('Please enter at least one item.');
      return;
    }
    onImportItems(previewItems, replaceExisting);
    onClose();
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = STARTER_LIST_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const itemsWithIds: UserShoppingItem[] = preset.items.map((it, idx) => ({
      ...it,
      id: `preset_${Date.now()}_${idx}`,
    }));

    onImportItems(itemsWithIds, replaceExisting);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Hardened file size guard (Max 256 KB)
    if (file.size > SECURITY_LIMITS.MAX_FILE_UPLOAD_BYTES) {
      setErrorMessage(`File is too large (${(file.size / 1024).toFixed(0)} KB). Maximum allowed size is 256 KB.`);
      if (e.target) e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawContent = (event.target?.result as string) || '';
        if (file.name.endsWith('.json')) {
          const json = JSON.parse(rawContent);
          const candidateArray: unknown[] = Array.isArray(json)
            ? json
            : Array.isArray(json?.items)
            ? json.items
            : [];

          if (candidateArray.length === 0) {
            setErrorMessage('No valid items found in this JSON file.');
            return;
          }

          // Strict schema validation, sanitization & bounds cap
          const sanitizedList: UserShoppingItem[] = [];
          for (const rawItem of candidateArray.slice(0, SECURITY_LIMITS.MAX_LIST_ITEMS)) {
            const sanitized = validateAndSanitizeItem(rawItem, 'imported');
            if (sanitized) sanitizedList.push(sanitized);
          }

          if (sanitizedList.length === 0) {
            setErrorMessage('File contained invalid or malformed item structures.');
            return;
          }

          onImportItems(sanitizedList, replaceExisting);
          onClose();
        } else {
          // Parse as plain text or CSV with length bounding
          const parsed = parsePastedShoppingText(rawContent);
          if (parsed.length === 0) {
            setErrorMessage('Could not recognize items from this file.');
            return;
          }
          onImportItems(parsed, replaceExisting);
          onClose();
        }
      } catch (err) {
        setErrorMessage('Failed to parse file. Ensure it is valid, uncorrupted JSON or plain text.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Transfer & Import Shopping List</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste items in plain English, load an exported backup, or pick a starter basket
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveMode('paste')}
              className={`flex-1 py-1.5 rounded transition-colors text-center ${
                activeMode === 'paste' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paste Text / Notes
            </button>
            <button
              onClick={() => setActiveMode('preset')}
              className={`flex-1 py-1.5 rounded transition-colors text-center ${
                activeMode === 'preset' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Curated Starter Lists
            </button>
            <button
              onClick={() => setActiveMode('file')}
              className={`flex-1 py-1.5 rounded transition-colors text-center ${
                activeMode === 'file' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upload Backup File
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeMode === 'paste' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Paste grocery items (any format):
                </label>
                <textarea
                  value={pasteText}
                  maxLength={SECURITY_LIMITS.MAX_TEXT_INPUT_CHARS}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={`Example:\n2 gallons whole milk\n1 dozen eggs\n3 lbs boneless chicken breast\nbananas\nsourdough bread\nrolled oats`}
                  rows={6}
                  className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 placeholder:text-slate-400"
                />
              </div>

              {previewItems.length > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                    <span>Parsed {previewItems.length} items from text:</span>
                    <span className="text-emerald-700 font-semibold">Ready to import</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {previewItems.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium"
                      >
                        {item.quantity} {item.unit} {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeMode === 'preset' && (
            <div className="space-y-2.5">
              <span className="text-xs text-slate-500">
                Pick a pre-configured shopping basket to evaluate local store prices immediately:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {STARTER_LIST_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className="p-3.5 text-left border border-slate-200 hover:border-slate-400 hover:bg-slate-50 rounded-lg transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                          {preset.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Plus className="w-3 h-3" />
                      <span>Load {preset.itemCount} items</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeMode === 'file' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50"
              >
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-700">
                  Click to select CartRoute JSON or text file
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Supports .json backups and .txt or .csv files
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Merge option */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={replaceExisting}
                onChange={(e) => setReplaceExisting(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span>Replace current shopping list (uncheck to merge instead)</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          {activeMode === 'paste' && (
            <button
              onClick={handleApplyImport}
              disabled={previewItems.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Add {previewItems.length > 0 ? `${previewItems.length} Items` : 'to List'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
