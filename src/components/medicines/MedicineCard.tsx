import React, { useState } from 'react';
import { Medication, AdherenceLog } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/supabaseMock';
import { t } from '../../i18n/translations';
import { NotTakenConfirmModal } from './NotTakenConfirmModal';
import { Check, X, Pill, Clock, Calendar, AlertCircle } from 'lucide-react';

interface MedicineCardProps {
  medication: Medication;
  adherenceLog?: AdherenceLog;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({ medication, adherenceLog }) => {
  const { language, patientContext, refreshData } = useAuth();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const notStated = t(language, 'not_stated');

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

  return (
    <>
      <div className="w-full rounded-2xl bg-slate-900/90 border border-teal-900/50 p-4 shadow-sm text-slate-100 transition-all">
        {/* Header: Drug Name */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-teal-950 border border-teal-800/80 flex items-center justify-center text-teal-400 shrink-0">
              <Pill className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
              {medication.drug_name || notStated}
            </h3>
          </div>

          {/* Current Check-in Status Badge */}
          {adherenceLog && (
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
          )}
        </div>

        {/* Verbatim Structured Fields */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              {t(language, 'dose')}
            </span>
            <span className="font-semibold text-slate-200 mt-0.5 block">
              {medication.dose || notStated}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              {t(language, 'how_often')}
            </span>
            <span className="font-semibold text-slate-200 mt-0.5 block">
              {medication.how_often || notStated}
            </span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs mb-3">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
            {t(language, 'for_how_long')}
          </span>
          <span className="font-semibold text-slate-200 mt-0.5 block">
            {medication.for_how_long || notStated}
          </span>
        </div>

        {/* Verbatim Original Instruction (Never translated) */}
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/90 text-xs mb-3">
          <div className="text-[10px] text-teal-400 uppercase tracking-wider font-semibold mb-1">
            {t(language, 'verbatim_instruction')}
          </div>
          <p className="font-mono text-slate-300 leading-relaxed text-[11px]">
            {medication.original_instruction || notStated}
          </p>
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
            <span>{t(language, 'taken')}</span>
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
