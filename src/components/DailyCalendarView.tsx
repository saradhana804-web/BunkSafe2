import React, { useState } from 'react';
import { Subject, AttendanceRecord, AttendanceStatus, TimetableSlot, DayOfWeek } from '../types/attendance';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  MinusCircle, 
  Sparkles,
  Clock
} from 'lucide-react';

interface DailyCalendarViewProps {
  subjects: Subject[];
  attendanceLogs: AttendanceRecord[];
  timetable: TimetableSlot[];
  semesterId: string;
  onSetDailyAttendance: (subjectId: string, date: string, status: AttendanceStatus | null) => void;
  onMarkAllPresentForDate: (subjectIds: string[], date: string) => void;
}

export const DailyCalendarView: React.FC<DailyCalendarViewProps> = ({
  subjects,
  attendanceLogs,
  timetable,
  semesterId,
  onSetDailyAttendance,
  onMarkAllPresentForDate,
}) => {
  // Format YYYY-MM-DD
  const formatDateISO = (d: Date) => d.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateISO(new Date()));

  // Navigate date
  const handleShiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(formatDateISO(d));
  };

  const setQuickDate = (type: 'today' | 'yesterday') => {
    const d = new Date();
    if (type === 'yesterday') {
      d.setDate(d.getDate() - 1);
    }
    setSelectedDate(formatDateISO(d));
  };

  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const dayIndex = selectedDateObj.getDay();
  const daysOfWeekMap: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const currentDayOfWeek = daysOfWeekMap[dayIndex];

  const fullDayFormatted = selectedDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Scheduled subjects for this day of week
  const scheduledSlots = timetable.filter(
    slot => slot.day === currentDayOfWeek && slot.semesterId === semesterId
  );
  const scheduledSubjectIds = Array.from(new Set(scheduledSlots.map(s => s.subjectId)));

  // Map of subjectId -> attendance record for selected date
  const recordsForDate = attendanceLogs.filter(
    log => log.date === selectedDate && log.semesterId === semesterId
  );
  const recordMap = new Map<string, AttendanceStatus>();
  recordsForDate.forEach(r => recordMap.set(r.subjectId, r.status));

  // Summary counts for this date
  let presentCount = 0;
  let absentCount = 0;
  let cancelledCount = 0;

  recordMap.forEach(st => {
    if (st === 'present') presentCount++;
    if (st === 'absent') absentCount++;
    if (st === 'cancelled') cancelledCount++;
  });

  return (
    <div className="space-y-4 pb-8">
      {/* Date Header & Navigation */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => handleShiftDate(-1)}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-base font-bold text-white flex items-center justify-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-emerald-400" />
              <span>{fullDayFormatted}</span>
            </h2>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <button
                onClick={() => setQuickDate('today')}
                className={`text-[11px] font-medium px-2 py-0.5 rounded transition-colors ${
                  selectedDate === formatDateISO(new Date())
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Today
              </button>
              <span className="text-slate-600 text-xs">·</span>
              <button
                onClick={() => setQuickDate('yesterday')}
                className="text-[11px] text-slate-400 hover:text-slate-200"
              >
                Yesterday
              </button>
              <span className="text-slate-600 text-xs">·</span>
              {/* Native Date Picker Input */}
              <input
                type="date"
                value={selectedDate}
                onChange={e => e.target.value && setSelectedDate(e.target.value)}
                className="bg-transparent text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={() => handleShiftDate(1)}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Stats Pill Strip */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center text-xs">
          <div className="bg-slate-950/60 rounded-xl py-1.5 px-2">
            <span className="text-slate-400 block text-[10px]">Present</span>
            <span className="font-mono font-bold text-emerald-400">{presentCount}</span>
          </div>
          <div className="bg-slate-950/60 rounded-xl py-1.5 px-2">
            <span className="text-slate-400 block text-[10px]">Absent</span>
            <span className="font-mono font-bold text-rose-400">{absentCount}</span>
          </div>
          <div className="bg-slate-950/60 rounded-xl py-1.5 px-2">
            <span className="text-slate-400 block text-[10px]">No Class</span>
            <span className="font-mono font-bold text-slate-400">{cancelledCount}</span>
          </div>
        </div>
      </div>

      {/* Quick Action: Mark all scheduled as Present */}
      {subjects.length > 0 && (
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-xs text-slate-400">
            {scheduledSubjectIds.length > 0
              ? `${scheduledSubjectIds.length} subjects in timetable for this day`
              : 'Mark attendance for any subject:'}
          </span>
          <button
            onClick={() => {
              const targetIds = scheduledSubjectIds.length > 0
                ? scheduledSubjectIds
                : subjects.map(s => s.id);
              onMarkAllPresentForDate(targetIds, selectedDate);
            }}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-950/40 hover:bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/50 transition-colors"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Mark All Present</span>
          </button>
        </div>
      )}

      {/* Subjects list for the date */}
      {subjects.length === 0 ? (
        <div className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
          No subjects created yet. Add subjects to start logging daily attendance.
        </div>
      ) : (
        <div className="space-y-3">
          {subjects.map(subject => {
            const currentStatus = recordMap.get(subject.id);
            const isScheduled = scheduledSubjectIds.includes(subject.id);
            const slotDetails = scheduledSlots.filter(s => s.subjectId === subject.id);

            return (
              <div
                key={subject.id}
                className={`rounded-2xl border p-3.5 transition-all ${
                  currentStatus === 'present'
                    ? 'bg-emerald-950/20 border-emerald-800/60 shadow-sm'
                    : currentStatus === 'absent'
                    ? 'bg-rose-950/20 border-rose-800/60 shadow-sm'
                    : currentStatus === 'cancelled'
                    ? 'bg-slate-900/60 border-slate-800 opacity-75'
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: subject.color }}
                      />
                      <span className="font-semibold text-sm text-slate-100 truncate">
                        {subject.name}
                      </span>
                      {subject.code && (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded">
                          {subject.code}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      {isScheduled ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            Scheduled {slotDetails[0]?.startTime ? `(${slotDetails[0].startTime})` : ''}
                          </span>
                        </span>
                      ) : (
                        <span>Not in timetable today</span>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        Total: {subject.classesAttended}/{subject.classesHeld}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator text */}
                  {currentStatus && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        currentStatus === 'present'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : currentStatus === 'absent'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {currentStatus === 'present'
                        ? 'Present'
                        : currentStatus === 'absent'
                        ? 'Absent'
                        : 'No Class'}
                    </span>
                  )}
                </div>

                {/* 3-State Action Segment: [ Present | Absent | No Class ] */}
                <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() =>
                      onSetDailyAttendance(
                        subject.id,
                        selectedDate,
                        currentStatus === 'present' ? null : 'present'
                      )
                    }
                    className={`h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                      currentStatus === 'present'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 ring-2 ring-emerald-400/30'
                        : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Present</span>
                  </button>

                  <button
                    onClick={() =>
                      onSetDailyAttendance(
                        subject.id,
                        selectedDate,
                        currentStatus === 'absent' ? null : 'absent'
                      )
                    }
                    className={`h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                      currentStatus === 'absent'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40 ring-2 ring-rose-400/30'
                        : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Absent</span>
                  </button>

                  <button
                    onClick={() =>
                      onSetDailyAttendance(
                        subject.id,
                        selectedDate,
                        currentStatus === 'cancelled' ? null : 'cancelled'
                      )
                    }
                    className={`h-10 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                      currentStatus === 'cancelled'
                        ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-500'
                        : 'bg-slate-950/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>No Class</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
