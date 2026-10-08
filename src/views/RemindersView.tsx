import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/supabaseMock';
import { t } from '../i18n/translations';
import { ArrowLeft, MessageSquare, Clock, Smartphone, MessageCircle } from 'lucide-react';

export const RemindersView: React.FC = () => {
  const { patientContext, language, setActiveSubRoute } = useAuth();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const reminders = useMemo(() => {
    return db.getReminders(patientContext.patientId);
  }, [patientContext.patientId]);

  const displayedReminders = useMemo(() => {
    return reminders.filter((r) => (tab === 'upcoming' ? !r.is_past : r.is_past));
  }, [reminders, tab]);

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveSubRoute(null)}
          aria-label="Back"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            {t(language, 'reminders')}
          </h1>
          <p className="text-xs text-teal-300/80">Automated follow-up message dispatches</p>
        </div>
      </div>

      {/* Mandatory Simulation Disclaimer */}
      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 italic">
        {t(language, 'simulated_preview_notice')}
      </div>

      {/* Upcoming / Past Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setTab('upcoming')}
          className={`min-h-[40px] rounded-xl text-xs font-semibold transition ${
            tab === 'upcoming'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t(language, 'upcoming_reminders')}
        </button>
        <button
          onClick={() => setTab('past')}
          className={`min-h-[40px] rounded-xl text-xs font-semibold transition ${
            tab === 'past'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t(language, 'past_reminders')}
        </button>
      </div>

      {/* Reminders List with Simulated WhatsApp / SMS Previews */}
      <div className="space-y-3.5 pt-1">
        {displayedReminders.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
            No reminders scheduled in this section.
          </div>
        ) : (
          displayedReminders.map((rem) => {
            const isWhatsApp = rem.channel === 'whatsapp';

            return (
              <div
                key={rem.id}
                className="rounded-2xl bg-slate-900 border border-teal-900/40 p-4 shadow-sm text-slate-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isWhatsApp ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded-lg">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Alert</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-blue-400 bg-blue-950/70 border border-blue-800/80 px-2 py-0.5 rounded-lg">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>SMS Notification</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{rem.due_time}</span>
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white mb-2.5">
                  {rem.item_title}
                </h3>

                {/* Simulated Message Bubble */}
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed border ${
                    isWhatsApp
                      ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-100'
                      : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    {isWhatsApp ? 'WhatsApp Preview' : 'SMS Message Body'}
                  </div>
                  <p className="font-sans text-[11px]">{rem.preview_text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
