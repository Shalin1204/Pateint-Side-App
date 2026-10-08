import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/supabaseMock';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskDetailSheet } from '../components/tasks/TaskDetailSheet';
import { t } from '../i18n/translations';
import { FollowupItem } from '../types';
import { CheckCircle2, AlertCircle, Clock, ShieldAlert } from 'lucide-react';

export const TodayView: React.FC = () => {
  const { patientContext, language, selectedTaskId, setSelectedTaskId } = useAuth();

  // Load items belonging strictly to resolved patient
  const allItems = useMemo(() => {
    return db.getEffectiveItems(patientContext.patientId);
  }, [patientContext.patientId]);

  // Separate active patient-visible items from unresolved review items
  const reviewCount = useMemo(() => {
    // Only count unresolved items currently undergoing doctor review
    return allItems.filter((i) => i.effective_status === 'needs_review').length;
  }, [allItems]);

  // Filter out non-patient-visible / review items
  const visibleItems = useMemo(() => {
    return allItems.filter((i) => i.effective_status !== 'needs_review');
  }, [allItems]);

  // Calculate today's progress
  const todayItems = useMemo(() => {
    return visibleItems.filter((i) => i.section === 'DUE TODAY' || i.section === 'DAILY CARE');
  }, [visibleItems]);

  const completedTodayCount = useMemo(() => {
    return todayItems.filter((i) => i.effective_status === 'completed').length;
  }, [todayItems]);

  // Group by sections: OVERDUE, DUE TODAY, NEXT UP, DAILY CARE
  const overdueItems = useMemo(() => {
    return visibleItems.filter((i) => i.section === 'OVERDUE' || i.effective_status === 'overdue');
  }, [visibleItems]);

  const dueTodayItems = useMemo(() => {
    return visibleItems.filter(
      (i) => i.section === 'DUE TODAY' && i.effective_status !== 'overdue'
    );
  }, [visibleItems]);

  const nextUpItems = useMemo(() => {
    return visibleItems.filter((i) => i.section === 'NEXT UP' && i.effective_status !== 'overdue');
  }, [visibleItems]);

  const dailyCareItems = useMemo(() => {
    return visibleItems.filter((i) => i.section === 'DAILY CARE' && i.effective_status !== 'overdue');
  }, [visibleItems]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t(language, 'good_morning');
    if (hour < 17) return t(language, 'good_afternoon');
    return t(language, 'good_evening');
  };

  const patientFirstName = patientContext.patientName.split(' ')[0];

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-200">
      {/* Header Greeting & Progress Card */}
      <div className="rounded-3xl bg-gradient-to-br from-teal-900/60 to-slate-900 border border-teal-800/40 p-5 shadow-sm text-white">
        <span className="text-xs font-semibold text-teal-400 tracking-wide uppercase">
          {patientContext.role === 'caregiver' ? 'Caregiver Dashboard' : 'Daily Discharge Care'}
        </span>
        <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">
          {getGreeting()}, {patientFirstName}
        </h1>

        {/* Progress Display */}
        <div className="mt-4 pt-3 border-t border-teal-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 font-bold text-xs">
              {completedTodayCount}
            </div>
            <div>
              <div className="text-xs font-semibold text-white">
                {t(language, 'progress_done', {
                  completed: completedTodayCount,
                  total: todayItems.length,
                })}
              </div>
              <div className="text-[11px] text-teal-300/80">Scheduled today</div>
            </div>
          </div>

          {/* Micro Progress Bar */}
          <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/60">
            <div
              className="bg-teal-400 h-full rounded-full transition-all duration-300"
              style={{
                width: `${todayItems.length > 0 ? (completedTodayCount / todayItems.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Review Banner: Only show count, never expose unresolved review content */}
      {reviewCount > 0 && (
        <div className="rounded-2xl bg-blue-950/60 border border-blue-800/50 p-3.5 flex items-center gap-3 text-blue-200">
          <div className="w-8 h-8 rounded-xl bg-blue-900/70 flex items-center justify-center text-blue-300 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-xs font-medium leading-relaxed">
            {t(language, 'review_banner', { count: reviewCount })}
          </div>
        </div>
      )}

      {/* OVERDUE Section */}
      {overdueItems.length > 0 && (
        <section aria-label="Overdue items" className="space-y-2.5">
          <div className="flex items-center gap-2 px-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {t(language, 'overdue_section')}
            </h2>
            <span className="text-[11px] text-slate-400">({overdueItems.length})</span>
          </div>
          <div className="space-y-2.5">
            {overdueItems.map((item) => (
              <TaskCard
                key={item.id}
                item={item}
                onOpenDetails={(i) => setSelectedTaskId(i.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* DUE TODAY Section */}
      {dueTodayItems.length > 0 && (
        <section aria-label="Due today items" className="space-y-2.5">
          <div className="flex items-center gap-2 px-1">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-300">
              {t(language, 'due_today_section')}
            </h2>
            <span className="text-[11px] text-slate-400">({dueTodayItems.length})</span>
          </div>
          <div className="space-y-2.5">
            {dueTodayItems.map((item) => (
              <TaskCard
                key={item.id}
                item={item}
                onOpenDetails={(i) => setSelectedTaskId(i.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* NEXT UP Section */}
      {nextUpItems.length > 0 && (
        <section aria-label="Upcoming appointments and tests" className="space-y-2.5">
          <div className="flex items-center gap-2 px-1">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-300">
              {t(language, 'next_up_section')}
            </h2>
            <span className="text-[11px] text-slate-400">({nextUpItems.length})</span>
          </div>
          <div className="space-y-2.5">
            {nextUpItems.map((item) => (
              <TaskCard
                key={item.id}
                item={item}
                onOpenDetails={(i) => setSelectedTaskId(i.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* DAILY CARE Section */}
      {dailyCareItems.length > 0 && (
        <section aria-label="Daily care routine items" className="space-y-2.5">
          <div className="flex items-center gap-2 px-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              {t(language, 'daily_care_section')}
            </h2>
            <span className="text-[11px] text-slate-400">({dailyCareItems.length})</span>
          </div>
          <div className="space-y-2.5">
            {dailyCareItems.map((item) => (
              <TaskCard
                key={item.id}
                item={item}
                onOpenDetails={(i) => setSelectedTaskId(i.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Task Detail Bottom Sheet */}
      <TaskDetailSheet
        itemId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
};
