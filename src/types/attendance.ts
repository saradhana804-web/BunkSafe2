export type AttendanceStatus = 'present' | 'absent' | 'cancelled';

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface Semester {
  id: string;
  name: string;
  targetPercentage: number; // default 75
  startDate?: string;
  endDate?: string;
  createdAt: number;
}

export interface Subject {
  id: string;
  semesterId: string;
  name: string;
  code?: string;
  color: string;
  classesHeld: number;
  classesAttended: number;
  targetPercentage?: number; // defaults to semester target if not set
  updatedAt?: number;
}

export interface AttendanceRecord {
  id: string;
  semesterId: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  timestamp: number;
  notes?: string;
}

export interface TimetableSlot {
  id: string;
  semesterId: string;
  day: DayOfWeek;
  subjectId: string;
  startTime?: string; // e.g. "09:00"
  endTime?: string;   // e.g. "10:00"
  room?: string;
}

export interface SubjectStats {
  subject: Subject;
  percentage: number;
  classesMissed: number;
  status: 'eligible' | 'shortage';
  isCloseToThreshold: boolean;
  canMissClasses: number;
  neededClassesToAttend: number;
}

export interface OverallStats {
  totalHeld: number;
  totalAttended: number;
  totalMissed: number;
  percentage: number;
  status: 'eligible' | 'shortage';
  isCloseToThreshold: boolean;
  canMissClasses: number;
  neededClassesToAttend: number;
  subjectsNeedingAttention: SubjectStats[];
}

export type ActiveTab = 'dashboard' | 'subjects' | 'calendar' | 'timetable' | 'whatif';
