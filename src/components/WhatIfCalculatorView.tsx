import React, { useState } from 'react';
import { Subject, OverallStats } from '../types/attendance';
import { 
  simulateAttendance, 
  calculatePercentage, 
  calculateClassesCanMiss, 
  calculateClassesNeededToAttend 
} from '../utils/calculations';
import { 
  Calculator, 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle, 
  ArrowRight, 
  Target, 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown, 
  RotateCcw 
} from 'lucide-react';

interface WhatIfCalculatorViewProps {
  subjects: Subject[];
  overallStats: OverallStats;
  semesterTarget: number;
  initialSubjectId?: string | null;
}

export const WhatIfCalculatorView: React.FC<WhatIfCalculatorViewProps> = ({
  subjects,
  overallStats,
  semesterTarget,
  initialSubjectId,
}) => {
  // Selection: 'overall' or subject.id
  const [selectedScope, setSelectedScope] = useState<string>(initialSubjectId || 'overall');

  // Input states for simulation
  const [attendNext, setAttendNext] = useState<number>(1);
  const [missNext, setMissNext] = useState<number>(0);

  // Goal target finder state
  const [customGoalTarget, setCustomGoalTarget] = useState<number>(semesterTarget);

  // Determine current base numbers
  const isOverall = selectedScope === 'overall';
  const selectedSubject = subjects.find(s => s.id === selectedScope);

  const currentAttended = isOverall
    ? overallStats.totalAttended
    : (selectedSubject?.classesAttended ?? 0);
  const currentHeld = isOverall
    ? overallStats.totalHeld
    : (selectedSubject?.classesHeld ?? 0);
  const currentPct = calculatePercentage(currentAttended, currentHeld);
  const currentCanMiss = calculateClassesCanMiss(currentAttended, currentHeld, semesterTarget);
  const currentNeeded = calculateClassesNeededToAttend(currentAttended, currentHeld, semesterTarget);

  // Simulation result with both inputs combined or tested individually
  const simulation = simulateAttendance(
    currentAttended,
    currentHeld,
    attendNext,
    missNext,
    semesterTarget
  );

  const pctDiff = Math.round((simulation.percentage - currentPct) * 10) / 10;

  // Goal calculation for custom goal
  const goalClassesNeeded = calculateClassesNeededToAttend(
    currentAttended,
    currentHeld,
    customGoalTarget
  );

  return (
    <div className="space-y-5 pb-8">
      {/* Header & Scope Switcher */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Calculator className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">What-If Attendance Simulator</h2>
            <p className="text-xs text-slate-400">
              Predict your attendance percentage before making attendance decisions
            </p>
          </div>
        </div>

        {/* Select Scope */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Select Scope to Simulate:
          </label>
          <select
            value={selectedScope}
            onChange={e => setSelectedScope(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="overall">
              Overall Semester (All {subjects.length} Subjects Combined)
            </option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} {s.code ? `(${s.code})` : ''} — Current: {calculatePercentage(s.classesAttended, s.classesHeld)}%
              </option>
            ))}
          </select>
        </div>

        {/* Current Baseline Card */}
        <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Current Status</span>
            <span className="font-bold text-slate-200">
              {currentAttended} / {currentHeld} classes attended
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">Current Percentage</span>
            <span
              className={`font-mono font-extrabold text-base tabular-nums ${
                currentPct >= semesterTarget ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {currentPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Simulation Panel: Attend Next vs Miss Next */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scenario 1: Attend Next Classes */}
        <div className="rounded-2xl bg-slate-900/90 border border-emerald-900/40 p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                +
              </div>
              <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Attend Next Classes
              </h3>
            </div>
            {attendNext > 0 && (
              <button
                onClick={() => setAttendNext(0)}
                className="text-[10px] text-slate-400 hover:text-white"
              >
                Reset
              </button>
            )}
          </div>

          <p className="text-xs text-slate-300">
            “I will attend the next <strong className="text-emerald-400">{attendNext}</strong> classes.”
          </p>

          {/* Stepper */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAttendNext(Math.max(0, attendNext - 1))}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-colors active:scale-95"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min="0"
              max="200"
              value={attendNext}
              onChange={e => setAttendNext(Math.max(0, parseInt(e.target.value) || 0))}
              className="flex-1 h-10 rounded-xl bg-slate-950 border border-slate-700 text-center font-mono font-bold text-lg text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => setAttendNext(attendNext + 1)}
              className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center transition-colors active:scale-95"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 pt-1">
            {[1, 2, 3, 5, 10].map(n => (
              <button
                key={n}
                onClick={() => setAttendNext(n)}
                className={`flex-1 py-1 rounded-lg text-xs font-mono transition-colors ${
                  attendNext === n
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                +{n}
              </button>
            ))}
          </div>
        </div>

        {/* Scenario 2: Miss Next Classes */}
        <div className="rounded-2xl bg-slate-900/90 border border-rose-900/40 p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold">
                -
              </div>
              <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                Miss / Bunk Next Classes
              </h3>
            </div>
            {missNext > 0 && (
              <button
                onClick={() => setMissNext(0)}
                className="text-[10px] text-slate-400 hover:text-white"
              >
                Reset
              </button>
            )}
          </div>

          <p className="text-xs text-slate-300">
            “I may miss the next <strong className="text-rose-400">{missNext}</strong> classes.”
          </p>

          {/* Stepper */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMissNext(Math.max(0, missNext - 1))}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-colors active:scale-95"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min="0"
              max="200"
              value={missNext}
              onChange={e => setMissNext(Math.max(0, parseInt(e.target.value) || 0))}
              className="flex-1 h-10 rounded-xl bg-slate-950 border border-slate-700 text-center font-mono font-bold text-lg text-rose-400 focus:outline-none focus:border-rose-500"
            />
            <button
              onClick={() => setMissNext(missNext + 1)}
              className="w-10 h-10 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center transition-colors active:scale-95"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 pt-1">
            {[1, 2, 3, 5, 10].map(n => (
              <button
                key={n}
                onClick={() => setMissNext(n)}
                className={`flex-1 py-1 rounded-lg text-xs font-mono transition-colors ${
                  missNext === n
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                +{n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Projected Result Card */}
      <div
        className={`rounded-3xl border p-5 transition-all shadow-xl ${
          simulation.isEligible
            ? 'bg-slate-900 border-emerald-800/80 shadow-emerald-950/20'
            : 'bg-slate-900 border-rose-800/80 shadow-rose-950/20'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Simulated Outcome
          </span>
          <div
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              simulation.isEligible
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {simulation.isEligible ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Eligible (≥{semesterTarget}%)</span>
              </>
            ) : (
              <>
                <AlertOctagon className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Shortage (&lt;{semesterTarget}%)</span>
              </>
            )}
          </div>
        </div>

        {/* Projected Numbers Display */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 items-center">
          {/* Current */}
          <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">Current Rate</span>
            <span className="text-2xl font-extrabold font-mono text-slate-300 tabular-nums">
              {currentPct}%
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
              ({currentAttended}/{currentHeld})
            </span>
          </div>

          {/* Arrow / Shift Indicator */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-slate-500">
              <span className="text-xs font-medium">Becomes</span>
              <ArrowRight className="w-4 h-4" />
            </div>
            <div
              className={`flex items-center gap-1 text-xs font-bold font-mono mt-1 ${
                pctDiff > 0
                  ? 'text-emerald-400'
                  : pctDiff < 0
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {pctDiff > 0 ? (
                <>
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+{pctDiff}%</span>
                </>
              ) : pctDiff < 0 ? (
                <>
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>{pctDiff}%</span>
                </>
              ) : (
                <span>No change (0%)</span>
              )}
            </div>
          </div>

          {/* New Projected */}
          <div
            className={`rounded-2xl p-3 border text-center ${
              simulation.isEligible
                ? 'bg-emerald-950/30 border-emerald-800/60'
                : 'bg-rose-950/30 border-rose-800/60'
            }`}
          >
            <span className="text-[11px] text-slate-300 block mb-0.5">Projected Rate</span>
            <span
              className={`text-2xl font-extrabold font-mono tabular-nums ${
                simulation.isEligible ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {simulation.percentage}%
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
              ({simulation.attended}/{simulation.held})
            </span>
          </div>
        </div>

        {/* Detailed Impact Insight */}
        <div className="pt-3 border-t border-slate-800/80 text-xs">
          {simulation.isEligible ? (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-emerald-200 leading-relaxed">
              ✅ <strong>Safe outcome:</strong> With this scenario, your attendance will stay at{' '}
              <span className="font-mono font-bold text-white">{simulation.percentage}%</span> (above {semesterTarget}%).
              You would still have a cushion to miss{' '}
              <strong className="text-white">{simulation.canMiss} additional {simulation.canMiss === 1 ? 'class' : 'classes'}</strong> before entering shortage.
            </div>
          ) : (
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-200 leading-relaxed">
              ⚠️ <strong>Shortage alert:</strong> With this scenario, your attendance drops to{' '}
              <span className="font-mono font-bold text-white">{simulation.percentage}%</span> (below {semesterTarget}%).
              To recover back to {semesterTarget}%, you would need to attend{' '}
              <strong className="text-white">{simulation.needed} consecutive {simulation.needed === 1 ? 'class' : 'classes'}</strong> afterwards.
            </div>
          )}
        </div>
      </div>

      {/* Target Goal Finder Tool */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Target Goal Calculator</h3>
        </div>

        <p className="text-xs text-slate-300">
          Find out exactly how many consecutive classes you must attend to achieve any attendance target:
        </p>

        <div className="flex items-center gap-2">
          {[75, 80, 85, 90].map(tgt => (
            <button
              key={tgt}
              onClick={() => setCustomGoalTarget(tgt)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                customGoalTarget === tgt
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tgt}%
            </button>
          ))}
          <div className="relative w-24">
            <input
              type="number"
              min="50"
              max="100"
              value={customGoalTarget}
              onChange={e => setCustomGoalTarget(Math.min(100, Math.max(1, parseInt(e.target.value) || 0)))}
              className="w-full px-2 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-center text-white focus:outline-none focus:border-emerald-500"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">%</span>
          </div>
        </div>

        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">To reach {customGoalTarget}% attendance:</span>
            <span className="font-medium text-slate-200">
              {goalClassesNeeded === 0 ? (
                <span className="text-emerald-400 font-bold">You are already at or above {customGoalTarget}%!</span>
              ) : (
                <>
                  Attend <strong className="text-emerald-400 font-mono text-sm">{goalClassesNeeded} consecutive</strong> classes
                </>
              )}
            </span>
          </div>
          {goalClassesNeeded > 0 && (
            <button
              onClick={() => setAttendNext(goalClassesNeeded)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-[11px] font-bold transition-colors"
            >
              Apply to simulation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
