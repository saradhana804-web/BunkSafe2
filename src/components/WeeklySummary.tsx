import React from 'react';
import { Subject, TimetableSlot, AttendanceRecord, DayOfWeek, ActiveTab } from '../types/attendance';
import { 
  CalendarRange, 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  ArrowUpRight, 
  Check, 
  X, 
  Minus 
} from 'lucide-react';

interface WeeklySummaryProps {
  timetable: TimetableSlot[];
  subjects: Subject[];
  attendanceLogs: AttendanceRecord[];
  semesterId: string;
  targetPercentage?: number;
  onNavigateTab?: (tab: ActiveTab) => void;
}

interface DaySummary {
  dayKey: DayOfWeek;
  dayLabel: string;
  shortLabel: string;
  dateStr: string;
  dayNumber: number;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  scheduledSlots: TimetableSlot[];
  attendedCount: number;
  missedCount: number;
  cancelledCount: number;
  missedSubjects: { subject: Subject; time?: string }[];
}

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({
  timetable,
  subjects,
  attendanceLogs,
  semesterId,
  targetPercentage = 75,
  onNavigateTab,
}) => {
  // Compute Monday to Sunday of the current week
  const now = new Date();
  const currentDayOfWeekIdx = now.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = currentDayOfWeekIdx === 0 ? -6 : 1 - currentDayOfWeekIdx;

  const mondayDate = new Date(now);
  mondayDate.setDate(now.getDate() + distanceToMonday);

  const sundayDate = new Date(mondayDate);
  sundayDate.setDate(mondayDate.getDate() + 6);

  const formatDateISO = (d: Date) => d.toISOString().split('T')[0];
  const todayISO = formatDateISO(now);

  const daysKeys: { key: DayOfWeek; label: string; short: string }[] = [
    { key: 'mon', label: 'Monday', short: 'Mon' },
    { key: 'tue', label: 'Tuesday', short: 'Tue' },
    { key: 'wed', label: 'Wednesday', short: 'Wed' },
    { key: 'thu', label: 'Thursday', short: 'Thu' },
    { key: 'fri', label: 'Friday', short: 'Fri' },
    { key: 'sat', label: 'Saturday', short: 'Sat' },
    { key: 'sun', label: 'Sunday', short: 'Sun' },
  ];

  // Build daily summaries for current week
  let totalScheduledWeek = 0;
  let totalAttendedWeek = 0;
  let totalMissedWeek = 0;
  let totalCancelledWeek = 0;
  let remainingScheduledWeek = 0;

  const allMissedSubjectsMap = new Map<string, { subject: Subject; count: number; days: string[] }>();

  const weekDays: DaySummary[] = daysKeys.map((item, index) => {
    const dayDate = new Date(mondayDate);
    dayDate.setDate(mondayDate.getDate() + index);
    const dateStr = formatDateISO(dayDate);

    const isToday = dateStr === todayISO;
    const isPast = dateStr < todayISO;
    const isFuture = dateStr > todayISO;

    // Scheduled timetable slots for this day
    const scheduledSlots = timetable.filter(
      slot => slot.day === item.key && slot.semesterId === semesterId
    );
    totalScheduledWeek += scheduledSlots.length;

    if (isFuture) {
      remainingScheduledWeek += scheduledSlots.length;
    }

    // Attendance logs for this date
    const dayLogs = attendanceLogs.filter(
      log => log.date === dateStr && log.semesterId === semesterId
    );

    let attendedCount = 0;
    let missedCount = 0;
    let cancelledCount = 0;
    const missedSubs: { subject: Subject; time?: string }[] = [];

    dayLogs.forEach(log => {
      if (log.status === 'present') {
        attendedCount++;
      } else if (log.status === 'absent') {
        missedCount++;
        const sub = subjects.find(s => s.id === log.subjectId);
        if (sub) {
          missedSubs.push({ subject: sub });
          const existing = allMissedSubjectsMap.get(sub.id) || {
            subject: sub,
            count: 0,
            days: [],
          };
          existing.count += 1;
          if (!existing.days.includes(item.short)) {
            existing.days.push(item.short);
          }
          allMissedSubjectsMap.set(sub.id, existing);
        }
      } else if (log.status === 'cancelled') {
        cancelledCount++;
      }
    });

    totalAttendedWeek += attendedCount;
    totalMissedWeek += missedCount;
    totalCancelledWeek += cancelledCount;

    return {
      dayKey: item.key,
      dayLabel: item.label,
      shortLabel: item.short,
      dateStr,
      dayNumber: dayDate.getDate(),
      isToday,
      isPast,
      isFuture,
      scheduledSlots,
      attendedCount,
      missedCount,
      cancelledCount,
      missedSubjects: missedSubs,
    };
  });

  const totalHeldSoFar = totalAttendedWeek + totalMissedWeek;
  const weeklyRate =
    totalHeldSoFar > 0
      ? Math.round((totalAttendedWeek / totalHeldSoFar) * 1000) / 10
      : 100;
  const isWeeklyEligible = weeklyRate >= targetPercentage;

  // Format header date range: "Sep 28 – Oct 4"
  const formatHeaderDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const weekRangeText = `${formatHeaderDate(mondayDate)} – ${formatHeaderDate(sundayDate)}`;

  // Missed subjects list
  const missedList = Array.from(allMissedSubjectsMap.values());

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl shadow-black/30 space-y-4 relative overflow-hidden">
      {/* Header with Date Range */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <CalendarRange className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Weekly Summary</span>
              <span className="text-[11px] font-mono font-normal text-slate-400">
                ({weekRangeText})
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Aggregated attendance performance for the current academic week
            </p>
          </div>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('calendar')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 shrink-0"
          >
            <span>Daily Log</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Prominent Missed vs Scheduled Highlight Card */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          totalMissedWeek === 0
            ? 'bg-emerald-950/30 border-emerald-800/60'
            : totalMissedWeek <= 2
            ? 'bg-amber-950/30 border-amber-800/60'
            : 'bg-rose-950/30 border-rose-800/60'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Main Headline */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                Classes Missed vs Scheduled
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  totalMissedWeek === 0
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : isWeeklyEligible
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
              >
                {totalMissedWeek === 0
                  ? 'Zero Missed · 100% Attended'
                  : isWeeklyEligible
                  ? `Weekly Rate: ${weeklyRate}% (Above ${targetPercentage}%)`
                  : `Weekly Shortage: ${weeklyRate}% (< ${targetPercentage}%)`}
              </span>
            </div>

            <div className="mt-1 flex items-baseline gap-2">
              <span
                className={`text-2xl sm:text-3xl font-extrabold font-mono tabular-nums ${
                  totalMissedWeek === 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {totalMissedWeek}
              </span>
              <span className="text-sm font-semibold text-slate-300">
                {totalMissedWeek === 1 ? 'class missed' : 'classes missed'}
              </span>
              <span className="text-slate-500 text-sm">out of</span>
              <span className="text-xl font-bold font-mono text-slate-200 tabular-nums">
                {totalScheduledWeek}
              </span>
              <span className="text-xs text-slate-400">total scheduled this week</span>
            </div>
          </div>

          {/* Quick ratio badge */}
          <div className="sm:text-right shrink-0">
            <span className="text-[10px] text-slate-400 block font-medium">Classes Held So Far</span>
            <span className="text-sm font-mono font-bold text-slate-200">
              {totalAttendedWeek} attended / {totalHeldSoFar} held
            </span>
          </div>
        </div>

        {/* Visual Multi-Segment Week Attendance Bar */}
        <div className="mt-3.5 space-y-1.5">
          <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 flex">
            {/* Attended portion */}
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{
                width: `${totalScheduledWeek > 0 ? (totalAttendedWeek / totalScheduledWeek) * 100 : 0}%`,
              }}
              title={`Attended: ${totalAttendedWeek}`}
            />
            {/* Missed portion */}
            <div
              className="h-full bg-rose-500 transition-all duration-500"
              style={{
                width: `${totalScheduledWeek > 0 ? (totalMissedWeek / totalScheduledWeek) * 100 : 0}%`,
              }}
              title={`Missed: ${totalMissedWeek}`}
            />
            {/* Remaining / Upcoming scheduled */}
            <div
              className="h-full bg-slate-800/80 transition-all duration-500"
              style={{
                width: `${totalScheduledWeek > 0 ? (remainingScheduledWeek / totalScheduledWeek) * 100 : 0}%`,
              }}
              title={`Upcoming: ${remainingScheduledWeek}`}
            />
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{totalAttendedWeek} Attended</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{totalMissedWeek} Missed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              <span>{remainingScheduledWeek} Remaining</span>
            </span>
          </div>
        </div>
      </div>

      {/* Day-by-Day Week Matrix */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-300 block">
          Day-by-Day Class Breakdown:
        </span>
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map(day => {
            const hasMissed = day.missedCount > 0;
            const hasAttended = day.attendedCount > 0;
            const hasScheduled = day.scheduledSlots.length > 0;

            return (
              <div
                key={day.dayKey}
                className={`p-2 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                  day.isToday
                    ? 'bg-slate-800/90 border-emerald-500/70 ring-1 ring-emerald-500/40'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                {/* Day Header */}
                <div>
                  <span
                    className={`text-[10px] uppercase font-bold block ${
                      day.isToday ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {day.shortLabel}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-200">
                    {day.dayNumber}
                  </span>
                </div>

                {/* Day Status Icon / Badge */}
                <div className="my-1.5">
                  {!hasScheduled ? (
                    <span className="text-slate-600 text-xs">—</span>
                  ) : day.isFuture ? (
                    <div className="w-5 h-5 rounded-full border border-dashed border-slate-600 flex items-center justify-center text-[10px] font-mono text-slate-400">
                      {day.scheduledSlots.length}
                    </div>
                  ) : hasMissed ? (
                    <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center text-[10px] font-bold">
                      ✕
                    </div>
                  ) : hasAttended ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-mono">
                      {day.scheduledSlots.length}
                    </div>
                  )}
                </div>

                {/* Scheduled Count Footnote */}
                <span className="text-[9px] font-mono text-slate-500">
                  {hasScheduled ? `${day.scheduledSlots.length} cls` : 'Off'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subjects Missed Breakdown (if any) */}
      {missedList.length > 0 && (
        <div className="p-3 bg-slate-950/80 rounded-xl border border-rose-900/30 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-rose-300 font-semibold">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            <span>Missed Subjects This Week:</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {missedList.map(item => (
              <div
                key={item.subject.id}
                className="px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-800/40 flex items-center gap-1.5 text-[11px]"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.subject.color }}
                />
                <span className="font-semibold text-slate-200">
                  {item.subject.name}
                </span>
                <span className="text-rose-400 font-mono font-bold">
                  {item.count} {item.count === 1 ? 'class missed' : 'classes missed'}
                </span>
                <span className="text-slate-500">({item.days.join(', ')})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
