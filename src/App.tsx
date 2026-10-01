import React, { useState, useEffect } from 'react';
import { 
  Semester, 
  Subject, 
  AttendanceRecord, 
  TimetableSlot, 
  ActiveTab, 
  AttendanceStatus 
} from './types/attendance';
import { 
  loadStoredSemesters, 
  saveSemesters, 
  loadStoredSubjects, 
  saveSubjects, 
  loadStoredAttendanceLogs, 
  saveAttendanceLogs, 
  loadStoredTimetable, 
  saveTimetable,
  exportBackup,
  importBackup,
  clearAllData
} from './utils/storage';
import { 
  DEFAULT_SEMESTERS, 
  DEFAULT_SUBJECTS, 
  DEFAULT_TIMETABLE, 
  DEFAULT_SEMESTER_ID 
} from './utils/defaultData';
import { getOverallStats } from './utils/calculations';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { SubjectsView } from './components/SubjectsView';
import { DailyCalendarView } from './components/DailyCalendarView';
import { TimetableView } from './components/TimetableView';
import { WhatIfCalculatorView } from './components/WhatIfCalculatorView';
import { AddSubjectModal } from './components/AddSubjectModal';
import { EditSubjectModal } from './components/EditSubjectModal';
import { SemesterModal } from './components/SemesterModal';
import { SettingsModal } from './components/SettingsModal';

import { RotateCcw } from 'lucide-react';

