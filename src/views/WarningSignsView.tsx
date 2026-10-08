import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/supabaseMock';
import { t } from '../i18n/translations';
import { AlertTriangle, Phone, ArrowLeft, ShieldAlert } from 'lucide-react';

export const WarningSignsView: React.FC = () => {
  const { patientContext, language, setActiveSubRoute } = useAuth();

  const warningSigns = useMemo(() => {
    return db.getWarningSigns(patientContext.patientId);
  }, [patientContext.patientId]);

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      {/* Top Navigation Bar with Back Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveSubRoute(null)}
          aria-label="Back to main screen"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-amber-300 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>{t(language, 'warning_signs')}</span>
          </h1>
          <p className="text-xs text-slate-400">Cardiology Emergency Protocol</p>
        </div>
      </div>

      {/* Emergency Call 112 Sticky Action Banner */}
      <div className="rounded-3xl bg-amber-950/80 border border-amber-600/90 p-5 shadow-lg text-amber-100">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-300 uppercase tracking-wide">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span>Emergency Assistance</span>
        </div>
        <p className="text-xs leading-relaxed text-amber-200 mt-1 mb-4">
          {t(language, 'emergency_notice')}
        </p>

        {/* Fixed emergency call button */}
        <a
          href="tel:112"
          className="w-full min-h-[50px] rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98"
        >
          <Phone className="w-5 h-5" />
          <span>{t(language, 'emergency_call_btn')}</span>
        </a>
      </div>

      {/* Notice regarding verbatim preservation */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3 text-[11px] text-slate-400 leading-relaxed">
        {t(language, 'warning_signs_untranslated_notice')}
      </div>

      {/* List of Warning Signs (BYTE-FOR-BYTE, never translated, summarized, reworded or reordered) */}
      <div className="space-y-3">
        {warningSigns.map((sign, idx) => (
          <div
            key={sign.id}
            className="rounded-2xl bg-slate-900/90 border border-amber-800/60 p-4 text-slate-100 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-950 border border-amber-700/80 text-amber-300 text-xs font-bold mt-0.5">
                {idx + 1}
              </span>
              <p className="text-xs font-medium leading-relaxed font-sans text-slate-100">
                {sign.original_text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
