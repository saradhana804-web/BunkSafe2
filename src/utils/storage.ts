import { Semester, Subject, AttendanceRecord, TimetableSlot } from '../types/attendance';
import { DEFAULT_SEMESTERS, DEFAULT_SUBJECTS, DEFAULT_TIMETABLE, DEFAULT_SEMESTER_ID, getInitialWeeklyLogs } from './defaultData';

const STORAGE_KEYS = {
  SEMESTERS: 'bunksafe_semesters_v1',
  ACTIVE_SEMESTER_ID: 'bunksafe_active_sem_id_v1',
  SUBJECTS: 'bunksafe_subjects_v1',
  ATTENDANCE_LOGS: 'bunksafe_attendance_logs_v1',
  TIMETABLE: 'bunksafe_timetable_v1',
};

export interface AppDataBackup {
  semesters: Semester[];
  activeSemesterId: string;
  subjects: Subject[];
  attendanceLogs: AttendanceRecord[];
  timetable: TimetableSlot[];
  version: string;
  exportedAt: string;
}

export function loadStoredSemesters(): { semesters: Semester[]; activeId: string } {
  try {
    const rawSemesters = localStorage.getItem(STORAGE_KEYS.SEMESTERS);
    const rawActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_SEMESTER_ID);

    let semesters: Semester[] = DEFAULT_SEMESTERS;
    if (rawSemesters) {
      const parsed = JSON.parse(rawSemesters);
      if (Array.isArray(parsed) && parsed.length > 0) {
        semesters = parsed;
      }
    }

    let activeId = rawActiveId || DEFAULT_SEMESTER_ID;
    if (!semesters.some(s => s.id === activeId)) {
      activeId = semesters[0].id;
    }

    return { semesters, activeId };
  } catch (e) {
    console.error('Failed to load semesters:', e);
    return { semesters: DEFAULT_SEMESTERS, activeId: DEFAULT_SEMESTER_ID };
  }
}

export function saveSemesters(semesters: Semester[], activeId?: string) {
  try {
    localStorage.setItem(STORAGE_KEYS.SEMESTERS, JSON.stringify(semesters));
    if (activeId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SEMESTER_ID, activeId);
    }
  } catch (e) {
    console.error('Failed to save semesters:', e);
  }
}

export function loadStoredSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    return DEFAULT_SUBJECTS;
  } catch (e) {
    console.error('Failed to load subjects:', e);
    return DEFAULT_SUBJECTS;
  }
}

export function saveSubjects(subjects: Subject[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch (e) {
    console.error('Failed to save subjects:', e);
  }
}

export function loadStoredAttendanceLogs(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE_LOGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    return getInitialWeeklyLogs();
  } catch (e) {
    console.error('Failed to load attendance logs:', e);
    return getInitialWeeklyLogs();
  }
}

export function saveAttendanceLogs(logs: AttendanceRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save attendance logs:', e);
  }
}

export function loadStoredTimetable(): TimetableSlot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TIMETABLE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    return DEFAULT_TIMETABLE;
  } catch (e) {
    console.error('Failed to load timetable:', e);
    return DEFAULT_TIMETABLE;
  }
}

export function saveTimetable(timetable: TimetableSlot[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetable));
  } catch (e) {
    console.error('Failed to save timetable:', e);
  }
}

export function exportBackup(
  semesters: Semester[],
  activeSemesterId: string,
  subjects: Subject[],
  attendanceLogs: AttendanceRecord[],
  timetable: TimetableSlot[]
): string {
  const backup: AppDataBackup = {
    semesters,
    activeSemesterId,
    subjects,
    attendanceLogs,
    timetable,
    version: '1.0',
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importBackup(jsonString: string): AppDataBackup | null {
  try {
    const data = JSON.parse(jsonString) as AppDataBackup;
    if (Array.isArray(data.semesters) && Array.isArray(data.subjects)) {
      return data;
    }
    return null;
  } catch (e) {
    console.error('Failed to parse backup JSON:', e);
    return null;
  }
}

export function clearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEYS.SEMESTERS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SEMESTER_ID);
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE_LOGS);
    localStorage.removeItem(STORAGE_KEYS.TIMETABLE);
  } catch (e) {
    console.error('Failed to clear data:', e);
  }
}
