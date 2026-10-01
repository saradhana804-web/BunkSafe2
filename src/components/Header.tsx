import React from 'react';
import { Semester } from '../types/attendance';
import { ShieldCheck, Plus, Settings, ChevronDown } from 'lucide-react';

interface HeaderProps {
  semesters: Semester[];
  activeSemester: Semester | null;
  onSelectSemester: (semesterId: string) => void;
  onOpenSemesterModal: () => void;
  onOpenAddSubject: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  semesters,
  activeSemester,
  onSelectSemester,
  onOpenSemesterModal,
  onOpenAddSubject,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">BunkSafe</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                75% Target
              </span>
            </div>
          </div>
        </div>

        {/* Center / Semester Picker */}
        <div className="flex items-center gap-2">
          {semesters.length > 0 && activeSemester && (
            <div className="relative">
              <button
                onClick={onOpenSemesterModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 hover:text-white hover:border-slate-700 transition-colors max-w-[160px] sm:max-w-[200px]"
                title="Switch Semester"
              >
                <span className="truncate">{activeSemester.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            </div>
          )}

          {/* Quick Add Subject */}
          <button
            onClick={onOpenAddSubject}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/30 transition-all active:scale-95 shrink-0"
            title="Add Subject"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Subject</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors shrink-0"
            title="Settings & Backup"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
