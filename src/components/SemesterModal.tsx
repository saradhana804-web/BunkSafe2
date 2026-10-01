import React, { useState } from 'react';
import { Semester } from '../types/attendance';
import { X, Plus, Check, Trash2, Edit2, Calendar } from 'lucide-react';

interface SemesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  semesters: Semester[];
  activeSemesterId: string;
  onSelectSemester: (semesterId: string) => void;
  onCreateSemester: (name: string, targetPercentage: number) => void;
  onUpdateSemester: (semester: Semester) => void;
  onDeleteSemester: (semesterId: string) => void;
}

export const SemesterModal: React.FC<SemesterModalProps> = ({
  isOpen,
  onClose,
  semesters,
  activeSemesterId,
  onSelectSemester,
  onCreateSemester,
  onUpdateSemester,
  onDeleteSemester,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newSemName, setNewSemName] = useState('');
  const [newSemTarget, setNewSemTarget] = useState(75);

  const [editingSemId, setEditingSemId] = useState<string | null>(null);
  const [editSemName, setEditSemName] = useState('');
  const [editSemTarget, setEditSemTarget] = useState(75);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSemName.trim()) return;

    onCreateSemester(newSemName.trim(), newSemTarget || 75);
    setNewSemName('');
    setNewSemTarget(75);
    setIsCreating(false);
  };

  const startEdit = (sem: Semester) => {
    setEditingSemId(sem.id);
    setEditSemName(sem.name);
    setEditSemTarget(sem.targetPercentage);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSemId) return;
    const existing = semesters.find(s => s.id === editingSemId);
    if (!existing) return;

    onUpdateSemester({
      ...existing,
      name: editSemName.trim() || existing.name,
      targetPercentage: editSemTarget || 75,
    });
    setEditingSemId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Manage Semesters</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Semesters */}
        <div className="space-y-2.5">
          {semesters.map(sem => {
            const isActive = sem.id === activeSemesterId;
            const isEditingThis = editingSemId === sem.id;

            if (isEditingThis) {
              return (
                <form
                  key={sem.id}
                  onSubmit={handleSaveEdit}
                  className="p-3 bg-slate-950 rounded-2xl border border-emerald-500/50 space-y-2.5"
                >
                  <input
                    type="text"
                    value={editSemName}
                    onChange={e => setEditSemName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Semester name"
                    required
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Target %:</span>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={editSemTarget}
                      onChange={e => setEditSemTarget(parseInt(e.target.value) || 75)}
                      className="w-20 px-2 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono text-center"
                    />
                    <div className="flex-1 flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingSemId(null)}
                        className="px-2.5 py-1 text-xs text-slate-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              );
            }

            return (
              <div
                key={sem.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-slate-800/90 border-emerald-500/60 shadow-md shadow-emerald-950/20'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div
                  className="flex-1 cursor-pointer min-w-0"
                  onClick={() => {
                    onSelectSemester(sem.id);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white truncate">
                      {sem.name}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Active
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                    Target Requirement: {sem.targetPercentage}%
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(sem)}
                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
                    title="Edit Semester"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {semesters.length > 1 && (
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Delete semester "${sem.name}" and all its subjects/records?`
                          )
                        ) {
                          onDeleteSemester(sem.id);
                        }
                      }}
                      className="w-8 h-8 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 flex items-center justify-center transition-colors"
                      title="Delete Semester"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Semester Form or Trigger */}
        {isCreating ? (
          <form
            onSubmit={handleCreate}
            className="p-4 bg-slate-950 rounded-2xl border border-slate-700 space-y-3"
          >
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Add New Semester
            </h3>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Semester Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Semester 6 (Spring 2027)"
                value={newSemName}
                onChange={e => setNewSemName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Required Attendance Target (%)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={newSemTarget}
                onChange={e => setNewSemTarget(parseInt(e.target.value) || 75)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md active:scale-95"
              >
                Create
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full py-2.5 rounded-2xl bg-slate-950 border border-dashed border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
            <span>Create New Semester</span>
          </button>
        )}
      </div>
    </div>
  );
};
