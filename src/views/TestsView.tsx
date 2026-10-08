import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/supabaseMock';
import { t } from '../i18n/translations';
import { ArrowLeft, FileCheck, Clock, CheckCircle2, AlertCircle, MapPin, Calendar, Info } from 'lucide-react';

export const TestsView: React.FC = () => {
  const { patientContext, language, setActiveSubRoute, setSelectedTaskId } = useAuth();

  // Diagnostic items from follow-up plan
  const planTests = useMemo(() => {
    return db
      .getEffectiveItems(patientContext.patientId)
      .filter((i) => i.category === 'test' || i.title.toLowerCase().includes('ecg') || i.title.toLowerCase().includes('echo'));
  }, [patientContext.patientId]);

  // Released / unreleased laboratory test results
  const testResults = useMemo(() => {
    return db.getTestResults(patientContext.patientId);
  }, [patientContext.patientId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 border border-emerald-700 text-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Completed</span>
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/80 border border-amber-600 text-amber-300">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>Overdue</span>
          </span>
        );
      case 'needs_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-950/80 border border-blue-700 text-blue-300">
            <Clock className="w-3 h-3 text-blue-400" />
            <span>Needs Review</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 border border-slate-700 text-slate-300">
            <Clock className="w-3 h-3 text-teal-400" />
            <span>Scheduled</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveSubRoute(null)}
          aria-label="Back to more menu"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            {t(language, 'tests_results')}
          </h1>
          <p className="text-xs text-teal-300/80">Diagnostic tests, schedules, and clinical reports</p>
        </div>
      </div>

      {/* SECTION 1: Scheduled Tests in Care Plan (HbA1c, ECG, Echo, etc.) */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <span className="w-2 h-2 rounded-full bg-teal-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-300">
            Scheduled Diagnostic Tests ({planTests.length})
          </h2>
        </div>

        <div className="space-y-3">
          {planTests.map((tItem) => (
            <div
              key={tItem.id}
              className="rounded-2xl bg-slate-900 border border-teal-900/50 p-4 text-slate-100 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">{tItem.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-teal-400" />
                    <span>{tItem.due_date}</span>
                    {tItem.due_time && <span>· {tItem.due_time}</span>}
                  </div>
                </div>
                {getStatusBadge(tItem.effective_status)}
              </div>

              {/* Location / Provider Suggestion */}
              {tItem.provider_suggestion && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">{tItem.provider_suggestion.name}</div>
                    {tItem.provider_suggestion.location && (
                      <div className="text-[11px] text-slate-400">{tItem.provider_suggestion.location}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Preparation instructions if explicitly available */}
              {tItem.original_text && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                  <div className="text-[10px] uppercase font-bold text-teal-400 mb-0.5">
                    Preparation & Clinical Instructions
                  </div>
                  <p className="font-mono text-slate-300 text-[11px] leading-relaxed">
                    {tItem.original_text}
                  </p>
                </div>
              )}

              {/* Tap to view full task details */}
              <button
                onClick={() => setSelectedTaskId(tItem.id)}
                className="w-full py-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold border-t border-slate-800 text-center"
              >
                View Full Order Details
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: Laboratory Reports & Pathology Findings */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center gap-2 px-1">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-300">
            Clinical Lab Results & Release Status
          </h2>
        </div>

        <div className="space-y-3">
          {testResults.map((test) => (
            <div
              key={test.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-4 text-slate-100 shadow-sm space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">{test.test_name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">Sample Date: {test.date}</div>
                </div>

                {test.is_released ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 border border-emerald-700 text-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Released</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 border border-slate-700 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>Pending Release</span>
                  </span>
                )}
              </div>

              {test.is_released && test.result_content ? (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="text-[10px] uppercase font-bold text-teal-400 mb-1">
                    Released by {test.released_by || 'Dr. Anita Sharma'}
                  </div>
                  <p className="font-mono text-slate-200 leading-relaxed text-[11px]">
                    {test.result_content}
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 italic">
                  {t(language, 'results_shared_empty')}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
