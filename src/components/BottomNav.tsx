import React from 'react';
import { ActiveTab } from '../types/attendance';
import { LayoutDashboard, BookOpen, CalendarDays, CalendarClock, Calculator } from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  subjectsNeedingAttentionCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  subjectsNeedingAttentionCount,
}) => {
  const tabs = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: subjectsNeedingAttentionCount > 0 ? subjectsNeedingAttentionCount : null,
    },
    {
      id: 'subjects' as ActiveTab,
      label: 'Subjects',
      icon: BookOpen,
      badge: null,
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'Daily Log',
      icon: CalendarDays,
      badge: null,
    },
    {
      id: 'timetable' as ActiveTab,
      label: 'Timetable',
      icon: CalendarClock,
      badge: null,
    },
    {
      id: 'whatif' as ActiveTab,
      label: 'What-If',
      icon: Calculator,
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1 safe-area-pb">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative min-h-[50px] touch-manipulation ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.3]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center px-1 ring-2 ring-slate-950">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight truncate max-w-[64px]">
                {tab.label}
              </span>
              {isActive && (
                <div className="w-4 h-0.5 bg-emerald-400 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
