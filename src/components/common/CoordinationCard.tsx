import React from 'react';
import { CoordinationCard as CoordinationCardModel, CoordinationCardStatus } from '../../types';
import { Clock, CheckCircle2, AlertCircle, MessageSquareQuote, ShieldAlert } from 'lucide-react';

interface CoordinationCardProps {
  card: CoordinationCardModel;
  onUpdateStatus?: (status: CoordinationCardStatus) => void;
  isCaregiver?: boolean;
}

export const CoordinationCard: React.FC<CoordinationCardProps> = ({
  card,
  onUpdateStatus,
  isCaregiver,
}) => {
  const getTypeBadge = (type: CoordinationCardModel['type']) => {
    switch (type) {
      case 'medication-delay':
        return { label: 'Medication Delay', color: 'text-amber-400 bg-amber-950/70 border-amber-800' };
      case 'appointment-question':
        return { label: 'Appointment Inquiry', color: 'text-blue-400 bg-blue-950/70 border-blue-800' };
      case 'test-delay':
        return { label: 'Diagnostic Test Delay', color: 'text-purple-400 bg-purple-950/70 border-purple-800' };
      case 'symptom-report':
        return { label: 'Symptom Clinical Report', color: 'text-rose-400 bg-rose-950/70 border-rose-800' };
      case 'unclear-instruction':
        return { label: 'Instruction Clarification', color: 'text-teal-400 bg-teal-950/70 border-teal-800' };
      case 'general-review':
      default:
        return { label: 'Care Team Review', color: 'text-slate-300 bg-slate-800 border-slate-700' };
    }
  };

  const typeInfo = getTypeBadge(card.type);

  const renderStatus = () => {
    switch (card.status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950 border border-emerald-700 text-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Resolved</span>
          </span>
        );
      case 'acknowledged':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-950 border border-blue-700 text-blue-300">
            <Clock className="w-3 h-3 text-blue-400" />
            <span>Acknowledged</span>
          </span>
        );
      case 'needs-review':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950 border border-amber-700 text-amber-300">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>Needs Review</span>
          </span>
        );
    }
  };

  const formattedDate = new Date(card.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="rounded-2xl bg-slate-900 border border-teal-900/40 p-4 shadow-sm text-slate-100 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
        {renderStatus()}
      </div>

      {/* Description / Content */}
      <div className="flex items-start gap-2.5 my-2.5 text-xs">
        <MessageSquareQuote className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <p className="text-slate-200 leading-relaxed font-medium">"{card.description}"</p>
      </div>

      {/* Metadata */}
      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div>
          <span>Raised by: </span>
          <strong className="text-slate-300">{card.raisedByName}</strong>
        </div>
        <span className="font-mono">{formattedDate}</span>
      </div>

      {/* Doctor / Care Team Notes if available */}
      {card.careTeamNotes && (
        <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-teal-300">
          <div className="font-bold text-[10px] uppercase tracking-wider text-teal-400 mb-0.5">
            Care Team Response
          </div>
          <p className="leading-relaxed">{card.careTeamNotes}</p>
        </div>
      )}

      {/* Caregiver simulation action buttons if needed */}
      {isCaregiver && onUpdateStatus && card.status !== 'resolved' && (
        <div className="mt-3 pt-2 border-t border-slate-800 flex justify-end gap-2">
          {card.status === 'needs-review' && (
            <button
              onClick={() => onUpdateStatus('acknowledged')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition"
            >
              Simulate Team Acknowledge
            </button>
          )}
          <button
            onClick={() => onUpdateStatus('resolved')}
            className="px-2.5 py-1 rounded-lg bg-teal-700 hover:bg-teal-600 text-xs text-white font-medium transition"
          >
            Mark Resolved
          </button>
        </div>
      )}
    </div>
  );
};
