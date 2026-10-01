import React, { useState } from 'react';
import { Subject } from '../types/attendance';
import { calculatePercentage } from '../utils/calculations';
import { X, Plus, Minus, Trash2 } from 'lucide-react';

interface EditSubjectModalProps {
  subject: Subject | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
}

const PRESET_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#ec4899',
  '#f97316',
  '#64748b',
];

export const EditSubjectModal: React.FC<EditSubjectModalProps> = ({
  subject,
  isOpen,
  onClose,
  onUpdateSubject,
  onDeleteSubject,
}) => {
  if (!isOpen || !subject) return null;

  const [name, setName] = useState(subject.name);
  const [code, setCode] = useState(subject.code || '');
  const [color, setColor] = useState(subject.color || PRESET_COLORS[0]);
  const [classesHeld, setClassesHeld] = useState<number>(subject.classesHeld);
  const [classesAttended, setClassesAttended] = useState<number>(subject.classesAttended);

  const currentPct = calculatePercentage(classesAttended, classesHeld);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const held = Math.max(0, classesHeld);
    const attended = Math.min(held, Math.max(0, classesAttended));

    onUpdateSubject({
      ...subject,
      name: name.trim() || subject.name,
      code: code.trim() || undefined,
      color,
      classesHeld: held,
      classesAttended: attended,
      updatedAt: Date.now(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white">Edit Subject & Attendance</h2>
            <p className="text-xs text-slate-400">Correct mistaken numbers or update info</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Subject Details */}
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Subject Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Subject Code
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Color Tag
              </label>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === c ? 'scale-110 ring-2 ring-white' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Direct Attendance Number Adjuster */}
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300">Attendance Counts</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                Calculated: {currentPct}%
              </span>
            </div>

            {/* Classes Attended Stepper */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Classes Attended</span>
                <span className="text-emerald-400 font-bold">{classesAttended}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setClassesAttended(Math.max(0, classesAttended - 1))}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="0"
                  max={classesHeld}
                  value={classesAttended}
                  onChange={e => {
                    const val = Math.max(0, parseInt(e.target.value) || 0);
                    setClassesAttended(Math.min(classesHeld, val));
                  }}
                  className="flex-1 h-9 rounded-xl bg-slate-900 border border-slate-700 text-center font-mono font-bold text-white text-sm focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = classesAttended + 1;
                    setClassesAttended(next);
                    if (next > classesHeld) setClassesHeld(next);
                  }}
                  className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Classes Held Stepper */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Total Classes Held</span>
                <span className="text-slate-300 font-bold">{classesHeld}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.max(0, classesHeld - 1);
                    setClassesHeld(next);
                    if (classesAttended > next) setClassesAttended(next);
                  }}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="0"
                  value={classesHeld}
                  onChange={e => {
                    const val = Math.max(0, parseInt(e.target.value) || 0);
                    setClassesHeld(val);
                    if (classesAttended > val) setClassesAttended(val);
                  }}
                  className="flex-1 h-9 rounded-xl bg-slate-900 border border-slate-700 text-center font-mono font-bold text-white text-sm focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setClassesHeld(classesHeld + 1)}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${subject.name}?`)) {
                  onDeleteSubject(subject.id);
                  onClose();
                }
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
