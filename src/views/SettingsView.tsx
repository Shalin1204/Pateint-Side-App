import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/supabaseMock';
import { Language } from '../types';
import { t } from '../i18n/translations';
import { PWAInstallButton } from '../components/pwa/PWAInstallButton';
import {
  ArrowLeft, Globe, Users, Check, X, UserCheck,
  Download, RotateCcw, Moon, Sun,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    currentUser, patientContext, language, setLanguage,
    setActiveSubRoute, refreshData, switchPersona, theme, setTheme,
  } = useAuth();
  const isLight = theme === 'light';

  const isPatientOwner = currentUser.role === 'patient';
  const accessRequests = useMemo(() => db.getAccessRequests(), []);
  const pendingRequests = accessRequests.filter((r) => r.status === 'pending');

  const handleDecideRequest = (requestId: string, decision: 'approved' | 'denied') => {
    db.decideAccessRequest(requestId, decision);
    refreshData();
  };

  const handleToggleCaregiverMarkDone = (allowed: boolean) => {
    db.updateCaregiverCanMarkDone('usr_caregiver_ramesh', allowed);
    refreshData();
  };

  /* ── shared style helpers ── */
  const card: React.CSSProperties = isLight
    ? { backgroundColor: '#EAF4FA', border: '1px solid #C5DCE8', boxShadow: '0 1px 4px rgba(24,50,74,0.07)' }
    : { backgroundColor: '#0f172a', border: '1px solid rgba(20,184,166,0.15)' };

  const subCell: React.CSSProperties = isLight
    ? { backgroundColor: '#F0F8FD', border: '1px solid #C5DCE8' }
    : { backgroundColor: 'rgba(2,8,23,0.6)', border: '1px solid rgba(30,41,59,0.8)' };

  const hd: React.CSSProperties  = isLight ? { color: '#18324A' } : { color: '#ffffff' };
  const md: React.CSSProperties  = isLight ? { color: '#587084' } : { color: '#94a3b8' };
  const acc: React.CSSProperties = isLight ? { color: '#007A73' } : { color: '#2dd4bf' };
  const div: React.CSSProperties = { borderColor: isLight ? '#C5DCE8' : 'rgba(30,41,59,0.8)' };

  const backBtn: React.CSSProperties = isLight
    ? { backgroundColor: '#D4EEF7', border: '1px solid #C5DCE8', color: '#18324A' }
    : { backgroundColor: '#1e293b', color: '#cbd5e1' };

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-200">

      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveSubRoute(null)}
          aria-label="Back"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition"
          style={backBtn}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold tracking-tight" style={hd}>{t(language, 'settings')}</h1>
          <p className="text-xs" style={acc}>Preferences & account access controls</p>
        </div>
      </div>

      {/* Persona switcher */}
      <div className="rounded-3xl p-4 shadow-sm space-y-3" style={card}>
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4" style={acc} />
          <h2 className="text-xs font-bold uppercase tracking-wider" style={acc}>Active App Persona</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'usr_patient_lakshmi', initials: 'LD', name: 'Lakshmi Devi', role: 'Patient Mode', teal: true },
            { id: 'usr_caregiver_ramesh', initials: 'RK', name: 'Ramesh Kumar', role: 'Caregiver Mode', teal: false },
          ].map((p) => {
            const isActive = currentUser.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => switchPersona(p.id as any)}
                className="p-3 rounded-2xl border text-left transition flex flex-col justify-between"
                style={isActive
                  ? p.teal
                    ? isLight
                      ? { backgroundColor: 'rgba(0,175,163,0.10)', border: '1px solid #00AFA3' }
                      : { backgroundColor: 'rgba(19,78,74,0.9)', border: '1px solid #0d9488' }
                    : isLight
                      ? { backgroundColor: '#FFF5D9', border: '1px solid #F5D57A' }
                      : { backgroundColor: 'rgba(120,53,15,0.9)', border: '1px solid rgba(146,64,14,1)' }
                  : isLight
                    ? { backgroundColor: '#F0F8FD', border: '1px solid #C5DCE8' }
                    : { backgroundColor: 'rgba(2,8,23,0.6)', border: '1px solid rgba(30,41,59,0.8)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={p.teal
                      ? isLight
                        ? { backgroundColor: 'rgba(0,175,163,0.15)', color: '#007A73' }
                        : { backgroundColor: 'rgba(19,78,74,0.6)', color: '#5eead4' }
                      : isLight
                        ? { backgroundColor: '#FFF5D9', color: '#C58A00' }
                        : { backgroundColor: 'rgba(120,53,15,0.6)', color: '#fcd34d' }}
                  >
                    {p.initials}
                  </span>
                  {isActive && (
                    <Check className="w-4 h-4" style={p.teal
                      ? isLight ? { color: '#007A73' } : { color: '#2dd4bf' }
                      : isLight ? { color: '#C58A00' } : { color: '#fbbf24' }} />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold" style={hd}>{p.name}</div>
                  <div className="text-[11px]" style={p.teal
                    ? isLight ? { color: '#007A73' } : { color: 'rgba(94,234,212,0.8)' }
                    : isLight ? { color: '#C58A00' } : { color: 'rgba(252,211,77,0.8)' }}
                  >
                    {p.role}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme toggle */}
      <div className="rounded-3xl p-4 shadow-sm space-y-3" style={card}>
        <div className="flex items-center gap-2">
          {isLight ? <Sun className="w-4 h-4" style={acc} /> : <Moon className="w-4 h-4" style={acc} />}
          <h2 className="text-xs font-bold uppercase tracking-wider" style={acc}>Appearance</h2>
        </div>
        <p className="text-xs leading-relaxed" style={md}>
          Choose your preferred colour theme. Light mode uses the Clinical Mint palette.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setTheme('dark')}
            className="min-h-[64px] rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all"
            style={theme === 'dark'
              ? { backgroundColor: 'rgba(20,184,166,0.12)', border: '2px solid #14b8a6', color: '#2dd4bf' }
              : isLight
                ? { backgroundColor: '#F0F8FD', border: '1px solid #C5DCE8', color: '#587084' }
                : { backgroundColor: '#0f172a', border: '1px solid rgba(30,41,59,0.8)', color: '#64748b' }}
          >
            <Moon className="w-5 h-5" />
            <span className="text-xs font-semibold">Dark</span>
          </button>
          <button
            onClick={() => setTheme('light')}
            className="min-h-[64px] rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all"
            style={theme === 'light'
              ? { backgroundColor: 'rgba(0,175,163,0.10)', border: '2px solid #00AFA3', color: '#007A73' }
              : { backgroundColor: '#EAF4FA', border: '1px solid #C5DCE8', color: '#587084' }}
          >
            <Sun className="w-5 h-5" />
            <span className="text-xs font-semibold">Light</span>
          </button>
        </div>
      </div>

      {/* Language selector */}
      <div className="rounded-3xl p-4 shadow-sm" style={card}>
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4" style={acc} />
          <h2 className="text-xs font-bold uppercase tracking-wider" style={acc}>
            {t(language, 'preferred_language')}
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {([
            { code: 'en', label: 'English', script: 'English' },
            { code: 'hi', label: 'हिंदी', script: 'Hindi' },
            { code: 'ta', label: 'தமிழ்', script: 'Tamil' },
          ] as const).map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className="min-h-[44px] rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition border"
              style={language === l.code
                ? { backgroundColor: '#00AFA3', borderColor: '#00AFA3', color: '#ffffff' }
                : isLight
                  ? { backgroundColor: '#F0F8FD', border: '1px solid #C5DCE8', color: '#587084' }
                  : { backgroundColor: 'rgba(2,8,23,0.6)', border: '1px solid rgba(30,41,59,0.8)', color: '#94a3b8' }}
            >
              <span className="font-bold">{l.label}</span>
              <span className="text-[10px] opacity-75">{l.script}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Caregiver access control */}
      <div className="rounded-3xl p-4 shadow-sm" style={card}>
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4" style={acc} />
          <h2 className="text-xs font-bold uppercase tracking-wider" style={acc}>
            {t(language, 'caregiver_access')}
          </h2>
        </div>
        <p className="text-xs mb-4 leading-relaxed" style={md}>
          {t(language, 'caregiver_access_desc')}
        </p>

        {isPatientOwner ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl" style={subCell}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={isLight
                      ? { backgroundColor: '#FFF5D9', border: '1px solid #F5D57A', color: '#C58A00' }
                      : { backgroundColor: 'rgba(120,53,15,0.5)', border: '1px solid rgba(120,53,15,0.8)', color: '#fcd34d' }}
                  >
                    RK
                  </div>
                  <div>
                    <div className="text-xs font-bold" style={hd}>Ramesh Kumar</div>
                    <div className="text-[11px]" style={md}>Son · Linked Caregiver</div>
                  </div>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={isLight
                    ? { backgroundColor: '#E4F6F1', border: '1px solid #A8DFC9', color: '#1A7A50' }
                    : { backgroundColor: 'rgba(6,78,59,0.5)', border: '1px solid rgba(4,120,87,0.8)', color: '#6ee7b7' }}
                >
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t" style={div}>
                <span className="text-xs pr-2" style={md}>{t(language, 'can_mark_done_toggle')}</span>
                <input
                  type="checkbox"
                  checked={patientContext.canMarkDone}
                  onChange={(e) => handleToggleCaregiverMarkDone(e.target.checked)}
                  className="w-5 h-5 rounded cursor-pointer"
                  style={{ accentColor: '#00AFA3' }}
                />
              </div>
            </div>

            {pendingRequests.length > 0 && (
              <div className="pt-2">
                <div className="text-xs font-bold uppercase tracking-wider mb-2" style={isLight ? { color: '#C58A00' } : { color: '#fbbf24' }}>
                  {t(language, 'pending_access_requests')}
                </div>
                {pendingRequests.map((req) => (
                  <div key={req.id} className="p-3.5 rounded-2xl" style={isLight
                    ? { backgroundColor: '#FFF5D9', border: '1px solid #F5D57A' }
                    : { backgroundColor: 'rgba(2,8,23,0.6)', border: '1px solid rgba(120,53,15,0.6)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-xs font-bold" style={hd}>{req.caregiver_name}</div>
                        <div className="text-[11px]" style={md}>{req.relationship} ({req.caregiver_email})</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        onClick={() => handleDecideRequest(req.id, 'denied')}
                        className="min-h-[40px] rounded-xl text-xs font-semibold transition"
                        style={isLight
                          ? { backgroundColor: '#EAF4FA', border: '1px solid #C5DCE8', color: '#587084' }
                          : { backgroundColor: '#1e293b', color: '#94a3b8' }}
                      >
                        {t(language, 'deny')}
                      </button>
                      <button
                        onClick={() => handleDecideRequest(req.id, 'approved')}
                        className="min-h-[40px] rounded-xl text-xs font-semibold text-white transition"
                        style={{ backgroundColor: '#00AFA3' }}
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
          <div className="p-3.5 rounded-2xl text-xs space-y-2" style={subCell}>
            <div className="font-semibold" style={hd}>Your Caregiver Permissions:</div>
            {[
              { label: 'View daily tasks & plan:', val: 'Enabled', ok: true },
              { label: 'Log medicine check-ins:', val: 'Enabled', ok: true },
              { label: 'Mark items completed:', val: patientContext.canMarkDone ? 'Enabled' : 'Restricted by patient', ok: patientContext.canMarkDone },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-1 border-b last:border-0" style={div}>
                <span style={md}>{row.label}</span>
                <span className="font-semibold" style={row.ok
                  ? isLight ? { color: '#1A7A50' } : { color: '#34d399' }
                  : isLight ? { color: '#7A9AAD' } : { color: '#64748b' }}>
                  {row.val}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PWA Installation */}
      <div className="rounded-3xl p-4 shadow-sm" style={card}>
        <div className="flex items-center gap-2 mb-2">
          <Download className="w-4 h-4" style={acc} />
          <h2 className="text-xs font-bold uppercase tracking-wider" style={acc}>
            {t(language, 'install_pwa')}
          </h2>
        </div>
        <p className="text-xs mb-3 leading-relaxed" style={md}>{t(language, 'install_desc')}</p>
        <PWAInstallButton variant="card" />
      </div>

      {/* Reset demo */}
      <div className="pt-2">
        <button
          onClick={() => {
            if (confirm('Reset prototype demo state to default factory values?')) {
              db.resetToDefault();
              refreshData();
            }
          }}
          className="w-full min-h-[44px] rounded-2xl flex items-center justify-center gap-2 text-xs transition"
          style={isLight
            ? { backgroundColor: '#EAF4FA', border: '1px solid #C5DCE8', color: '#7A9AAD' }
            : { backgroundColor: 'rgba(15,23,42,0.8)', border: '1px solid rgba(30,41,59,1)', color: '#475569' }}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </div>
  );
};
