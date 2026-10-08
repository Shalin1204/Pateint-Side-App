import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/supabaseMock';
import { t } from '../i18n/translations';
import { ArrowLeft, FileCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const TestsView: React.FC = () => {
  const { patientContext, language, setActiveSubRoute } = useAuth();

  const testResults = useMemo(() => {
    return db.getTestResults(patientContext.patientId);
  }, [patientContext.patientId]);

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
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
          <p className="text-xs text-teal-300/80">Diagnostic tests & released clinical reports</p>
        </div>
      </div>

      {/* Tests in Plan */}
      <div className="space-y-3 pt-1">
        {testResults.map((test) => {
          return (
            <div
              key={test.id}
              className="rounded-2xl bg-slate-900 border border-teal-900/40 p-4 text-slate-100 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-white">{test.test_name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">Date: {test.date}</div>
                </div>

                {/* Status indicator */}
                {test.is_released ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 border border-emerald-700 text-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Released</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 border border-slate-700 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>Pending Release</span>
                  </span>
                )}
              </div>

              {/* Result Content */}
              {test.is_released && test.result_content ? (
                <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="text-[10px] uppercase font-semibold text-teal-400 mb-1">
                    Released by {test.released_by || 'Care Team'}
                  </div>
                  <p className="font-mono text-slate-200 leading-relaxed text-[11px]">
                    {test.result_content}
                  </p>
                </div>
              ) : (
                <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 italic">
                  {t(language, 'results_shared_empty')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
