import React, { useState } from 'react';
import { Subject } from '../types/attendance';
import { X, Sparkles } from 'lucide-react';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  semesterId: string;
  onAddSubject: (subject: Omit<Subject, 'id'>) => void;
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#f97316', // orange
  '#64748b', // slate
];

const PRESET_SUBJECTS = [
  { name: 'Mathematics', code: 'MATH-301' },
  { name: 'Physics', code: 'PHY-202' },
  { name: 'Electrical Engineering', code: 'EE-210' },
  { name: 'Engineering Drawing', code: 'ED-104' },
  { name: 'Data Structures', code: 'CS-201' },
  { name: 'Computer Networks', code: 'CS-304' },
  { name: 'Engineering Mechanics', code: 'ME-102' },
  { name: 'Chemistry', code: 'CH-101' },
];

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  semesterId,
  onAddSubject,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [classesHeld, setClassesHeld] = useState<number>(0);
  const [classesAttended, setClassesAttended] = useState<number>(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const held = Math.max(0, classesHeld);
    const attended = Math.min(held, Math.max(0, classesAttended));

    onAddSubject({
      semesterId,
      name: name.trim(),
      code: code.trim() || undefined,
      color,
      classesHeld: held,
      classesAttended: attended,
    });

    onClose();
    setName('');
    setCode('');
    setClassesHeld(0);
    setClassesAttended(0);
  };

  const handleSelectPreset = (preset: { name: string; code: string }) => {
    setName(preset.name);
    setCode(preset.code);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white">Add New Subject</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Pick Recommended Subjects */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Quick Pick Suggestions:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_SUBJECTS.map(preset => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                  name === preset.name
                    ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Subject Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Subject Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Mathematics, Physics, Electrical Engineering"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Subject Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Subject Code (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. MATH-301, PHY-202"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Subject Color Tag
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Initial Attendance Numbers */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Classes Held So Far
              </label>
              <input
                type="number"
                min="0"
                value={classesHeld}
                onChange={e => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  setClassesHeld(val);
                  if (classesAttended > val) setClassesAttended(val);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Classes Attended
              </label>
              <input
                type="number"
                min="0"
                max={classesHeld}
                value={classesAttended}
                onChange={e => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  setClassesAttended(Math.min(classesHeld, val));
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Note: You can leave both at 0 if the semester just started.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/40 active:scale-95 transition-all"
            >
              Create Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
