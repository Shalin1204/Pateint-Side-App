import React, { useState } from 'react';
import { Medication, AdherenceLog } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/supabaseMock';
import { t } from '../../i18n/translations';
import { NotTakenConfirmModal } from './NotTakenConfirmModal';
import { Check, X, Pill, Clock, Calendar, AlertCircle, Utensils, ShieldCheck } from 'lucide-react';

interface MedicineCardProps {
  medication: Medication;
  adherenceLog?: AdherenceLog;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({ medication, adherenceLog }) => {
  const { language, patientContext, refreshData } = useAuth();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFullInstruction, setShowFullInstruction] = useState(false);

  // Strictly display "Needs Review" if information is not available
  const missingFallback = 'Needs Review';

  const handleTake = () => {
    db.recordAdherence(medication.id, 'taken', patientContext);
    refreshData();
  };

  const handleConfirmNotTaken = () => {
    db.recordAdherence(medication.id, 'not_taken', patientContext);
    setShowConfirmModal(false);
    refreshData();
  };

  const isTaken = adherenceLog?.status === 'taken';
  const isNotTaken = adherenceLog?.status === 'not_taken';

  // Extract explicit food relationship from prescription string if present
  const getFoodRelationship = () => {
    const text = `${medication.how_often} ${medication.original_instruction}`.toLowerCase();
    if (text.includes('after food') || text.includes('after meals')) {
      return 'After food';
    }
    if (text.includes('before food') || text.includes('before meals')) {
      return 'Before food';
    }
    if (text.includes('with meals') || text.includes('with breakfast') || text.includes('with food')) {
      return 'With meals';
    }
    if (text.includes('at bedtime') || text.includes('hs')) {
      return 'At bedtime';
    }
    return missingFallback;
  };

  const foodRelationship = getFoodRelationship();

  return (
    <>
      <div className="w-full rounded-2xl bg-slate-900/90 border border-teal-900/50 p-4 shadow-sm text-slate-100 transition-all">
        {/* Header: Drug Name & Current Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-teal-950 border border-teal-800/80 flex items-center justify-center text-teal-400 shrink-0">
              <Pill className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
              {medication.drug_name || missingFallback}
            </h3>
          </div>

          {/* Current Check-in Status Badge */}
          {adherenceLog ? (
            <span
              className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                isTaken
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                  : 'bg-amber-950/80 border-amber-600 text-amber-300'
              }`}
            >
              {isTaken ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-amber-400" />}
              <span>{isTaken ? t(language, 'taken') : t(language, 'not_taken')}</span>
            </span>
          ) : (
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 border border-slate-700 text-slate-400">
              <Clock className="w-3 h-3" />
              <span>Scheduled Today</span>
            </span>
          )}
        </div>

        {/* Structured Grid: Dose, Frequency, Food Relationship, Duration */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          {/* Dose */}
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              {t(language, 'dose')}
            </span>
            <span className="font-semibold text-slate-200 mt-0.5 block">
              {medication.dose || missingFallback}
            </span>
          </div>

          {/* Frequency */}
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              {t(language, 'how_often')}
            </span>
            <span className="font-semibold text-slate-200 mt-0.5 block truncate">
              {medication.how_often || missingFallback}
            </span>
          </div>

          {/* Food Relationship */}
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold flex items-center gap-1">
              <Utensils className="w-3 h-3 text-teal-400" />
              <span>Food Relation</span>
            </span>
            <span className={`font-semibold mt-0.5 block ${foodRelationship === missingFallback ? 'text-amber-300' : 'text-slate-200'}`}>
              {foodRelationship}
            </span>
          </div>

          {/* Duration */}
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              {t(language, 'for_how_long')}
            </span>
            <span className="font-semibold text-slate-200 mt-0.5 block truncate">
              {medication.for_how_long || missingFallback}
            </span>
          </div>
        </div>

        {/* Verbatim Original Instruction from Discharge Data */}
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/90 text-xs mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-teal-400 uppercase tracking-wider font-semibold">
              {t(language, 'verbatim_instruction')}
            </span>
            <button
              onClick={() => setShowFullInstruction(!showFullInstruction)}
              className="text-[10px] text-teal-300 hover:text-white underline"
            >
              {showFullInstruction ? 'Collapse' : 'View Instructions'}
            </button>
          </div>
          <p className="font-mono text-slate-300 leading-relaxed text-[11px]">
            {showFullInstruction
              ? medication.original_instruction || missingFallback
              : (medication.original_instruction || missingFallback).slice(0, 75) +
                ((medication.original_instruction || '').length > 75 ? '...' : '')}
          </p>
        </div>

        {/* Clinical Guardrail Indicator */}
        <div className="text-[10px] text-slate-500 mb-3 px-1 flex items-center gap-1 italic">
          <ShieldCheck className="w-3 h-3 text-teal-500 shrink-0" />
          <span>Dosing is locked to hospital discharge. Dosage adjustments require doctor review.</span>
        </div>

        {/* Who logged the check-in */}
        {adherenceLog && (
          <div className="text-[11px] text-slate-400 mb-3 px-1 font-medium">
            {t(language, 'logged_by', { name: adherenceLog.logged_by })}
          </div>
        )}

        {/* Check-in Buttons: Taken / Not taken */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={handleTake}
            className={`min-h-[44px] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-98 ${
              isTaken
                ? 'bg-emerald-950/90 border border-emerald-700/80 text-emerald-300'
                : 'bg-teal-700 hover:bg-teal-600 text-white shadow-sm'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Mark as Taken</span>
          </button>

          <button
            onClick={() => setShowConfirmModal(true)}
            className={`min-h-[44px] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-98 ${
              isNotTaken
                ? 'bg-amber-950/90 border border-amber-700/80 text-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <X className="w-4 h-4" />
            <span>{t(language, 'not_taken')}</span>
          </button>
        </div>
      </div>

      {showConfirmModal && (
        <NotTakenConfirmModal
          drugName={medication.drug_name}
          onConfirm={handleConfirmNotTaken}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </>
  );
};
