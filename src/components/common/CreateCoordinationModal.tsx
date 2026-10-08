import React, { useState } from 'react';
import { CoordinationCardType, PatientContext } from '../../types';
import { db } from '../../services/supabaseMock';
import { X, Send, AlertCircle, ShieldAlert } from 'lucide-react';

interface CreateCoordinationModalProps {
  patientContext: PatientContext;
  onClose: () => void;
  onCreated: () => void;
  initialType?: CoordinationCardType;
  initialDescription?: string;
}

export const CreateCoordinationModal: React.FC<CreateCoordinationModalProps> = ({
  patientContext,
  onClose,
  onCreated,
  initialType = 'general-review',
  initialDescription = '',
}) => {
  const [type, setType] = useState<CoordinationCardType>(initialType);
  const [description, setDescription] = useState(initialDescription);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const actorName =
      patientContext.role === 'caregiver'
        ? `${patientContext.relationship || 'Caregiver'} (${patientContext.userId === 'usr_caregiver_ramesh' ? 'Ramesh Kumar' : 'Caregiver'})`
        : `${patientContext.patientName} (Patient)`;

    db.addCoordinationCard({
      patientId: patientContext.patientId,
      type,
      raisedBy: patientContext.role,
      raisedByName: actorName,
      description: description.trim(),
    });

    setIsSubmitting(false);
    onCreated();
    onClose();
  };

  const types: { value: CoordinationCardType; label: string }[] = [
    { value: 'medication-delay', label: 'Medicine Delivery / Stock Issue' },
    { value: 'appointment-question', label: 'Doctor Appointment Question' },
    { value: 'test-delay', label: 'Diagnostic Lab Test Issue' },
    { value: 'symptom-report', label: 'Symptom Observation Report' },
    { value: 'unclear-instruction', label: 'Unclear Discharge Instruction' },
    { value: 'general-review', label: 'General Care Team Review' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-teal-800/80 rounded-3xl p-5 shadow-2xl text-slate-100 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Request Care Team Review</h3>
            <p className="text-[11px] text-teal-300/80">Submit a coordination issue to hospital team</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Issue Category
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CoordinationCardType)}
              className="w-full min-h-[44px] px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              {types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Issue Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Medicine has not arrived yet, or patient has a query about walking..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 leading-relaxed"
              required
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-900/60 text-[11px] text-amber-200/90 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-snug">
              This request will be sent to the cardiology coordinator queue. For immediate chest pain or breathlessness, call 112 directly.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!description.trim() || isSubmitting}
              className="min-h-[44px] rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Submit Issue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
