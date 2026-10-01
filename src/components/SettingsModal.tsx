import React, { useRef } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  ShieldCheck, 
  HelpCircle,
  HardDrive
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportData: () => void;
  onImportData: (jsonString: string) => boolean;
  onResetToDemo: () => void;
  onClearAll: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onExportData,
  onImportData,
  onResetToDemo,
  onClearAll,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const success = onImportData(content);
        if (success) {
          alert('Data imported successfully!');
          onClose();
        } else {
          alert('Failed to parse backup file. Please ensure it is a valid BunkSafe export.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Data & Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Local Storage Status */}
        <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Local Device Storage Active</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All your attendance, subjects, and timetable data are securely preserved on your device.
            No accounts, sign-ins, or external tracking required.
          </p>
        </div>

        {/* Backup & Restore */}
        <div className="space-y-2 pt-1">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Backup & Transfer
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onExportData}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Backup (JSON)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors"
            >
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Import Backup</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* How attendance math works */}
        <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Attendance Formula Guide</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            Attendance % = (Classes Attended ÷ Classes Held) × 100
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            • <strong>Safe classes to miss:</strong> Maximum classes you can miss while keeping (Attended ÷ (Held + Miss)) ≥ 75%.<br />
            • <strong>Classes needed:</strong> Minimum consecutive classes to attend to pull (Attended + A) ÷ (Held + A) ≥ 75%.
          </p>
        </div>

        {/* Reset / Clear Data */}
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Reset Options
          </h3>

          <div className="space-y-2">
            <button
              onClick={() => {
                if (
                  confirm(
                    'Load sample college subjects (Mathematics, Physics, Electrical Eng, etc.)? Your current data will be replaced.'
                  )
                ) {
                  onResetToDemo();
                  onClose();
                }
              }}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Load Sample College Data</span>
              </div>
              <span className="text-[10px] text-slate-500">Restore demo</span>
            </button>

            <button
              onClick={() => {
                if (
                  confirm(
                    'Are you sure you want to erase all data and start completely fresh? This cannot be undone unless you have a backup.'
                  )
                ) {
                  onClearAll();
                  onClose();
                }
              }}
              className="w-full p-2.5 rounded-xl bg-rose-950/20 border border-rose-900/40 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 text-xs font-medium flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Clear All Data</span>
              </div>
              <span className="text-[10px] text-rose-400/80">Erase</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
