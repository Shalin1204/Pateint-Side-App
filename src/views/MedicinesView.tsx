import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/supabaseMock';
import { MedicineCard } from '../components/medicines/MedicineCard';
import { t } from '../i18n/translations';
import { Pill, AlertCircle, ShieldCheck } from 'lucide-react';

export const MedicinesView: React.FC = () => {
  const { patientContext, language } = useAuth();

  const medications = useMemo(() => {
    return db.getMedications(patientContext.patientId);
  }, [patientContext.patientId]);

  const todayAdherence = useMemo(() => {
    return db.getAdherenceLogs(patientContext.patientId, '2026-10-08');
  }, [patientContext.patientId]);

  const adherenceMap = useMemo(() => {
    const map = new Map<string, (typeof todayAdherence)[0]>();
    todayAdherence.forEach((log) => {
      map.set(log.medication_id, log);
    });
    return map;
  }, [todayAdherence]);

  const takenCount = todayAdherence.filter((l) => l.status === 'taken').length;

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      {/* Header and Summary */}
      <div className="rounded-3xl bg-slate-900 border border-teal-900/60 p-5 shadow-sm text-white">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
              Prescription Regimen
            </span>
            <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">
              {t(language, 'medicines')}
            </h1>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400 shadow-sm">
            <Pill className="w-5 h-5" />
          </div>
        </div>

        {/* Daily Adherence Progress */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-300">
            Today's Check-ins: <strong className="text-white">{takenCount} of {medications.length} logged taken</strong>
          </span>
          <span className="text-teal-400 font-semibold">08 Oct 2026</span>
        </div>
      </div>

      {/* Safety Notice regarding verbatim clinical dosing */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-3 text-xs text-slate-400 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          Instructions are shown verbatim from your hospital prescription. Never adjust doses or stop cardiac medications without consulting your cardiologist.
        </p>
      </div>

      {/* Vertical Medicine Cards */}
      <div className="space-y-3.5">
        {medications.map((med) => (
          <MedicineCard
            key={med.id}
            medication={med}
            adherenceLog={adherenceMap.get(med.id)}
          />
        ))}
      </div>
    </div>
  );
};
