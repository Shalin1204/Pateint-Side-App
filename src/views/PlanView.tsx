import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/supabaseMock';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskDetailSheet } from '../components/tasks/TaskDetailSheet';
import { t } from '../i18n/translations';
import { ItemCategory, FollowupItem } from '../types';
import { Calendar, Filter, Clock } from 'lucide-react';

export const PlanView: React.FC = () => {
  const { patientContext, language, selectedTaskId, setSelectedTaskId } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState<'all' | ItemCategory>('all');

  const allItems = useMemo(() => {
    return db.getEffectiveItems(patientContext.patientId);
  }, [patientContext.patientId]);

  // Exclude non-patient visible items
  const visibleItems = useMemo(() => {
    return allItems.filter((i) => i.effective_status !== 'needs_review');
  }, [allItems]);

  // Apply category filter
  const filteredItems = useMemo(() => {
    if (categoryFilter === 'all') return visibleItems;
    return visibleItems.filter((i) => i.category === categoryFilter);
  }, [visibleItems, categoryFilter]);

  // Vertical timeline groups:
  // 1. Overdue / Missed at top
  // 2. Today (2026-10-08)
  // 3. Tomorrow (2026-10-09)
  // 4. Future dates
  // 5. Undated: Ongoing care
  const overdueGroup = useMemo(() => {
    return filteredItems.filter(
      (i) => i.effective_status === 'overdue' || i.effective_status === 'missed'
    );
  }, [filteredItems]);

  const todayGroup = useMemo(() => {
    return filteredItems.filter(
      (i) =>
        i.due_date === '2026-10-08' &&
        i.effective_status !== 'overdue' &&
        i.effective_status !== 'missed'
    );
  }, [filteredItems]);

  const tomorrowGroup = useMemo(() => {
    return filteredItems.filter(
      (i) =>
        i.due_date === '2026-10-09' &&
        i.effective_status !== 'overdue' &&
        i.effective_status !== 'missed'
    );
  }, [filteredItems]);

  const futureGroup = useMemo(() => {
    return filteredItems.filter(
      (i) =>
        i.due_date > '2026-10-09' &&
        i.effective_status !== 'overdue' &&
        i.effective_status !== 'missed'
    );
  }, [filteredItems]);

  const undatedGroup = useMemo(() => {
    return filteredItems.filter((i) => !i.due_date || i.due_date === 'ongoing');
  }, [filteredItems]);

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      {/* Header and Filter Tabs */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Care Plan Timeline</h1>
          <p className="text-xs text-teal-300/80">Scheduled follow-up and clinical actions</p>
        </div>
      </div>

      {/* Interactive Category Segmented Filter Controls */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            categoryFilter === 'all'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t(language, 'filters_all')}
        </button>
        <button
          onClick={() => setCategoryFilter('appointment')}
          className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            categoryFilter === 'appointment'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t(language, 'filters_appointments')}
        </button>
        <button
          onClick={() => setCategoryFilter('test')}
          className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            categoryFilter === 'test'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t(language, 'filters_tests')}
        </button>
        <button
          onClick={() => setCategoryFilter('care')}
          className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            categoryFilter === 'care'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t(language, 'filters_care')}
        </button>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-6 pt-2">
        {/* 1. Overdue Group at Top */}
        {overdueGroup.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider px-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Overdue Actions</span>
            </div>
            <div className="space-y-2.5">
              {overdueGroup.map((item) => (
                <TaskCard
                  key={item.id}
                  item={item}
                  onOpenDetails={(i) => setSelectedTaskId(i.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 2. Today Group */}
        {todayGroup.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-300 uppercase tracking-wider px-1">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span>{t(language, 'today')} (08 Oct)</span>
            </div>
            <div className="space-y-2.5">
              {todayGroup.map((item) => (
                <TaskCard
                  key={item.id}
                  item={item}
                  onOpenDetails={(i) => setSelectedTaskId(i.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 3. Tomorrow Group */}
        {tomorrowGroup.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>{t(language, 'tomorrow')} (09 Oct)</span>
            </div>
            <div className="space-y-2.5">
              {tomorrowGroup.map((item) => (
                <TaskCard
                  key={item.id}
                  item={item}
                  onOpenDetails={(i) => setSelectedTaskId(i.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 4. Future Dates */}
        {futureGroup.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider px-1">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Upcoming Dates (15 Oct)</span>
            </div>
            <div className="space-y-2.5">
              {futureGroup.map((item) => (
                <TaskCard
                  key={item.id}
                  item={item}
                  onOpenDetails={(i) => setSelectedTaskId(i.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 5. Undated Ongoing Care */}
        {undatedGroup.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span>{t(language, 'ongoing_care')}</span>
            </div>
            <div className="space-y-2.5">
              {undatedGroup.map((item) => (
                <TaskCard
                  key={item.id}
                  item={item}
                  onOpenDetails={(i) => setSelectedTaskId(i.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task Detail Bottom Sheet */}
      <TaskDetailSheet
        itemId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
};
