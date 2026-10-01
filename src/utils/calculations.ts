import { Subject, SubjectStats, OverallStats } from '../types/attendance';

/**
 * Calculates attendance percentage safely
 */
export function calculatePercentage(attended: number, held: number): number {
  if (held <= 0) return 100;
  const pct = (attended / held) * 100;
  return Math.min(100, Math.max(0, Math.round(pct * 10) / 10));
}

/**
 * Calculates how many additional classes a student can miss while staying at or above target percentage
 */
export function calculateClassesCanMiss(attended: number, held: number, targetPercentage: number = 75): number {
  if (held <= 0) return 0;
  const target = targetPercentage / 100;
  const currentRatio = attended / held;

  if (currentRatio < target) {
    return 0;
  }

  // Formula: attended / (held + M) >= target
  // M <= (attended / target) - held
  const maxMiss = Math.floor((attended / target) - held);
  return Math.max(0, maxMiss);
}

/**
 * Calculates how many consecutive classes a student must attend to reach at or above target percentage
 */
export function calculateClassesNeededToAttend(attended: number, held: number, targetPercentage: number = 75): number {
  if (held <= 0) return 0;
  const target = targetPercentage / 100;
  const currentRatio = attended / held;

  if (currentRatio >= target) {
    return 0;
  }

  // Formula: (attended + A) / (held + A) >= target
  // A * (1 - target) >= target * held - attended
  // A >= (target * held - attended) / (1 - target)
  const required = Math.ceil((target * held - attended) / (1 - target));
  return Math.max(0, required);
}

/**
 * Determines if attendance is dangerously close to dropping below threshold
 */
export function isNearThreshold(attended: number, held: number, targetPercentage: number = 75): boolean {
  if (held <= 0) return false;
  const pct = calculatePercentage(attended, held);
  if (pct < targetPercentage) return false; // Already in shortage
  
  const canMiss = calculateClassesCanMiss(attended, held, targetPercentage);
  // Warning if percentage is within 5% of target OR can only miss 0 or 1 class
  return pct <= targetPercentage + 5 || canMiss <= 1;
}

/**
 * Get detailed stats for an individual subject
 */
export function getSubjectStats(subject: Subject, defaultTarget: number = 75): SubjectStats {
  const target = subject.targetPercentage ?? defaultTarget;
  const held = Math.max(0, subject.classesHeld);
  const attended = Math.min(held, Math.max(0, subject.classesAttended));
  const missed = held - attended;
  const percentage = calculatePercentage(attended, held);
  const status: 'eligible' | 'shortage' = percentage >= target ? 'eligible' : 'shortage';
  const isClose = isNearThreshold(attended, held, target);
  const canMiss = calculateClassesCanMiss(attended, held, target);
  const needed = calculateClassesNeededToAttend(attended, held, target);

  return {
    subject,
    percentage,
    classesMissed: missed,
    status,
    isCloseToThreshold: isClose,
    canMissClasses: canMiss,
    neededClassesToAttend: needed,
  };
}

/**
 * Get aggregated stats for all subjects in the semester
 */
export function getOverallStats(subjects: Subject[], semesterTarget: number = 75): OverallStats {
  let totalHeld = 0;
  let totalAttended = 0;

  const subjectStatsList: SubjectStats[] = [];

  subjects.forEach(subj => {
    const held = Math.max(0, subj.classesHeld);
    const attended = Math.min(held, Math.max(0, subj.classesAttended));
    totalHeld += held;
    totalAttended += attended;
    subjectStatsList.push(getSubjectStats(subj, semesterTarget));
  });

  const totalMissed = totalHeld - totalAttended;
  const percentage = calculatePercentage(totalAttended, totalHeld);
  const status: 'eligible' | 'shortage' = percentage >= semesterTarget ? 'eligible' : 'shortage';
  const isClose = isNearThreshold(totalAttended, totalHeld, semesterTarget);
  const canMiss = calculateClassesCanMiss(totalAttended, totalHeld, semesterTarget);
  const needed = calculateClassesNeededToAttend(totalAttended, totalHeld, semesterTarget);

  // Subjects needing immediate attention: shortage or close to threshold
  const subjectsNeedingAttention = subjectStatsList.filter(
    s => s.status === 'shortage' || s.isCloseToThreshold
  );

  return {
    totalHeld,
    totalAttended,
    totalMissed,
    percentage,
    status,
    isCloseToThreshold: isClose,
    canMissClasses: canMiss,
    neededClassesToAttend: needed,
    subjectsNeedingAttention,
  };
}

/**
 * Simulates future attendance for what-if scenarios
 */
export function simulateAttendance(
  currentAttended: number,
  currentHeld: number,
  attendNext: number,
  missNext: number,
  targetPercentage: number = 75
) {
  const newAttended = currentAttended + attendNext;
  const newHeld = currentHeld + attendNext + missNext;
  const newPct = calculatePercentage(newAttended, newHeld);
  const isEligible = newPct >= targetPercentage;
  const canMiss = calculateClassesCanMiss(newAttended, newHeld, targetPercentage);
  const needed = calculateClassesNeededToAttend(newAttended, newHeld, targetPercentage);

  return {
    attended: newAttended,
    held: newHeld,
    percentage: newPct,
    isEligible,
    canMiss,
    needed,
  };
}
