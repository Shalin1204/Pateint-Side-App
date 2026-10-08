import React, { useState } from 'react';
import { FollowupItem, Language } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/supabaseMock';
import { speechService } from '../../services/speechService';
import { t } from '../../i18n/translations';
import {
  Volume2,
  VolumeX,
  CheckCircle,
  Circle,
  FileText,
  MapPin,
  Clock,
  AlertCircle,
  Check,
} from 'lucide-react';

interface TaskCardProps {
  item: FollowupItem;
  onOpenDetails: (item: FollowupItem) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ item, onOpenDetails }) => {
  const { language, patientContext, refreshData } = useAuth();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read verified translation if available
  const translation = db.getItemTranslation(item.id, language);
  const hasVerifiedTranslation = !!translation && language !== 'en';

  const displayTitle = hasVerifiedTranslation
    ? translation.title
    : item.title;

  const displayInstruction = hasVerifiedTranslation
    ? translation.instruction
    : item.original_text;

  const isCompleted = item.effective_status === 'completed';
  const isOverdue = item.effective_status === 'overdue';

  const handleToggleDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!patientContext.canMarkDone || isSubmitting) return;

    setIsSubmitting(true);
    // Optimistic update
    const res = db.markItemDone(item.id, patientContext);
    setIsSubmitting(false);
    if (res.success) {
      refreshData();
    }
  };

  const handleListen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const textToSpeak = `${displayTitle}. ${displayInstruction}`;
      speechService.speak(
        textToSpeak,
        language,
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }
  };

  const handleToggleOriginal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOriginal((prev) => !prev);
  };

  // Status Chip Rendering (Small chip/icon, never giant colored cards)
  const renderStatusChip = () => {
    switch (item.effective_status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/70 border border-emerald-700/60 text-emerald-300">
            <Check className="w-3 h-3 text-emerald-400" />
            <span>{t(language, 'marked_done')}</span>
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-950/80 border border-amber-600/70 text-amber-300">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>Overdue</span>
          </span>
        );
      case 'needs_review':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-950/70 border border-blue-700/60 text-blue-300">
            <Clock className="w-3 h-3 text-blue-400" />
            <span>In Review</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 border border-slate-700 text-slate-300">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onOpenDetails(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpenDetails(item)}
      className={`relative w-full rounded-2xl p-4 transition-all border text-left cursor-pointer active:scale-[0.99] ${
        isCompleted
          ? 'bg-slate-900/60 border-slate-800 text-slate-400'
          : isOverdue
          ? 'bg-slate-900/90 border-amber-800/60 shadow-sm shadow-amber-950/30 text-slate-100'
          : 'bg-slate-900/90 border-teal-900/50 hover:border-teal-700/60 shadow-sm text-slate-100'
      }`}
    >
      {/* Top Header: Category/Date + Status Chip */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium truncate">
          <span>{item.due_date}</span>
          {item.due_time && (
            <>
              <span aria-hidden="true">·</span>
              <span>{item.due_time}</span>
            </>
          )}
        </div>
        <div>{renderStatusChip()}</div>
      </div>

      {/* Main Title */}
      <h3
        className={`text-sm font-semibold leading-snug tracking-tight mb-1.5 ${
          isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
        }`}
      >
        {displayTitle}
      </h3>

      {/* Verified vs Unverified Translation Warning */}
      {!hasVerifiedTranslation && language !== 'en' && (
        <div className="mb-2 p-1.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-300/90">
          {t(language, 'please_confirm_team')}
        </div>
      )}

      {/* Toggled Verbatim Original Text */}
      {showOriginal && (
        <div className="mb-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed">
          <div className="text-[10px] uppercase font-bold text-teal-400 mb-1">
            Verbatim Medical Text
          </div>
          {item.original_text}
        </div>
      )}

      {/* Provider Suggestion if present */}
      {item.provider_suggestion && (
        <div className="flex items-center gap-1.5 text-xs text-teal-300/90 mb-3 bg-teal-950/40 px-2.5 py-1.5 rounded-xl border border-teal-900/40">
          <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span className="truncate">{item.provider_suggestion.name}</span>
          {item.provider_suggestion.location && (
            <span className="text-slate-400 shrink-0 text-[11px]">
              ({item.provider_suggestion.location})
            </span>
          )}
        </div>
      )}

      {/* Action Bar with Listen, Original, and Mark Done */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2">
        <div className="flex items-center gap-1.5">
          {/* Listen Button (SpeechSynthesis) */}
          <button
            type="button"
            onClick={handleListen}
            aria-label={isSpeaking ? t(language, 'stop_listening') : t(language, 'listen')}
            className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition active:scale-95 ${
              isSpeaking
                ? 'bg-teal-600 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700/80 text-teal-300 border border-slate-700'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>{t(language, 'stop_listening')}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>{t(language, 'listen')}</span>
              </>
            )}
          </button>

          {/* Original Verbatim Button */}
          <button
            type="button"
            onClick={handleToggleOriginal}
            aria-label="View original verbatim prescription text"
            className="min-h-[44px] px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 text-slate-300 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition active:scale-95"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{t(language, 'original')}</span>
          </button>
        </div>

        {/* Mark Done Button (Conditional on caregiver permissions) */}
        {patientContext.canMarkDone && (
          <button
            type="button"
            onClick={handleToggleDone}
            aria-label={isCompleted ? 'Mark as incomplete' : t(language, 'mark_done')}
            className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition active:scale-95 ${
              isCompleted
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900/60'
                : 'bg-teal-600 hover:bg-teal-500 text-white shadow-sm'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{t(language, 'marked_done')}</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4" />
                <span>{t(language, 'mark_done')}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Completion info attribution if finished */}
      {isCompleted && item.completed_by && (
        <div className="mt-2 text-[10px] text-slate-400 font-medium">
          {t(language, 'logged_by', { name: item.completed_by })}
        </div>
      )}
    </div>
  );
};
