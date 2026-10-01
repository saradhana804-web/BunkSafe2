import React from 'react';

interface SubjectProgressBarProps {
  percentage: number;
  targetPercentage?: number;
  classesAttended: number;
  classesHeld: number;
  canMissClasses?: number;
  neededClassesToAttend?: number;
}

export const SubjectProgressBar: React.FC<SubjectProgressBarProps> = ({
  percentage,
  targetPercentage = 75,
  classesAttended,
  classesHeld,
  canMissClasses = 0,
  neededClassesToAttend = 0,
}) => {
  const isEligible = percentage >= targetPercentage;
  const isNear = isEligible && (percentage <= targetPercentage + 5 || canMissClasses <= 1);
  const diffFromTarget = Math.round((percentage - targetPercentage) * 10) / 10;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  // Determine gradient / color theme based on relationship to 75% target
  let barGradient = 'from-emerald-500 to-teal-400';
  let textColor = 'text-emerald-400';
  let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

  if (!isEligible) {
    barGradient = 'from-rose-600 to-red-500';
    textColor = 'text-rose-400';
    badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  } else if (isNear) {
    barGradient = 'from-amber-500 to-yellow-400';
    textColor = 'text-amber-400';
    badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }

  return (
    <div className="w-full space-y-2 mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
      {/* Top row: Label & Delta relative to 75% target */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">Attendance</span>
          <span
            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${badgeBg}`}
          >
            {isEligible ? (
              diffFromTarget === 0 ? (
                'At 75% target'
              ) : (
                `+${diffFromTarget}% above target`
              )
            ) : (
              `${diffFromTarget}% below target`
            )}
          </span>
        </div>

        <div className="flex items-baseline gap-1 font-mono">
          <span className={`text-base font-extrabold tabular-nums ${textColor}`}>
            {percentage}%
          </span>
          <span className="text-[11px] text-slate-500">
            / {targetPercentage}% req
          </span>
        </div>
      </div>

      {/* Progress Bar Container with 75% Target Marker */}
      <div className="relative pt-1 pb-1">
        {/* Track */}
        <div className="relative w-full h-3.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/90 shadow-inner">
          {/* Subtle shortage zone highlight (< targetPercentage) */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-rose-950/20 border-r border-rose-900/30"
            style={{ width: `${targetPercentage}%` }}
          />

          {/* Filled Attendance Bar */}
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-700 ease-out shadow-sm`}
            style={{ width: `${clampedPercentage}%` }}
          />

          {/* 75% Target Threshold Line within the bar */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md z-10"
            style={{ left: `${targetPercentage}%` }}
          />
        </div>

        {/* Needle Marker Indicator at Target Percentage */}
        <div
          className="absolute -top-0.5 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20"
          style={{ left: `${targetPercentage}%` }}
        >
          <div className="w-1.5 h-1.5 rotate-45 bg-white shadow-sm ring-1 ring-slate-900" />
        </div>
      </div>

      {/* Axis Scale & Target Legend */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-0.5">
        <span>0%</span>

        {/* 75% Target Mark */}
        <div className="flex items-center gap-1 text-slate-300 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />
          <span>{targetPercentage}% Target</span>
        </div>

        <span>100%</span>
      </div>
    </div>
  );
};
