import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/supabaseMock';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskDetailSheet } from '../components/tasks/TaskDetailSheet';
import { CoordinationCard } from '../components/common/CoordinationCard';
import { CreateCoordinationModal } from '../components/common/CreateCoordinationModal';
import { t } from '../i18n/translations';
import { CoordinationCardStatus, FollowupItem } from '../types';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Pill,
  Bell,
  Wifi,
  WifiOff,
  ChevronRight,
  ArrowRight,
  PlusCircle,
  ShieldAlert,
  Activity,
  HeartPulse,
} from 'lucide-react';

export const TodayView: React.FC = () => {
  const {
    patientContext,
    language,
    selectedTaskId,
    setSelectedTaskId,
    setActiveSubRoute,
    setActiveTab,
    isOnline,
    refreshData,
  } = useAuth();

  const [showCoordinationModal, setShowCoordinationModal] = useState(false);

  // Load items belonging strictly to resolved patient
  const allItems = useMemo(() => {
    return db.getEffectiveItems(patientContext.patientId);
  }, [patientContext.patientId]);

  // Medications & Adherence
  const medications = useMemo(() => {
    return db.getMedications(patientContext.patientId);
  }, [patientContext.patientId]);

  const adherenceLogs = useMemo(() => {
    return db.getAdherenceLogs(patientContext.patientId, '2026-10-08');
  }, [patientContext.patientId]);

  const takenMedsCount = useMemo(() => {
    return adherenceLogs.filter((l) => l.status === 'taken').length;
  }, [adherenceLogs]);

  // Reminders count
  const reminders = useMemo(() => {
    return db.getReminders(patientContext.patientId).filter((r) => !r.is_past);
  }, [patientContext.patientId]);

  // Coordination Cards
  const coordinationCards = useMemo(() => {
    return db.getCoordinationCards(patientContext.patientId);
  }, [patientContext.patientId]);

  // Separate active patient-visible items from unresolved review items
  const reviewCount = useMemo(() => {
    return allItems.filter((i) => i.effective_status === 'needs_review').length;
  }, [allItems]);

  const visibleItems = useMemo(() => {
    return allItems.filter((i) => i.effective_status !== 'needs_review');
  }, [allItems]);

  // Items due today
  const dueTodayItems = useMemo(() => {
    return visibleItems.filter(
      (i) => (i.section === 'DUE TODAY' || i.section === 'DAILY CARE') && i.effective_status !== 'overdue'
    );
  }, [visibleItems]);

  const completedTodayCount = useMemo(() => {
    return dueTodayItems.filter((i) => i.effective_status === 'completed').length;
  }, [dueTodayItems]);

  const overdueItems = useMemo(() => {
    return visibleItems.filter((i) => i.section === 'OVERDUE' || i.effective_status === 'overdue');
  }, [visibleItems]);

  const upcomingAppointments = useMemo(() => {
    return visibleItems.filter((i) => i.section === 'NEXT UP' && i.effective_status !== 'overdue');
  }, [visibleItems]);

  // Total task progress calculation (combining scheduled care items and medications)
  const totalTrackedItems = dueTodayItems.length + medications.length;
  const totalCompletedItems = completedTodayCount + takenMedsCount;
  const progressPercentage =
    totalTrackedItems > 0 ? Math.round((totalCompletedItems / totalTrackedItems) * 100) : 0;

  // Next Important Action
  const nextPendingItem = useMemo(() => {
    // First priority: any pending task due today
    const pendingCare = dueTodayItems.find((i) => i.effective_status === 'pending');
    if (pendingCare) return pendingCare;
    // Second priority: next medication not yet taken
    return null;
  }, [dueTodayItems]);

  const nextPendingMedication = useMemo(() => {
    const takenIds = new Set(adherenceLogs.filter((l) => l.status === 'taken').map((l) => l.medication_id));
    return medications.find((m) => !takenIds.has(m.id)) || null;
  }, [medications, adherenceLogs]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t(language, 'good_morning');
    if (hour < 17) return t(language, 'good_afternoon');
    return t(language, 'good_evening');
  };

  const patientFirstName = patientContext.patientName.split(' ')[0];
  const isCaregiver = patientContext.role === 'caregiver';

  const handleUpdateCoordStatus = (id: string, status: CoordinationCardStatus) => {
    db.updateCoordinationCardStatus(id, status, 'Noted by care coordinator.');
    refreshData();
  };

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      {/* Top Header Card: Patient Name, Date, Connectivity, Reminder badge */}
      <div className="rounded-3xl bg-gradient-to-br from-teal-900/70 via-slate-900 to-slate-950 border border-teal-800/40 p-5 shadow-sm text-white relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Date & Mode Badge */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-teal-300 uppercase tracking-wider">
              {isCaregiver ? 'Caregiver Oversight' : 'Daily Care Plan'}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-300 font-mono text-[11px]">08 Oct 2026</span>
          </div>

          {/* Connectivity & Notification Indicators */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Reminder Count Indicator */}
            <button
              onClick={() => setActiveSubRoute('reminders')}
              aria-label="View reminders"
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] text-teal-300 hover:text-white transition"
            >
              <Bell className="w-3 h-3 text-teal-400" />
              <span>{reminders.length}</span>
            </button>

            {/* Online / Offline status */}
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                isOnline
                  ? 'bg-emerald-950/80 border-emerald-700/70 text-emerald-300'
                  : 'bg-amber-950/80 border-amber-600/70 text-amber-300'
              }`}
            >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </span>
          </div>
        </div>

        {/* Greeting */}
        <h1 className="text-xl font-bold tracking-tight text-white mt-1">
          {getGreeting()}, {isCaregiver ? 'Ramesh' : patientFirstName}
        </h1>
        {isCaregiver && (
          <p className="text-xs text-amber-300/90 mt-0.5 font-medium">
            Monitoring recovery for: <strong>{patientContext.patientName}</strong>
          </p>
        )}

        {/* Progress Display */}
        <div className="mt-4 pt-3 border-t border-teal-800/40">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-semibold text-white">Today's Progress</span>
              <div className="text-[11px] text-teal-300/80">
                {totalCompletedItems} of {totalTrackedItems} actions completed
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-teal-300 font-mono">{progressPercentage}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800/90 h-2.5 rounded-full overflow-hidden border border-slate-700/60">
            <div
              className="bg-gradient-to-r from-teal-500 to-teal-300 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Task Counts Summary Pills */}
          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className="p-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Completed</span>
              <span className="text-xs font-bold text-emerald-400">{totalCompletedItems}</span>
            </div>
            <div className="p-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Pending</span>
              <span className="text-xs font-bold text-teal-300">
                {dueTodayItems.filter((i) => i.effective_status === 'pending').length +
                  (medications.length - takenMedsCount)}
              </span>
            </div>
            <div className="p-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Overdue</span>
              <span className="text-xs font-bold text-amber-400">{overdueItems.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Banner: Shows unexposed clinical review count */}
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

      {/* NEXT ACTION SECTION */}
      <section aria-label="Next action" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-300">Next Action</h2>
          </div>
        </div>

        {nextPendingMedication ? (
          <div className="rounded-2xl bg-slate-900 border border-teal-800/60 p-4 shadow-sm text-slate-100 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                <Pill className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                  Take Prescribed Medicine
                </span>
                <h3 className="text-sm font-bold text-white truncate mt-0.5">
                  {nextPendingMedication.drug_name}
                </h3>
                <div className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                  <span className="font-semibold text-slate-200">{nextPendingMedication.dose}</span>
                  <span>·</span>
                  <span className="text-teal-300/90">{nextPendingMedication.how_often}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('medicines')}
              className="min-h-[44px] px-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm transition active:scale-95"
            >
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : nextPendingItem ? (
          <div className="rounded-2xl bg-slate-900 border border-teal-800/60 p-4 shadow-sm text-slate-100 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                <Activity className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                  Scheduled Daily Care
                </span>
                <h3 className="text-sm font-bold text-white truncate mt-0.5">{nextPendingItem.title}</h3>
                <div className="text-xs text-slate-300 mt-1">Due: {nextPendingItem.due_time || 'Today'}</div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTaskId(nextPendingItem.id)}
              className="min-h-[44px] px-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm transition active:scale-95"
            >
              <span>Check In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>All scheduled actions for today have been logged.</span>
          </div>
        )}
      </section>

      {/* NEEDS ATTENTION SECTION (Overdue items / Alerts) */}
      {overdueItems.length > 0 && (
        <section aria-label="Needs attention" className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Needs Attention ({overdueItems.length})
            </h2>
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

      {/* TODAY'S CARE TASKS */}
      <section aria-label="Today's care tasks" className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-300">
              Today's Care Tasks ({dueTodayItems.length})
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('plan')}
            className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
          >
            <span>Full Plan</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
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

      {/* UPCOMING SECTION (Appointments & Diagnostic Tests) */}
      {upcomingAppointments.length > 0 && (
        <section aria-label="Upcoming appointments and tests" className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-300">Upcoming Follow-ups</h2>
            </div>
          </div>
          <div className="space-y-2.5">
            {upcomingAppointments.map((item) => (
              <TaskCard
                key={item.id}
                item={item}
                onOpenDetails={(i) => setSelectedTaskId(i.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* CAREGIVER SECTION: Coordination Card System */}
      <section aria-label="Care coordination issues" className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-teal-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Care Team Coordination Cards
            </h2>
          </div>
          <button
            onClick={() => setShowCoordinationModal(true)}
            className="min-h-[36px] px-3 py-1 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Issue</span>
          </button>
        </div>

        {coordinationCards.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-center">
            No active issues raised with the care team.
          </div>
        ) : (
          <div className="space-y-2.5">
            {coordinationCards.map((card) => (
              <CoordinationCard
                key={card.id}
                card={card}
                isCaregiver={isCaregiver}
                onUpdateStatus={(newStatus) => handleUpdateCoordStatus(card.id, newStatus)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Create Coordination Issue Modal */}
      {showCoordinationModal && (
        <CreateCoordinationModal
          patientContext={patientContext}
          onClose={() => setShowCoordinationModal(false)}
          onCreated={() => refreshData()}
        />
      )}

      {/* Task Detail Bottom Sheet */}
      <TaskDetailSheet
        itemId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
};
