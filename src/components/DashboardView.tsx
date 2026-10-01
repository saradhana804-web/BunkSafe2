import React from 'react';
import { Subject, OverallStats, TimetableSlot, AttendanceRecord, DayOfWeek, ActiveTab } from '../types/attendance';
import { WeeklySummary } from './WeeklySummary';
import { OverallAttendanceTrendChart } from './OverallAttendanceTrendChart';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  PlusCircle, 
  CalendarDays, 
  ChevronRight,
  Calculator
} from 'lucide-react';

interface DashboardViewProps {
  stats: OverallStats;
  subjects: Subject[];
  targetPercentage: number;
  timetable: TimetableSlot[];
  attendanceLogs: AttendanceRecord[];
  semesterId: string;
  onMarkAttendance: (subjectId: string, status: 'present' | 'absent') => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenAddSubject: () => void;
  onSelectSubjectForWhatIf: (subjectId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  subjects,
  targetPercentage,
  timetable,
  attendanceLogs,
  semesterId,
  onMarkAttendance,
  onNavigateTab,
  onOpenAddSubject,
  onSelectSubjectForWhatIf,
}) => {
  // Determine current day of week for Today's Schedule
  const days: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayIndex = new Date().getDay();
  const currentDay = days[todayIndex];

  const dayNames: Record<DayOfWeek, string> = {
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday',
    sun: 'Sunday',
  };

  // Get today's classes from timetable
  const todaysSlots = timetable.filter(slot => slot.day === currentDay);
  const todaysSubjectSlots = todaysSlots.map(slot => ({
    slot,
    subject: subjects.find(s => s.id === slot.subjectId),
  })).filter((item): item is { slot: TimetableSlot; subject: Subject } => !!item.subject);

  // Status colors & labels
  const isEligible = stats.percentage >= targetPercentage;
  const isShortage = !isEligible;
  const isClose = stats.isCloseToThreshold;

  // Calculation for circular SVG progress
  const strokeWidth = 10;
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  // Normalized percentage capped at 100 for visual stroke
  const strokeDashoffset = circumference - (Math.min(100, stats.percentage) / 100) * circumference;
  const targetOffsetAngle = (targetPercentage / 100) * 360;

  return (
    <div className="space-y-5 pb-6">
      {/* Dynamic Warning Alert Banner */}
      {isShortage ? (
        <div className="rounded-2xl p-4 bg-rose-950/50 border border-rose-800/80 flex items-start gap-3 shadow-lg shadow-rose-950/20">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 mt-0.5">
            <AlertOctagon className="w-5 h-5 text-rose-400 stroke-[2.5]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-rose-200">
              🔴 Attendance Shortage
            </h4>
            <p className="text-xs text-rose-300/90 mt-0.5 leading-relaxed">
              Attendance shortage — you need to attend upcoming classes to reach {targetPercentage}%. You must attend{' '}
              <span className="font-bold text-white underline underline-offset-2">
                {stats.neededClassesToAttend} consecutive {stats.neededClassesToAttend === 1 ? 'class' : 'classes'}
              </span>{' '}
              without missing any to become eligible.
            </p>
          </div>
        </div>
      ) : isClose ? (
        <div className="rounded-2xl p-4 bg-amber-950/40 border border-amber-700/70 flex items-start gap-3 shadow-lg shadow-amber-950/20">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 stroke-[2.5]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-amber-200">
              ⚠️ Attendance is close to the {targetPercentage}% requirement
            </h4>
            <p className="text-xs text-amber-300/90 mt-0.5 leading-relaxed">
              {stats.canMissClasses === 0 ? (
                <>You cannot afford to miss any more classes! Missing the next class will put you into shortage.</>
              ) : (
                <>
                  You can safely miss only{' '}
                  <span className="font-bold text-white">{stats.canMissClasses} more {stats.canMissClasses === 1 ? 'class' : 'classes'}</span>.
                  Stay vigilant!
                </>
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-3.5 bg-emerald-950/30 border border-emerald-800/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-300">Comfortable Safe Zone</span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs text-emerald-400/90 font-medium">
                {stats.canMissClasses} {stats.canMissClasses === 1 ? 'class' : 'classes'} can be missed safely
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Hero Card: Overall Attendance Percentage & Ring */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl shadow-black/40 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div
          className={`absolute -right-16 -top-16 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-20 ${
            isEligible ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          {/* Circular Progress Gauge */}
          <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              {/* Background circle track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-slate-800"
                strokeWidth={strokeWidth}
                stroke="currentColor"
                fill="transparent"
              />
              {/* Target 75% indicator line */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth={strokeWidth + 2}
                strokeDasharray={`2 ${circumference / 100 * 3}`}
                strokeDashoffset={circumference - (targetPercentage / 100) * circumference}
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className={`transition-all duration-700 ease-out ${
                  isEligible ? 'text-emerald-500' : 'text-rose-500'
                }`}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
              <span className="text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums">
                {stats.percentage}%
              </span>
              <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                Overall Attendance
              </span>
              <div
                className={`mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide flex items-center gap-1 ${
                  isEligible
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
              >
                {isEligible ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                    Eligible
                  </>
                ) : (
                  <>
                    <AlertOctagon className="w-3 h-3 stroke-[2.5]" />
                    Shortage
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Column */}
          <div className="flex-1 w-full space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs text-slate-400 font-medium">Target Requirement</span>
              <span className="text-xs font-mono font-bold text-slate-200">
                {targetPercentage}% Min.
              </span>
            </div>

            {/* 3 Metric counters */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                  Attended
                </span>
                <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                  {stats.totalAttended}
                </span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                  Held
                </span>
                <span className="text-xl font-bold font-mono text-slate-200 tabular-nums">
                  {stats.totalHeld}
                </span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                  Missed
                </span>
                <span className="text-xl font-bold font-mono text-rose-400 tabular-nums">
                  {stats.totalMissed}
                </span>
              </div>
            </div>

            {/* Bunk status insight box */}
            <div
              className={`rounded-xl p-3 border text-xs ${
                isEligible
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                  : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
              }`}
            >
              {isEligible ? (
                <div className="flex items-center justify-between">
                  <span>Safe classes you can miss:</span>
                  <span className="font-mono font-bold text-base text-white tabular-nums">
                    {stats.canMissClasses}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span>Classes needed to reach {targetPercentage}%:</span>
                  <span className="font-mono font-bold text-base text-white tabular-nums">
                    {stats.neededClassesToAttend}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 30-Day Cumulative Overall Attendance Trend Line Chart */}
      <OverallAttendanceTrendChart
        stats={stats}
        subjects={subjects}
        attendanceLogs={attendanceLogs}
        targetPercentage={targetPercentage}
        semesterId={semesterId}
      />

      {/* Aggregated Weekly Attendance Summary */}
      <WeeklySummary
        timetable={timetable}
        subjects={subjects}
        attendanceLogs={attendanceLogs}
        semesterId={semesterId}
        targetPercentage={targetPercentage}
        onNavigateTab={onNavigateTab}
      />

      {/* Today's Schedule & Quick Attendance Action */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-200">
              Today's Schedule ({dayNames[currentDay]})
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('timetable')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-0.5"
          >
            <span>Timetable</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todaysSubjectSlots.length === 0 ? (
          <div className="text-center py-5 px-3 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
            <p className="text-xs text-slate-400">
              No classes scheduled on {dayNames[currentDay]}.
            </p>
            <button
              onClick={() => onNavigateTab('timetable')}
              className="mt-2 text-xs text-emerald-400 hover:underline font-semibold"
            >
              Add classes to your timetable →
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todaysSubjectSlots.map(({ slot, subject }) => {
              const currentPct = Math.round(
                (subject.classesAttended / Math.max(1, subject.classesHeld)) * 100
              );
              return (
                <div
                  key={slot.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
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
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                          {subject.code}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      {slot.startTime && (
                        <span>
                          {slot.startTime} {slot.endTime ? `– ${slot.endTime}` : ''}
                        </span>
                      )}
                      {slot.room && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{slot.room}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {subject.classesAttended}/{subject.classesHeld} ({currentPct}%)
                      </span>
                    </div>
                  </div>

                  {/* Tactile Quick Mark Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onMarkAttendance(subject.id, 'present')}
                      className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 min-w-[80px]"
                    >
                      <span>+ Present</span>
                    </button>
                    <button
                      onClick={() => onMarkAttendance(subject.id, 'absent')}
                      className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 min-w-[76px]"
                    >
                      <span>+ Absent</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subjects Requiring Attention */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200">
              Subjects Requiring Attention
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('subjects')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-0.5"
          >
            <span>View All ({subjects.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {stats.subjectsNeedingAttention.length === 0 ? (
          <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-center">
            <p className="text-xs text-emerald-400 font-medium">
              🎉 Excellent! All subjects are safely above the {targetPercentage}% threshold.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {stats.subjectsNeedingAttention.map(item => (
              <div
                key={item.subject.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.subject.color }}
                    />
                    <span className="font-semibold text-sm text-slate-200 truncate">
                      {item.subject.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.status === 'shortage'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {item.status === 'shortage' ? 'Shortage' : 'Low Buffer'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 font-mono">
                    <span className="tabular-nums">
                      {item.subject.classesAttended}/{item.subject.classesHeld} attended
                    </span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-bold tabular-nums ${
                        item.status === 'shortage' ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      {item.percentage}%
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 mt-1 font-medium">
                    {item.status === 'shortage' ? (
                      <span className="text-rose-300">
                        Attend next <strong>{item.neededClassesToAttend} consecutive</strong> classes to reach {targetPercentage}%
                      </span>
                    ) : (
                      <span className="text-amber-300">
                        Can only miss <strong>{item.canMissClasses} more</strong> class before shortage
                      </span>
                    )}
                  </p>
                </div>

                {/* What if shortcut */}
                <button
                  onClick={() => onSelectSubjectForWhatIf(item.subject.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1 shrink-0"
                  title="Test What-If for this subject"
                >
                  <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">What-If</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions Footer Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={() => onNavigateTab('whatif')}
          className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold shadow-md transition-all active:scale-[0.98]"
        >
          <Calculator className="w-4 h-4 text-emerald-400" />
          <span>What-If Calculator</span>
        </button>
        <button
          onClick={() => onNavigateTab('calendar')}
          className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold shadow-md transition-all active:scale-[0.98]"
        >
          <CalendarDays className="w-4 h-4 text-teal-400" />
          <span>Mark by Date</span>
        </button>
      </div>
    </div>
  );
};