export default function App() {
  // Initialize state from localStorage
  const [semesters, setSemesters] = useState<Semester[]>(() => {
    const { semesters } = loadStoredSemesters();
    return semesters;
  });

  const [activeSemesterId, setActiveSemesterId] = useState<string>(() => {
    const { activeId } = loadStoredSemesters();
    return activeId;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => loadStoredSubjects());
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>(() => loadStoredAttendanceLogs());
  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => loadStoredTimetable());

  // Active view tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [whatIfSubjectId, setWhatIfSubjectId] = useState<string | null>(null);

  // Undo Notification
  const [undoToast, setUndoToast] = useState<{
    message: string;
    action: () => void;
  } | null>(null);

  // Sync to local storage
  useEffect(() => {
    saveSemesters(semesters, activeSemesterId);
  }, [semesters, activeSemesterId]);

  useEffect(() => {
    saveSubjects(subjects);
  }, [subjects]);

  useEffect(() => {
    saveAttendanceLogs(attendanceLogs);
  }, [attendanceLogs]);

  useEffect(() => {
    saveTimetable(timetable);
  }, [timetable]);

  // Auto-dismiss undo toast after 5s
  useEffect(() => {
    if (undoToast) {
      const timer = setTimeout(() => {
        setUndoToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [undoToast]);

  // Active semester & subjects
  const activeSemester =
    semesters.find(s => s.id === activeSemesterId) || semesters[0] || null;
  const currentSemesterTarget = activeSemester?.targetPercentage ?? 75;

  const currentSubjects = subjects.filter(s => s.semesterId === activeSemesterId);
  const currentTimetable = timetable.filter(t => t.semesterId === activeSemesterId);
  const currentOverallStats = getOverallStats(currentSubjects, currentSemesterTarget);

  // Format today's date YYYY-MM-DD
  const getTodayISO = () => new Date().toISOString().split('T')[0];

  // ================= Attendance Action Handlers =================

  // Quick mark attendance (e.g. from Dashboard or Subject card)
  const handleMarkAttendance = (subjectId: string, status: 'present' | 'absent') => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    // Save previous state for undo
    const prevAttended = subject.classesAttended;
    const prevHeld = subject.classesHeld;
    const today = getTodayISO();

    const newAttended = status === 'present' ? prevAttended + 1 : prevAttended;
    const newHeld = prevHeld + 1;

    // Update subject
    setSubjects(prev =>
      prev.map(s =>
        s.id === subjectId
          ? {
              ...s,
              classesAttended: newAttended,
              classesHeld: newHeld,
              updatedAt: Date.now(),
            }
          : s
      )
    );

    // Append log record
    const newRecord: AttendanceRecord = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      semesterId: activeSemesterId,
      subjectId,
      date: today,
      status,
      timestamp: Date.now(),
    };

    setAttendanceLogs(prev => [newRecord, ...prev]);

    // Provide Undo Toast
    setUndoToast({
      message: `Marked "${subject.name}" as ${status === 'present' ? 'Present' : 'Absent'}`,
      action: () => {
        // Rollback subject counts
        setSubjects(prev =>
          prev.map(s =>
            s.id === subjectId
              ? { ...s, classesAttended: prevAttended, classesHeld: prevHeld }
              : s
          )
        );
        // Remove log
        setAttendanceLogs(prev => prev.filter(l => l.id !== newRecord.id));
        setUndoToast(null);
      },
    });
  };

  // Set daily attendance from Calendar View
  const handleSetDailyAttendance = (
    subjectId: string,
    date: string,
    newStatus: AttendanceStatus | null
  ) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    // Find existing record for this date
    const existingIndex = attendanceLogs.findIndex(
      l => l.subjectId === subjectId && l.date === date && l.semesterId === activeSemesterId
    );
    const prevStatus: AttendanceStatus | null =
      existingIndex !== -1 ? attendanceLogs[existingIndex].status : null;

    if (prevStatus === newStatus) return;

    let deltaHeld = 0;
    let deltaAttended = 0;

    // Calculate delta on classesHeld and classesAttended
    // 1. Remove previous status impact
    if (prevStatus === 'present') {
      deltaHeld -= 1;
      deltaAttended -= 1;
    } else if (prevStatus === 'absent') {
      deltaHeld -= 1;
    }

    // 2. Add new status impact
    if (newStatus === 'present') {
      deltaHeld += 1;
      deltaAttended += 1;
    } else if (newStatus === 'absent') {
      deltaHeld += 1;
    }

    // Update subject counts safely
    setSubjects(prev =>
      prev.map(s => {
        if (s.id !== subjectId) return s;
        const updatedHeld = Math.max(0, s.classesHeld + deltaHeld);
        const updatedAttended = Math.min(
          updatedHeld,
          Math.max(0, s.classesAttended + deltaAttended)
        );
        return {
          ...s,
          classesHeld: updatedHeld,
          classesAttended: updatedAttended,
          updatedAt: Date.now(),
        };
      })
    );

    // Update attendance logs
    setAttendanceLogs(prev => {
      const updated = [...prev];
      if (newStatus === null) {
        // Remove entry
        if (existingIndex !== -1) {
          updated.splice(existingIndex, 1);
        }
      } else {
        if (existingIndex !== -1) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            status: newStatus,
            timestamp: Date.now(),
          };
        } else {
          updated.unshift({
            id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            semesterId: activeSemesterId,
            subjectId,
            date,
            status: newStatus,
            timestamp: Date.now(),
          });
        }
      }
      return updated;
    });
  };

  // Mark all given subjects as present for a date
  const handleMarkAllPresentForDate = (subjectIds: string[], date: string) => {
    subjectIds.forEach(id => {
      handleSetDailyAttendance(id, date, 'present');
    });
  };

  // ================= Subject CRUD Handlers =================

  const handleAddSubject = (newSubjectData: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...newSubjectData,
      id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      updatedAt: Date.now(),
    };
    setSubjects(prev => [...prev, newSubject]);
  };

  const handleUpdateSubject = (updated: Subject) => {
    setSubjects(prev => prev.map(s => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteSubject = (subjectId: string) => {
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
    setAttendanceLogs(prev => prev.filter(l => l.subjectId !== subjectId));
    setTimetable(prev => prev.filter(t => t.subjectId !== subjectId));
  };

  // ================= Semester Handlers =================

  const handleCreateSemester = (name: string, targetPercentage: number) => {
    const newId = 'sem-' + Date.now();
    const newSem: Semester = {
      id: newId,
      name,
      targetPercentage,
      createdAt: Date.now(),
    };
    setSemesters(prev => [...prev, newSem]);
    setActiveSemesterId(newId);
  };

  const handleUpdateSemester = (updated: Semester) => {
    setSemesters(prev => prev.map(s => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteSemester = (semId: string) => {
    if (semesters.length <= 1) return;
    const remaining = semesters.filter(s => s.id !== semId);
    setSemesters(remaining);
    if (activeSemesterId === semId) {
      setActiveSemesterId(remaining[0].id);
    }
    // Clean up associated data
    setSubjects(prev => prev.filter(s => s.semesterId !== semId));
    setAttendanceLogs(prev => prev.filter(l => l.semesterId !== semId));
    setTimetable(prev => prev.filter(t => t.semesterId !== semId));
  };

  // ================= Timetable Handlers =================

  const handleAddTimetableSlot = (slotData: Omit<TimetableSlot, 'id'>) => {
    const newSlot: TimetableSlot = {
      ...slotData,
      id: 'tt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    };
    setTimetable(prev => [...prev, newSlot]);
  };

  const handleDeleteTimetableSlot = (slotId: string) => {
    setTimetable(prev => prev.filter(t => t.id !== slotId));
  };

  // ================= Backup & Settings Handlers =================

  const handleExportBackup = () => {
    const jsonStr = exportBackup(
      semesters,
      activeSemesterId,
      subjects,
      attendanceLogs,
      timetable
    );
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BunkSafe_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (jsonString: string): boolean => {
    const parsed = importBackup(jsonString);
    if (!parsed) return false;

    setSemesters(parsed.semesters);
    setActiveSemesterId(parsed.activeSemesterId || parsed.semesters[0]?.id || DEFAULT_SEMESTER_ID);
    setSubjects(parsed.subjects);
    setAttendanceLogs(parsed.attendanceLogs || []);
    setTimetable(parsed.timetable || []);
    return true;
  };

  const handleResetToDemo = () => {
    setSemesters(DEFAULT_SEMESTERS);
    setActiveSemesterId(DEFAULT_SEMESTER_ID);
    setSubjects(DEFAULT_SUBJECTS);
    setAttendanceLogs([]);
    setTimetable(DEFAULT_TIMETABLE);
  };

  const handleClearAll = () => {
    clearAllData();
    const freshSem: Semester = {
      id: 'sem-1',
      name: 'Semester 1',
      targetPercentage: 75,
      createdAt: Date.now(),
    };
    setSemesters([freshSem]);
    setActiveSemesterId('sem-1');
    setSubjects([]);
    setAttendanceLogs([]);
    setTimetable([]);
  };

  // Shortcut to switch to What-If for a specific subject
  const handleSelectSubjectForWhatIf = (subjectId: string) => {
    setWhatIfSubjectId(subjectId);
    setActiveTab('whatif');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Application Header */}
      <Header
        semesters={semesters}
        activeSemester={activeSemester}
        onSelectSemester={setActiveSemesterId}
        onOpenSemesterModal={() => setIsSemesterModalOpen(true)}
        onOpenAddSubject={() => setIsAddSubjectOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 pt-4 pb-24">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={currentOverallStats}
            subjects={currentSubjects}
            targetPercentage={currentSemesterTarget}
            timetable={currentTimetable}
            attendanceLogs={attendanceLogs}
            semesterId={activeSemesterId}
            onMarkAttendance={handleMarkAttendance}
            onNavigateTab={setActiveTab}
            onOpenAddSubject={() => setIsAddSubjectOpen(true)}
            onSelectSubjectForWhatIf={handleSelectSubjectForWhatIf}
          />
        )}

        {activeTab === 'subjects' && (
          <SubjectsView
            subjects={currentSubjects}
            semesterTarget={currentSemesterTarget}
            attendanceLogs={attendanceLogs}
            onMarkAttendance={handleMarkAttendance}
            onEditSubject={subj => setEditingSubject(subj)}
            onDeleteSubject={handleDeleteSubject}
            onOpenAddSubject={() => setIsAddSubjectOpen(true)}
            onSelectSubjectForWhatIf={handleSelectSubjectForWhatIf}
          />
        )}

        {activeTab === 'calendar' && (
          <DailyCalendarView
            subjects={currentSubjects}
            attendanceLogs={attendanceLogs}
            timetable={currentTimetable}
            semesterId={activeSemesterId}
            onSetDailyAttendance={handleSetDailyAttendance}
            onMarkAllPresentForDate={handleMarkAllPresentForDate}
          />
        )}

        {activeTab === 'timetable' && (
          <TimetableView
            subjects={currentSubjects}
            timetable={currentTimetable}
            semesterId={activeSemesterId}
            onAddSlot={handleAddTimetableSlot}
            onDeleteSlot={handleDeleteTimetableSlot}
            onOpenAddSubject={() => setIsAddSubjectOpen(true)}
          />
        )}

        {activeTab === 'whatif' && (
          <WhatIfCalculatorView
            subjects={currentSubjects}
            overallStats={currentOverallStats}
            semesterTarget={currentSemesterTarget}
            initialSubjectId={whatIfSubjectId}
          />
        )}
      </main>

      {/* Floating Undo Notification Toast */}
      {undoToast && (
        <div className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto animate-in slide-in-from-bottom duration-200">
          <div className="bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-xs">
            <span className="truncate">{undoToast.message}</span>
            <button
              onClick={undoToast.action}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold flex items-center gap-1 shrink-0 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Undo</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile-Friendly Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={tab => {
          if (tab !== 'whatif') {
            setWhatIfSubjectId(null);
          }
          setActiveTab(tab);
        }}
        subjectsNeedingAttentionCount={currentOverallStats.subjectsNeedingAttention.length}
      />

      {/* Modals */}
      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        semesterId={activeSemesterId}
        onAddSubject={handleAddSubject}
      />

      <EditSubjectModal
        subject={editingSubject}
        isOpen={!!editingSubject}
        onClose={() => setEditingSubject(null)}
        onUpdateSubject={handleUpdateSubject}
        onDeleteSubject={handleDeleteSubject}
      />

      <SemesterModal
        isOpen={isSemesterModalOpen}
        onClose={() => setIsSemesterModalOpen(false)}
        semesters={semesters}
        activeSemesterId={activeSemesterId}
        onSelectSemester={setActiveSemesterId}
        onCreateSemester={handleCreateSemester}
        onUpdateSemester={handleUpdateSemester}
        onDeleteSemester={handleDeleteSemester}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onExportData={handleExportBackup}
        onImportData={handleImportBackup}
        onResetToDemo={handleResetToDemo}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
