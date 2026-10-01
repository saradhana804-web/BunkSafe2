import React, { useState } from 'react';
import { Subject, TimetableSlot, DayOfWeek } from '../types/attendance';
import { 
  CalendarClock, 
  Plus, 
  Trash2, 
  Clock, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';

interface TimetableViewProps {
  subjects: Subject[];
  timetable: TimetableSlot[];
  semesterId: string;
  onAddSlot: (slot: Omit<TimetableSlot, 'id'>) => void;
  onDeleteSlot: (slotId: string) => void;
  onOpenAddSubject: () => void;
}

export const TimetableView: React.FC<TimetableViewProps> = ({
  subjects,
  timetable,
  semesterId,
  onAddSlot,
  onDeleteSlot,
  onOpenAddSubject,
}) => {
  const days: { key: DayOfWeek; label: string; short: string }[] = [
    { key: 'mon', label: 'Monday', short: 'Mon' },
    { key: 'tue', label: 'Tuesday', short: 'Tue' },
    { key: 'wed', label: 'Wednesday', short: 'Wed' },
    { key: 'thu', label: 'Thursday', short: 'Thu' },
    { key: 'fri', label: 'Friday', short: 'Fri' },
    { key: 'sat', label: 'Saturday', short: 'Sat' },
    { key: 'sun', label: 'Sunday', short: 'Sun' },
  ];

  // Default to today's day of week
  const todayIdx = new Date().getDay();
  const dayKeyOrder: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const [activeDay, setActiveDay] = useState<DayOfWeek>(dayKeyOrder[todayIdx] || 'mon');

  // Modal for adding a slot
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [room, setRoom] = useState('');

  // Slots for the active day, sorted by start time
  const daySlots = timetable
    .filter(slot => slot.day === activeDay && slot.semesterId === semesterId)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;

    onAddSlot({
      semesterId,
      day: activeDay,
      subjectId: selectedSubjectId,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      room: room.trim() || undefined,
    });

    setIsAddModalOpen(false);
    setRoom('');
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Day Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {days.map(d => {
          const isSelected = activeDay === d.key;
          const count = timetable.filter(
            t => t.day === d.key && t.semesterId === semesterId
          ).length;

          return (
            <button
              key={d.key}
              onClick={() => setActiveDay(d.key)}
              className={`flex-1 min-w-[50px] py-2 px-1 rounded-xl text-center transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-900/40 ring-1 ring-emerald-400/40'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span className="block text-xs">{d.short}</span>
              <span
                className={`block text-[10px] font-mono mt-0.5 ${
                  isSelected ? 'text-emerald-100' : 'text-slate-500'
                }`}
              >
                {count > 0 ? `${count}` : '—'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Day Schedule Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">
            {days.find(d => d.key === activeDay)?.label} Schedule
          </h2>
          <p className="text-xs text-slate-400">
            {daySlots.length === 1
              ? '1 class scheduled'
              : `${daySlots.length} classes scheduled`}
          </p>
        </div>

        <button
          onClick={() => {
            if (subjects.length === 0) {
              onOpenAddSubject();
            } else {
              setSelectedSubjectId(subjects[0].id);
              setIsAddModalOpen(true);
            }
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-900/30 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Period</span>
        </button>
      </div>

      {/* Day Slots List */}
      {daySlots.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 space-y-3">
          <CalendarClock className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-xs text-slate-400">
            No classes scheduled for {days.find(d => d.key === activeDay)?.label}.
          </p>
          <button
            onClick={() => {
              if (subjects.length === 0) {
                onOpenAddSubject();
              } else {
                setSelectedSubjectId(subjects[0].id);
                setIsAddModalOpen(true);
              }
            }}
            className="text-xs text-emerald-400 hover:underline font-semibold"
          >
            + Add a class to this day
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {daySlots.map((slot, idx) => {
            const subject = subjects.find(s => s.id === slot.subjectId);
            if (!subject) return null;

            return (
              <div
                key={slot.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-1.5 self-stretch rounded-full shrink-0"
                    style={{ backgroundColor: subject.color }}
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100 truncate">
                        {subject.name}
                      </span>
                      {subject.code && (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded">
                          {subject.code}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      {(slot.startTime || slot.endTime) && (
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>
                            {slot.startTime || '—'} {slot.endTime ? `to ${slot.endTime}` : ''}
                          </span>
                        </span>
                      )}
                      {slot.room && (
                        <span className="flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{slot.room}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete Slot Button */}
                <button
                  onClick={() => onDeleteSlot(slot.id)}
                  className="w-8 h-8 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 flex items-center justify-center transition-colors shrink-0"
                  title="Remove from timetable"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Slot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                Add Class to {days.find(d => d.key === activeDay)?.label}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-3.5">
              {/* Select Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subject *
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={e => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.code ? `(${s.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Slots */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Room / Location */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Room / Classroom / Lab (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Room 302, Lab 4, Hall A"
                  value={room}
                  onChange={e => setRoom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
                >
                  Add to Timetable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
