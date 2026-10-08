import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/supabaseMock';
import { Language } from '../types';
import { t } from '../i18n/translations';
import { PWAInstallButton } from '../components/pwa/PWAInstallButton';
import {
  ArrowLeft,
  Globe,
  Users,
  Shield,
  Check,
  X,
  UserCheck,
  Download,
  RotateCcw,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    patientContext,
    language,
    setLanguage,
    setActiveSubRoute,
    refreshData,
    switchPersona,
  } = useAuth();

  const isPatientOwner = currentUser.role === 'patient';

  const accessRequests = useMemo(() => {
    return db.getAccessRequests();
  }, []);

  const pendingRequests = accessRequests.filter((r) => r.status === 'pending');

  const handleDecideRequest = (requestId: string, decision: 'approved' | 'denied') => {
    db.decideAccessRequest(requestId, decision);
    refreshData();
  };

  const handleToggleCaregiverMarkDone = (allowed: boolean) => {
    db.updateCaregiverCanMarkDone('usr_caregiver_ramesh', allowed);
    refreshData();
  };

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-200">
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
            {t(language, 'settings')}
          </h1>
          <p className="text-xs text-teal-300/80">Preferences & account access controls</p>
        </div>
      </div>

      {/* Active User Persona Switcher Section */}
      <div className="rounded-3xl bg-slate-900 border border-teal-900/40 p-4 shadow-sm text-slate-100 space-y-3">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-teal-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-300">
            Active App Persona
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => switchPersona('usr_patient_lakshmi')}
            className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
              currentUser.id === 'usr_patient_lakshmi'
                ? 'bg-teal-950/90 border-teal-500 text-white shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-full bg-teal-800/60 text-teal-200 flex items-center justify-center text-xs font-bold">
                LD
              </span>
              {currentUser.id === 'usr_patient_lakshmi' && (
                <Check className="w-4 h-4 text-teal-400" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-white">Lakshmi Devi</div>
              <div className="text-[11px] text-teal-300/80">Patient Mode</div>
            </div>
          </button>

          <button
            onClick={() => switchPersona('usr_caregiver_ramesh')}
            className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
              currentUser.id === 'usr_caregiver_ramesh'
                ? 'bg-amber-950/90 border-amber-500 text-white shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-full bg-amber-800/60 text-amber-200 flex items-center justify-center text-xs font-bold">
                RK
              </span>
              {currentUser.id === 'usr_caregiver_ramesh' && (
                <Check className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-white">Ramesh Kumar</div>
              <div className="text-[11px] text-amber-300/80">Caregiver Mode</div>
            </div>
          </button>
        </div>
      </div>

      {/* Language Selector Section */}
      <div className="rounded-3xl bg-slate-900 border border-teal-900/40 p-4 shadow-sm text-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-teal-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-300">
            {t(language, 'preferred_language')}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { code: 'en', label: 'English', script: 'English' },
              { code: 'hi', label: 'हिंदी', script: 'Hindi' },
              { code: 'ta', label: 'தமிழ்', script: 'Tamil' },
            ] as const
          ).map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`min-h-[44px] rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition border ${
                language === l.code
                  ? 'bg-teal-600 border-teal-500 text-white shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <span className="font-bold">{l.label}</span>
              <span className="text-[10px] opacity-75">{l.script}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Caregiver Access Control Section */}
      <div className="rounded-3xl bg-slate-900 border border-teal-900/40 p-4 shadow-sm text-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-teal-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-300">
            {t(language, 'caregiver_access')}
          </h2>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          {t(language, 'caregiver_access_desc')}
        </p>

        {isPatientOwner ? (
          <div className="space-y-4">
            {/* Linked Caregiver list */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-300 text-xs font-bold">
                    RK
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Ramesh Kumar</div>
                    <div className="text-[11px] text-slate-400">Son · Linked Caregiver</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px] font-semibold">
                  Active
                </span>
              </div>

              {/* Permission Toggle: Allow Caregiver to Mark Done */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <span className="text-xs text-slate-300 pr-2">
                  {t(language, 'can_mark_done_toggle')}
                </span>
                <input
                  type="checkbox"
                  checked={patientContext.canMarkDone}
                  onChange={(e) => handleToggleCaregiverMarkDone(e.target.checked)}
                  className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Pending Access Requests */}
            {pendingRequests.length > 0 && (
              <div className="pt-2">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  {t(language, 'pending_access_requests')}
                </div>
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-amber-900/60"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-xs font-bold text-white">{req.caregiver_name}</div>
                        <div className="text-[11px] text-slate-400">
                          {req.relationship} ({req.caregiver_email})
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        onClick={() => handleDecideRequest(req.id, 'denied')}
                        className="min-h-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                      >
                        {t(language, 'deny')}
                      </button>
                      <button
                        onClick={() => handleDecideRequest(req.id, 'approved')}
                        className="min-h-[40px] rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm"
                      >
                        {t(language, 'approve')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Caregiver read-only view of permissions */
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="font-semibold text-white">Your Caregiver Permissions:</div>
            <div className="flex items-center justify-between py-1 border-b border-slate-900">
              <span>View daily tasks & plan:</span>
              <span className="text-emerald-400 font-semibold">Enabled</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-900">
              <span>Log medicine check-ins:</span>
              <span className="text-emerald-400 font-semibold">Enabled</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>Mark items completed:</span>
              <span
                className={`font-semibold ${
                  patientContext.canMarkDone ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {patientContext.canMarkDone ? 'Enabled' : 'Restricted by patient'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* PWA App Installation Section */}
      <div className="rounded-3xl bg-slate-900 border border-teal-900/40 p-4 shadow-sm text-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <Download className="w-4 h-4 text-teal-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-300">
            {t(language, 'install_pwa')}
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          {t(language, 'install_desc')}
        </p>
        <PWAInstallButton variant="card" />
      </div>

      {/* Reset Demo State Button */}
      <div className="pt-2">
        <button
          onClick={() => {
            if (confirm('Reset prototype demo state to default factory values?')) {
              db.resetToDefault();
              refreshData();
            }
          }}
          className="w-full min-h-[44px] rounded-2xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2 transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </div>
  );
};
