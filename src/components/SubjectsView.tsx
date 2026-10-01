import React, { useState } from 'react';
import { Subject, SubjectStats, AttendanceRecord } from '../types/attendance';
import { getSubjectStats } from '../utils/calculations';
import { SubjectProgressBar } from './SubjectProgressBar';
import { SubjectTrendChart } from './SubjectTrendChart';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Calculator,
  RotateCcw,
  SlidersHorizontal,
  TrendingUp,
  ChevronDown
} from 'lucide-react';

interface SubjectsViewProps {
  subjects: Subject[];
  semesterTarget: number;
  attendanceLogs?: AttendanceRecord[];
  onMarkAttendance: (subjectId: string, status: 'present' | 'absent') => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
  onOpenAddSubject: () => void;
  onSelectSubjectForWhatIf: (subjectId: string) => void;
  onUndoLastAction?: () => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  semesterTarget,
  attendanceLogs = [],
  onMarkAttendance,
  onEditSubject,
  onDeleteSubject,
  onOpenAddSubject,
  onSelectSubjectForWhatIf,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'shortage' | 'safe'>('all');
  const [activeMenuSubjectId, setActiveMenuSubjectId] = useState<string | null>(null);
  const [expandedCharts, setExpandedCharts] = useState<Record<string, boolean>>({});

  const toggleChart = (subjectId: string) => {
    setExpandedCharts(prev => ({
      ...prev,
      [subjectId]: prev[subjectId] === undefined ? false : !prev[subjectId],
    }));
  };

  // Filter subjects
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subject.code && subject.code.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    const stats = getSubjectStats(subject, semesterTarget);
    if (filterType === 'shortage') return stats.status === 'shortage';
    if (filterType === 'safe') return stats.status === 'eligible';
    return true;
  });

  return (
    <div className="space-y-4 pb-8">
      {/* Top Controls: Search & Segmented Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subjects or code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>
          <button
            onClick={onOpenAddSubject}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 shadow-md shadow-emerald-900/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Subject</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterType === 'all'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({subjects.length})
            </button>
            <button
              onClick={() => setFilterType('shortage')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterType === 'shortage'
                  ? 'bg-rose-950/80 text-rose-300 font-semibold border border-rose-800/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Shortage
            </button>
            <button
              onClick={() => setFilterType('safe')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterType === 'safe'
                  ? 'bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-800/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Eligible
            </button>
          </div>
          <span className="text-[11px] text-slate-500">
            Target: <strong className="text-slate-300">{semesterTarget}%</strong>
          </span>
        </div>
      </div>

      {/* Empty State */}
      {filteredSubjects.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 space-y-3">
          <p className="text-sm text-slate-400">
            {searchQuery
              ? 'No subjects match your search.'
              : 'No subjects found in this semester.'}
          </p>
          <button
            onClick={onOpenAddSubject}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredSubjects.map(subject => {
            const stats = getSubjectStats(subject, semesterTarget);
            const target = subject.targetPercentage ?? semesterTarget;
            const isEligible = stats.status === 'eligible';
            const isNear = stats.isCloseToThreshold;
            const isMenuOpen = activeMenuSubjectId === subject.id;

            return (
              <div
                key={subject.id}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-md shadow-black/20 hover:border-slate-700/80 transition-all relative overflow-hidden"
              >
                {/* Subject Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: subject.color }}
                      />
                      <h3 className="text-base font-bold text-slate-100 truncate">
                        {subject.name}
                      </h3>
                      {subject.code && (
                        <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {subject.code}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Indicator & Options Menu */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold tracking-tight flex items-center gap-1 ${
                        isEligible
                          ? isNear
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isEligible ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                          <span>Eligible</span>
                        </>
                      ) : (
                        <>
                          <AlertOctagon className="w-3 h-3 stroke-[2.5]" />
                          <span>Shortage</span>
                        </>
                      )}
                    </div>

                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveMenuSubjectId(isMenuOpen ? null : subject.id)
                        }
                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 flex items-center justify-center transition-colors"
                        title="Options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setActiveMenuSubjectId(null)}
                          />
                          <div className="absolute right-0 top-9 z-40 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1 text-xs">
                            <button
                              onClick={() => {
                                setActiveMenuSubjectId(null);
                                onEditSubject(subject);
                              }}
                              className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                              <span>Edit Attendance Counts</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuSubjectId(null);
                                onSelectSubjectForWhatIf(subject.id);
                              }}
                              className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                            >
                              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                              <span>What-If Simulator</span>
                            </button>
                            <div className="h-px bg-slate-800 my-1" />
                            <button
                              onClick={() => {
                                setActiveMenuSubjectId(null);
                                if (
                                  confirm(
                                    `Delete "${subject.name}"? Attendance records for this subject will be removed.`
                                  )
                                ) {
                                  onDeleteSubject(subject.id);
                                }
                              }}
                              className="w-full px-3 py-2 text-left text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Subject</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Visual Progress Bar Component relative to 75% target */}
                <SubjectProgressBar
                  percentage={stats.percentage}
                  targetPercentage={target}
                  classesAttended={subject.classesAttended}
                  classesHeld={subject.classesHeld}
                  canMissClasses={stats.canMissClasses}
                  neededClassesToAttend={stats.neededClassesToAttend}
                />

                {/* Small Line Chart (Recharts) visualizing attendance % over time */}
                <SubjectTrendChart
                  subject={subject}
                  targetPercentage={target}
                  attendanceLogs={attendanceLogs}
                />

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-center">
                  <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Attended
                    </span>
                    <span className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                      {subject.classesAttended}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Held
                    </span>
                    <span className="text-base font-bold font-mono text-slate-200 tabular-nums">
                      {subject.classesHeld}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Missed
                    </span>
                    <span className="text-base font-bold font-mono text-rose-400 tabular-nums">
                      {stats.classesMissed}
                    </span>
                  </div>
                </div>

                {/* Dynamic Requirement & Bunk Message */}
                <div
                  className={`mt-3 rounded-xl p-2.5 text-xs font-medium border ${
                    isEligible
                      ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                  }`}
                >
                  {isEligible ? (
                    <div className="flex items-center justify-between">
                      <span>Classes you can safely miss:</span>
                      <span className="font-mono font-bold text-sm text-white">
                        {stats.canMissClasses} {stats.canMissClasses === 1 ? 'class' : 'classes'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span>Attend consecutively to reach {target}%:</span>
                      <span className="font-mono font-bold text-sm text-white">
                        {stats.neededClassesToAttend} {stats.neededClassesToAttend === 1 ? 'class' : 'classes'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tactile Big Present & Absent Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5 mt-3.5">
                  <button
                    onClick={() => onMarkAttendance(subject.id, 'present')}
                    className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/40 active:scale-[0.98] transition-all touch-manipulation cursor-pointer"
                  >
                    <span className="text-base leading-none">✓</span>
                    <span>Present (+1)</span>
                  </button>

                  <button
                    onClick={() => onMarkAttendance(subject.id, 'absent')}
                    className="h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-900/40 active:scale-[0.98] transition-all touch-manipulation cursor-pointer"
                  >
                    <span className="text-base leading-none">✗</span>
                    <span>Absent (+0)</span>
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
