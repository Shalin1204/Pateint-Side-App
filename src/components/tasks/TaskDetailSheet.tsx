import React from 'react';
import { FollowupItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/supabaseMock';
import { speechService } from '../../services/speechService';
import { t } from '../../i18n/translations';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Volume2,
  FileText,
  UserCheck,
  Check,
  Phone,
} from 'lucide-react';

interface TaskDetailSheetProps {
  itemId: string | null;
  onClose: () => void;
}

export const TaskDetailSheet: React.FC<TaskDetailSheetProps> = ({ itemId, onClose }) => {
  const { language, patientContext, refreshData } = useAuth();

  if (!itemId) return null;

  const item = db.getItemById(itemId);
  if (!item) return null;

  const translation = db.getItemTranslation(item.id, language);
  const hasVerifiedTranslation = !!translation && language !== 'en';

  const displayTitle = hasVerifiedTranslation ? translation.title : item.title;
  const displayInstruction = hasVerifiedTranslation
    ? translation.instruction
    : item.original_text;

  const isCompleted = item.effective_status === 'completed';

  const handleToggleDone = () => {
    if (!patientContext.canMarkDone) return;
    const res = db.markItemDone(item.id, patientContext);
    if (res.success) {
      refreshData();
    }
  };

  const handleSpeak = () => {
    speechService.speak(`${displayTitle}. ${displayInstruction}`, language);
  };

  const sourceLabel =
    item.source === 'doctor_added' && item.added_by
      ? t(language, 'added_by', { author: item.added_by })
      : t(language, 'from_discharge_summary');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop tap to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Modal Container */}
      <div className="relative w-full max-w-lg bg-slate-900 border-t border-slate-700/80 rounded-t-3xl p-5 shadow-2xl text-slate-100 max-h-[85dvh] overflow-y-auto no-scrollbar pb-safe animate-in slide-in-from-bottom duration-200 z-10">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-400">
              {sourceLabel}
            </span>
            <h2 className="text-base font-bold text-white mt-0.5 leading-snug">
              {displayTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close details"
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status & Date Chips */}
        <div className="flex flex-wrap items-center gap-2 my-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-teal-400" />
            <span>{item.due_date}</span>
            {item.due_time && <span>· {item.due_time}</span>}
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border ${
              isCompleted
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                : item.effective_status === 'overdue'
                ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            {isCompleted ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="capitalize">{item.effective_status}</span>
          </div>
        </div>

        {/* Original Verbatim Instruction Section */}
        <div className="my-4 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>Verbatim Instruction</span>
            </div>
            <button
              onClick={handleSpeak}
              className="flex items-center gap-1 text-[11px] text-teal-300 hover:text-white bg-slate-800 px-2 py-1 rounded-lg"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{t(language, 'listen')}</span>
            </button>
          </div>
          <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            {item.original_text}
          </p>
        </div>

        {/* Translation fallback notice */}
        {!hasVerifiedTranslation && language !== 'en' && (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{t(language, 'please_confirm_team')}</span>
          </div>
        )}

        {/* Provider Suggestion */}
        {item.provider_suggestion && (
          <div className="my-4 p-3.5 rounded-2xl bg-teal-950/40 border border-teal-900/50">
            <div className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider mb-1.5">
              {t(language, 'provider_suggestion_label')}
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-semibold text-white">
                  {item.provider_suggestion.name}
                </div>
                {item.provider_suggestion.location && (
                  <div className="text-slate-400 mt-0.5">
                    {item.provider_suggestion.location}
                  </div>
                )}
                {item.provider_suggestion.phone && (
                  <a
                    href={`tel:${item.provider_suggestion.phone}`}
                    className="inline-flex items-center gap-1 text-teal-300 hover:underline mt-1 font-medium"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{item.provider_suggestion.phone}</span>
                  </a>
                )}
              </div>
            </div>
            <div className="mt-2 text-[10px] text-teal-300/80 italic">
              {t(language, 'suggestion_disclaimer')}
            </div>
          </div>
        )}

        {/* Logged by Info if completed */}
        {isCompleted && item.completed_by && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-4 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-900/40">
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>{t(language, 'logged_by', { name: item.completed_by })}</span>
          </div>
        )}

        {/* Action Button */}
        {patientContext.canMarkDone && (
          <div className="pt-2">
            <button
              onClick={handleToggleDone}
              className={`w-full min-h-[48px] rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98 ${
                isCompleted
                  ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                  : 'bg-teal-600 hover:bg-teal-500 text-white'
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Mark as Incomplete</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>{t(language, 'mark_done')}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
