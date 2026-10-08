import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/supabaseMock';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskDetailSheet } from '../components/tasks/TaskDetailSheet';
import { t } from '../i18n/translations';
import { ItemCategory, FollowupItem } from '../types';
import { Calendar, Filter, Clock, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';

export const PlanView: React.FC = () => {
  const { patientContext, language, selectedTaskId, setSelectedTaskId } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState<'all' | ItemCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');

  const allItems = useMemo(() => {
    return db.getEffectiveItems(patientContext.patientId);
  }, [patientContext.patientId]);

  // Exclude non-patient visible items
  const visibleItems = useMemo(() => {
    return allItems.filter((i) => i.effective_status !== 'needs_review');
  }, [allItems]);

  // Apply filters
  const filteredItems = useMemo(() => {
    return visibleItems.filter((i) => {
      if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && i.effective_status !== statusFilter) return false;
      return true;
    });
  }, [visibleItems, categoryFilter, statusFilter]);

  // Discharge Recovery Timeline Phases:
  // 1. Discharge Day (04 - 05 Oct 2026)
  // 2. Week 1 Recovery (06 - 11 Oct 2026)
  // 3. Week 2 Follow-up (12 - 18 Oct 2026)
  // 4. Month 1 Stabilization (19 Oct onwards / Ongoing)
  const dischargeDayItems = useMemo(() => {
    return filteredItems.filter((i) => i.due_date && i.due_date <= '2026-10-05');
  }, [filteredItems]);

  const week1Items = useMemo(() => {
    return filteredItems.filter(
      (i) => i.due_date && i.due_date >= '2026-10-06' && i.due_date <= '2026-10-11'
    );
  }, [filteredItems]);

  const week2Items = useMemo(() => {
    return filteredItems.filter(
      (i) => i.due_date && i.due_date >= '2026-10-12' && i.due_date <= '2026-10-18'
    );
  }, [filteredItems]);

  const month1Items = useMemo(() => {
    return filteredItems.filter((i) => !i.due_date || i.due_date > '2026-10-18' || i.due_date === 'ongoing');
  }, [filteredItems]);

  const phases = [
    {
      id: 'phase_1',
      title: 'DISCHARGE DAY',
      dates: '04 – 05 Oct 2026',
      badge: 'Hospital Exit & Wound Rest',
      items: dischargeDayItems,
    },
    {
      id: 'phase_2',
      title: 'WEEK 1 RECOVERY',
      dates: '06 – 11 Oct 2026 (Active Phase)',
      badge: 'Vitals, Blood Test & Puncture Inspection',
      items: week1Items,
      active: true,
    },
    {
      id: 'phase_3',
      title: 'WEEK 2 FOLLOW-UP',
      dates: '12 – 18 Oct 2026',
      badge: 'Cardiology Review, 12-Lead ECG & Echo',
      items: week2Items,
    },
    {
      id: 'phase_4',
      title: 'MONTH 1 STABILIZATION',
      dates: '19 Oct – 04 Nov 2026',
      badge: 'Cardiac Rehab & Long-term Lifestyle',
      items: month1Items,
    },
  ];

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      {/* Header and Filter Tabs */}
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight">Discharge Recovery Timeline</h1>
        <p className="text-xs text-teal-300/80">Structured post-discharge clinical phases</p>
      </div>

      {/* Category Segmented Filter Controls */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`min-h-[40px] px-3.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              categoryFilter === 'all'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t(language, 'filters_all')}
          </button>
          <button
            onClick={() => setCategoryFilter('appointment')}
            className={`min-h-[40px] px-3.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              categoryFilter === 'appointment'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t(language, 'filters_appointments')}
          </button>
          <button
            onClick={() => setCategoryFilter('test')}
            className={`min-h-[40px] px-3.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              categoryFilter === 'test'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t(language, 'filters_tests')}
          </button>
          <button
            onClick={() => setCategoryFilter('care')}
            className={`min-h-[40px] px-3.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              categoryFilter === 'care'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t(language, 'filters_care')}
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-0.5">
          {[
            { id: 'all', label: 'All Statuses' },
            { id: 'pending', label: 'Pending' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'completed', label: 'Completed' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id as typeof statusFilter)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition whitespace-nowrap ${
                statusFilter === st.id
                  ? 'bg-teal-950/80 border-teal-600 text-teal-200 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recovery Timeline Flow */}
      <div className="space-y-6 pt-2 relative">
        {/* Timeline connector track */}
        <div className="absolute left-4 top-4 bottom-8 w-0.5 bg-slate-800/80 pointer-events-none" />

        {phases.map((phase, idx) => (
          <div key={phase.id} className="relative pl-10 space-y-2.5">
            {/* Step Node */}
            <div
              className={`absolute left-2.5 -translate-x-1/2 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                phase.active
                  ? 'bg-teal-500 border-white ring-4 ring-teal-500/20'
                  : 'bg-slate-900 border-slate-700'
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
            </div>

            {/* Phase Header */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  {phase.title}
                </h2>
                {phase.active && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 text-[10px] font-bold">
                    Current Phase
                  </span>
                )}
              </div>
              <div className="text-[11px] text-teal-300/80 mt-0.5">{phase.dates}</div>
              <div className="text-[11px] text-slate-400 italic mt-0.5">{phase.badge}</div>
            </div>

            {/* Items inside Phase */}
            <div className="space-y-2.5 pt-1">
              {phase.items.length === 0 ? (
                <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-[11px] text-slate-500 italic">
                  No items scheduled under selected filters.
                </div>
              ) : (
                phase.items.map((item) => (
                  <TaskCard
                    key={item.id}
                    item={item}
                    onOpenDetails={(i) => setSelectedTaskId(i.id)}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Detail Bottom Sheet */}
      <TaskDetailSheet
        itemId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
};
