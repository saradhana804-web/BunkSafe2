import { Semester, Subject, TimetableSlot } from '../types/attendance';

export const DEFAULT_SEMESTER_ID = 'sem-current';

export const DEFAULT_SEMESTERS: Semester[] = [
  {
    id: DEFAULT_SEMESTER_ID,
    name: 'Semester 5 (Fall 2026)',
    targetPercentage: 75,
    startDate: '2026-08-01',
    endDate: '2026-12-15',
    createdAt: Date.now() - 30 * 24 * 3600 * 1000,
  },
  {
    id: 'sem-prev',
    name: 'Semester 4 (Spring 2026)',
    targetPercentage: 75,
    startDate: '2026-01-10',
    endDate: '2026-05-20',
    createdAt: Date.now() - 120 * 24 * 3600 * 1000,
  },
];

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sub-math',
    semesterId: DEFAULT_SEMESTER_ID,
    name: 'Mathematics',
    code: 'MATH-301',
    color: '#3b82f6', // blue
    classesHeld: 24,
    classesAttended: 20, // 83.3% - Eligible, can miss 2
  },
  {
    id: 'sub-physics',
    semesterId: DEFAULT_SEMESTER_ID,
    name: 'Physics',
    code: 'PHY-202',
    color: '#8b5cf6', // purple
    classesHeld: 20,
    classesAttended: 14, // 70.0% - Shortage! Needs 4
  },
  {
    id: 'sub-ee',
    semesterId: DEFAULT_SEMESTER_ID,
    name: 'Electrical Engineering',
    code: 'EE-210',
    color: '#f59e0b', // amber
    classesHeld: 22,
    classesAttended: 17, // 77.3% - Warning close, can miss 0
  },
  {
    id: 'sub-ed',
    semesterId: DEFAULT_SEMESTER_ID,
    name: 'Engineering Drawing',
    code: 'ED-104',
    color: '#10b981', // emerald
    classesHeld: 16,
    classesAttended: 15, // 93.8% - Very safe, can miss 4
  },
  {
    id: 'sub-cs',
    semesterId: DEFAULT_SEMESTER_ID,
    name: 'Computer Networks',
    code: 'CS-304',
    color: '#06b6d4', // cyan
    classesHeld: 18,
    classesAttended: 14, // 77.8% - can miss 0
  },
];

export const DEFAULT_TIMETABLE: TimetableSlot[] = [
  // Monday
  { id: 'tt-1', semesterId: DEFAULT_SEMESTER_ID, day: 'mon', subjectId: 'sub-math', startTime: '09:00', endTime: '10:00', room: 'Hall A' },
  { id: 'tt-2', semesterId: DEFAULT_SEMESTER_ID, day: 'mon', subjectId: 'sub-physics', startTime: '10:15', endTime: '11:15', room: 'Lab 2' },
  { id: 'tt-3', semesterId: DEFAULT_SEMESTER_ID, day: 'mon', subjectId: 'sub-ee', startTime: '11:30', endTime: '12:30', room: 'Room 302' },

  // Tuesday
  { id: 'tt-4', semesterId: DEFAULT_SEMESTER_ID, day: 'tue', subjectId: 'sub-ed', startTime: '09:30', endTime: '12:00', room: 'Studio 1' },
  { id: 'tt-5', semesterId: DEFAULT_SEMESTER_ID, day: 'tue', subjectId: 'sub-cs', startTime: '13:00', endTime: '14:30', room: 'Lab 4' },

  // Wednesday
  { id: 'tt-6', semesterId: DEFAULT_SEMESTER_ID, day: 'wed', subjectId: 'sub-math', startTime: '09:00', endTime: '10:00', room: 'Hall A' },
  { id: 'tt-7', semesterId: DEFAULT_SEMESTER_ID, day: 'wed', subjectId: 'sub-ee', startTime: '10:15', endTime: '11:15', room: 'Room 302' },
  { id: 'tt-8', semesterId: DEFAULT_SEMESTER_ID, day: 'wed', subjectId: 'sub-physics', startTime: '11:30', endTime: '12:30', room: 'Hall B' },

  // Thursday
  { id: 'tt-9', semesterId: DEFAULT_SEMESTER_ID, day: 'thu', subjectId: 'sub-cs', startTime: '10:00', endTime: '11:30', room: 'Lab 4' },
  { id: 'tt-10', semesterId: DEFAULT_SEMESTER_ID, day: 'thu', subjectId: 'sub-math', startTime: '12:00', endTime: '13:00', room: 'Hall A' },

  // Friday
  { id: 'tt-11', semesterId: DEFAULT_SEMESTER_ID, day: 'fri', subjectId: 'sub-physics', startTime: '09:00', endTime: '11:00', room: 'Lab 2' },
  { id: 'tt-12', semesterId: DEFAULT_SEMESTER_ID, day: 'fri', subjectId: 'sub-ed', startTime: '11:30', endTime: '13:00', room: 'Studio 1' },
  { id: 'tt-13', semesterId: DEFAULT_SEMESTER_ID, day: 'fri', subjectId: 'sub-ee', startTime: '14:00', endTime: '15:00', room: 'Room 302' },
];

export function getInitialWeeklyLogs(): import('../types/attendance').AttendanceRecord[] {
  // Generate sample logs for current week so dashboard weekly summary is immediately active
  const now = new Date();
  const currentDay = now.getDay();
  const distToMon = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + distToMon);

  const formatDate = (offset: number) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + offset);
    return d.toISOString().split('T')[0];
  };

  const monStr = formatDate(0);
  const tueStr = formatDate(1);
  const wedStr = formatDate(2);

  return [
    // Monday
    { id: 'init-1', semesterId: DEFAULT_SEMESTER_ID, subjectId: 'sub-math', date: monStr, status: 'present', timestamp: Date.now() - 2 * 86400000 },
    { id: 'init-2', semesterId: DEFAULT_SEMESTER_ID, subjectId: 'sub-physics', date: monStr, status: 'absent', timestamp: Date.now() - 2 * 86400000 },
    { id: 'init-3', semesterId: DEFAULT_SEMESTER_ID, subjectId: 'sub-ee', date: monStr, status: 'present', timestamp: Date.now() - 2 * 86400000 },
    // Tuesday
    { id: 'init-4', semesterId: DEFAULT_SEMESTER_ID, subjectId: 'sub-ed', date: tueStr, status: 'present', timestamp: Date.now() - 86400000 },
    { id: 'init-5', semesterId: DEFAULT_SEMESTER_ID, subjectId: 'sub-cs', date: tueStr, status: 'present', timestamp: Date.now() - 86400000 },
    // Wednesday (Today)
    { id: 'init-6', semesterId: DEFAULT_SEMESTER_ID, subjectId: 'sub-math', date: wedStr, status: 'present', timestamp: Date.now() },
    { id: 'init-7', semesterId: DEFAULT_SEMESTER_ID, subjectId: 'sub-ee', date: wedStr, status: 'present', timestamp: Date.now() },
  ];
}

