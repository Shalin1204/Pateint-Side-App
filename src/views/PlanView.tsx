import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskDetailSheet } from '../components/tasks/TaskDetailSheet';
import { t } from '../i18n/translations';
import { ItemCategory, FollowupItem } from '../types';

export const PlanView: React.FC = () => {
  const { patientContext, language, selectedTaskId, setSelectedTaskId, theme } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState<'all' | ItemCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [allItems, setAllItems] = useState<FollowupItem[]>([]);
  const isLight = theme === 'light';

  useEffect(() => {
    let isMounted = true;
    dataService.getEffectiveItems(patientContext.patientId).then((items) => {
      if (isMounted) setAllItems(items);
    });
    return () => {
      isMounted = false;
    };
  }, [patientContext.patientId]);
  const visibleItems = useMemo(() => allItems.filter((i) => i.effective_status !== 'needs_review'), [allItems]);

  const filteredItems = useMemo(() =>
    visibleItems.filter((i) => {
      if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && i.effective_status !== statusFilter) return false;
      return true;
    }),
    [visibleItems, categoryFilter, statusFilter]
  );

  const phases = [
    { id: 'phase_1', title: 'DISCHARGE DAY',         dates: '04 – 05 Oct 2026',         badge: 'Hospital Exit & Wound Rest',               items: filteredItems.filter((i) => i.due_date && i.due_date <= '2026-10-05') },
    { id: 'phase_2', title: 'WEEK 1 RECOVERY',       dates: '06 – 11 Oct 2026 (Active Phase)', badge: 'Vitals, Blood Test & Puncture Inspection', items: filteredItems.filter((i) => i.due_date && i.due_date >= '2026-10-06' && i.due_date <= '2026-10-11'), active: true },
    { id: 'phase_3', title: 'WEEK 2 FOLLOW-UP',      dates: '12 – 18 Oct 2026',         badge: 'Cardiology Review, 12-Lead ECG & Echo',    items: filteredItems.filter((i) => i.due_date && i.due_date >= '2026-10-12' && i.due_date <= '2026-10-18') },
    { id: 'phase_4', title: 'MONTH 1 STABILIZATION', dates: '19 Oct – 04 Nov 2026',     badge: 'Cardiac Rehab & Long-term Lifestyle',      items: filteredItems.filter((i) => !i.due_date || i.due_date > '2026-10-18' || i.due_date === 'ongoing') },
  ];

  /* ── style helpers ── */
  const tabs = {
    wrap: isLight
      ? { backgroundColor: '#EAF4FA', border: '1px solid #C5DCE8' }
      : { backgroundColor: '#0f172a', border: '1px solid rgba(30,41,59,1)' },
    active: isLight
      ? { backgroundColor: '#00AFA3', color: '#ffffff' }
      : { backgroundColor: '#0d9488', color: '#ffffff' },
    inactive: isLight
      ? { color: '#587084' }
      : { color: '#64748b' },
    statusActive: isLight
      ? { backgroundColor: 'rgba(0,175,163,0.12)', border: '1px solid #00AFA3', color: '#007A73', fontWeight: '700' }
      : { backgroundColor: 'rgba(19,78,74,0.8)', border: '1px solid #0d9488', color: '#5eead4', fontWeight: '700' },
    statusInactive: isLight
      ? { backgroundColor: '#EAF4FA', border: '1px solid #C5DCE8', color: '#587084' }
      : { backgroundColor: '#0f172a', border: '1px solid rgba(30,41,59,1)', color: '#64748b' },
  };

  const timelineTrack = isLight ? '#C5DCE8' : 'rgba(30,41,59,0.8)';

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold tracking-tight" style={isLight ? { color: '#18324A' } : { color: '#ffffff' }}>
          Discharge Recovery Timeline
        </h1>
        <p className="text-xs" style={isLight ? { color: '#007A73' } : { color: 'rgba(94,234,212,0.8)' }}>
          Structured post-discharge clinical phases
        </p>
      </div>

      {/* Filter controls */}
      <div className="space-y-2">
        {/* Category tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl overflow-x-auto no-scrollbar" style={tabs.wrap}>
          {[
            { id: 'all', key: 'filters_all' },
            { id: 'appointment', key: 'filters_appointments' },
            { id: 'test', key: 'filters_tests' },
            { id: 'care', key: 'filters_care' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setCategoryFilter(f.id as typeof categoryFilter)}
              className="min-h-[40px] px-3.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition"
              style={categoryFilter === f.id ? tabs.active : tabs.inactive}
            >
              {t(language, f.key)}
            </button>
          ))}
        </div>

        {/* Status pills */}
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
              className="text-[11px] px-2.5 py-1 rounded-lg transition whitespace-nowrap"
              style={statusFilter === st.id ? tabs.statusActive : tabs.statusInactive}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6 pt-2 relative">
        <div className="absolute left-4 top-4 bottom-8 w-0.5 pointer-events-none" style={{ backgroundColor: timelineTrack }} />

        {phases.map((phase) => (
          <div key={phase.id} className="relative pl-10 space-y-2.5">
            {/* Step node */}
            <div
              className="absolute left-2.5 -translate-x-1/2 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center"
              style={phase.active
                ? { backgroundColor: '#00AFA3', borderColor: isLight ? '#ffffff' : '#ffffff', boxShadow: '0 0 0 4px rgba(0,175,163,0.2)' }
                : { backgroundColor: isLight ? '#EAF4FA' : '#0f172a', borderColor: isLight ? '#C5DCE8' : '#334155' }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isLight ? (phase.active ? '#ffffff' : '#C5DCE8') : '#020817' }} />
            </div>

            {/* Phase header */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider" style={isLight ? { color: '#18324A' } : { color: '#ffffff' }}>
                  {phase.title}
                </h2>
                {phase.active && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={isLight
                      ? { backgroundColor: 'rgba(0,175,163,0.12)', border: '1px solid #00AFA3', color: '#007A73' }
                      : { backgroundColor: 'rgba(20,184,166,0.15)', border: '1px solid rgba(45,212,191,0.4)', color: '#5eead4' }}
                  >
                    Current Phase
                  </span>
                )}
              </div>
              <div className="text-[11px] mt-0.5" style={isLight ? { color: '#007A73' } : { color: 'rgba(94,234,212,0.8)' }}>
                {phase.dates}
              </div>
              <div className="text-[11px] italic mt-0.5" style={isLight ? { color: '#587084' } : { color: '#64748b' }}>
                {phase.badge}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2.5 pt-1">
              {phase.items.length === 0 ? (
                <div
                  className="p-3 rounded-2xl text-[11px] italic"
                  style={isLight
                    ? { backgroundColor: '#F0F8FD', border: '1px solid #C5DCE8', color: '#7A9AAD' }
                    : { backgroundColor: 'rgba(15,23,42,0.4)', border: '1px solid rgba(30,41,59,0.6)', color: '#475569' }}
                >
                  No items scheduled under selected filters.
                </div>
              ) : (
                phase.items.map((item) => (
                  <TaskCard key={item.id} item={item} onOpenDetails={(i) => setSelectedTaskId(i.id)} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <TaskDetailSheet itemId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
    </div>
  );
};
