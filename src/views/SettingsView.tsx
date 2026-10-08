import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { dataService } from '../services/dataService';
import { Language, AccessRequest } from '../types';
import { t } from '../i18n/translations';
import { PWAInstallButton } from '../components/pwa/PWAInstallButton';
import {
  ArrowLeft, Globe, Users, Check, X, UserCheck,
  Download, RotateCcw, Moon, Sun, Shield, Database,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    currentUser, patientContext, language, setLanguage,
    setActiveSubRoute, refreshData, switchPersona, theme, setTheme, isSupabaseLive,
  } = useAuth();
  const { notifySuccess, notifyError, notifyInfo } = useNotification();
  const isLight = theme === 'light';

  const isPatientOwner = currentUser.role === 'patient';
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);

  useEffect(() => {
    let isMounted = true;
    dataService.getAccessRequests().then((reqs) => {
      if (isMounted) setAccessRequests(reqs);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const pendingRequests = accessRequests.filter((r) => r.status === 'pending');

  const handleDecideRequest = async (requestId: string, decision: 'approved' | 'denied') => {
    const res = await dataService.decideAccessRequest(requestId, decision);
    if (res.success) {
      notifySuccess(
        `Caregiver access request was ${decision}.`,
        'Caregiver Permissions'
      );
      const updated = await dataService.getAccessRequests();
      setAccessRequests(updated);
      refreshData();
    } else {
      notifyError(res.error || 'Failed to update access request.', 'Update Error');
    }
  };

  const handleToggleCaregiverMarkDone = async (allowed: boolean) => {
    await dataService.updateCaregiverCanMarkDone('usr_caregiver_ramesh', allowed);
    notifyInfo(
      `Caregiver task completion permission set to: ${allowed ? 'Allowed' : 'View Only'}`,
      'Caregiver Delegation'
    );
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
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition cursor-pointer"
          style={backBtn}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold tracking-tight" style={hd}>
            {t(language, 'settings')}
          </h1>
          <p className="text-xs" style={acc}>
            Preferences, caregiver access, and system info
          </p>
        </div>
      </div>

      {/* Database Connection Status Banner */}
      <div
        className="rounded-2xl p-3.5 flex items-center justify-between border"
        style={
          isSupabaseLive
            ? isLight
              ? { backgroundColor: '#E4F6F1', borderColor: '#A8DFC9', color: '#096444' }
              : { backgroundColor: 'rgba(6,78,59,0.4)', borderColor: 'rgba(4,120,87,0.6)', color: '#6ee7b7' }
            : isLight
            ? { backgroundColor: '#E8F3FC', borderColor: '#B8D4EA', color: '#2B5F8A' }
            : { backgroundColor: 'rgba(30,58,138,0.4)', borderColor: 'rgba(37,99,235,0.4)', color: '#93c5fd' }
        }
      >
        <div className="flex items-center gap-2.5">
          <Database className="w-4 h-4 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">{isSupabaseLive ? 'Connected to Supabase' : 'Offline / Local Prototype Store'}</span>
            <p className="text-[11px] opacity-80">{isSupabaseLive ? 'Realtime subscriptions and cloud tables active.' : 'Operating with local database layer.'}</p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-current">
          {isSupabaseLive ? 'Cloud' : 'Local'}
        </span>
      </div>

      {/* Appearance / Theme */}
      <div className="rounded-3xl p-4 shadow-sm" style={card}>
        <div className="flex items-center gap-2 mb-2">
          {isLight ? <Sun className="w-4 h-4" style={acc} /> : <Moon className="w-4 h-4" style={acc} />}
          <h2 className="text-xs font-bold uppercase tracking-wider" style={acc}>
            Appearance
          </h2>
        </div>
        <p className="text-xs mb-3 leading-relaxed" style={md}>
          Choose between Clinical Mint light mode for day-time clarity and Dark Mode for low light.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setTheme('light')}
            className={`min-h-[46px] p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold transition cursor-pointer ${
              isLight ? 'shadow-sm' : ''
            }`}
            style={
              isLight
                ? { backgroundColor: '#00AFA3', color: '#ffffff' }
                : { backgroundColor: 'rgba(30,41,59,1)', border: '1px solid rgba(71,85,105,1)', color: '#94a3b8' }
            }
          >
            <Sun className="w-4 h-4" />
            <span>Clinical Mint (Light)</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`min-h-[46px] p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold transition cursor-pointer ${
              !isLight ? 'shadow-sm' : ''
            }`}
            style={
              !isLight
                ? { backgroundColor: '#0f766e', color: '#ffffff' }
                : { backgroundColor: '#E1F0F7', border: '1px solid #C5DCE8', color: '#587084' }
            }
          >
            <Moon className="w-4 h-4" />
            <span>Dark Slate</span>
          </button>
        </div>
      </div>

      {/* Language */}
      <div className="rounded-3xl p-4 shadow-sm" style={card}>
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4" style={acc} />
          <h2 className="text-xs font-bold uppercase tracking-wider" style={acc}>
            {t(language, 'language_select')}
          </h2>
        </div>
        <p className="text-xs mb-3 leading-relaxed" style={md}>
          Translate care instructions and tasks into your preferred regional language.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { code: 'en', label: 'English', sub: 'English' },
              { code: 'hi', label: 'हिंदी', sub: 'Hindi' },
              { code: 'ta', label: 'தமிழ்', sub: 'Tamil' },
            ] as const
          ).map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code as Language)}
              className="p-3 rounded-2xl text-center transition min-h-[58px] cursor-pointer"
              style={
                language === lang.code
                  ? { backgroundColor: isLight ? '#00AFA3' : '#0f766e', color: '#ffffff' }
                  : subCell
              }
            >
              <div className="font-bold text-xs" style={language === lang.code ? { color: '#ffffff' } : hd}>
                {lang.label}
              </div>
              <div className="text-[10px] mt-0.5" style={language === lang.code ? { color: 'rgba(255,255,255,0.8)' } : md}>
                {lang.sub}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Persona Switcher (Demo / Testing) */}
      <div className="rounded-3xl p-4 shadow-sm" style={card}>
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4" style={acc} />
          <h2 className="text-xs font-bold uppercase tracking-wider" style={acc}>
            Switch Persona (Simulation)
          </h2>
        </div>
        <p className="text-xs mb-3 leading-relaxed" style={md}>
          Toggle between primary patient view and caregiver delegate mode.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => switchPersona('usr_patient_lakshmi')}
            className="p-3 rounded-2xl text-left transition min-h-[64px] cursor-pointer"
            style={
              currentUser.role === 'patient'
                ? { backgroundColor: isLight ? '#00AFA3' : '#0f766e', color: '#ffffff' }
                : subCell
            }
          >
            <div className="text-xs font-bold" style={currentUser.role === 'patient' ? { color: '#ffffff' } : hd}>
              Lakshmi Devi
            </div>
            <div className="text-[10px] mt-0.5" style={currentUser.role === 'patient' ? { color: 'rgba(255,255,255,0.8)' } : md}>
              Primary Patient
            </div>
          </button>
          <button
            onClick={() => switchPersona('usr_caregiver_ramesh')}
            className="p-3 rounded-2xl text-left transition min-h-[64px] cursor-pointer"
            style={
              currentUser.role === 'caregiver'
                ? { backgroundColor: isLight ? '#00AFA3' : '#0f766e', color: '#ffffff' }
                : subCell
            }
          >
            <div className="text-xs font-bold" style={currentUser.role === 'caregiver' ? { color: '#ffffff' } : hd}>
              Ramesh Kumar
            </div>
            <div className="text-[10px] mt-0.5" style={currentUser.role === 'caregiver' ? { color: 'rgba(255,255,255,0.8)' } : md}>
              Caregiver (Son)
            </div>
          </button>
        </div>
      </div>

      {/* Caregiver Access Control (Only visible to Patient) */}
      {isPatientOwner && (
        <div className="rounded-3xl p-4 shadow-sm" style={card}>
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-4 h-4" style={acc} />
            <h2 className="text-xs font-bold uppercase tracking-wider" style={acc}>
              Caregiver Access Management
            </h2>
          </div>
          <p className="text-xs mb-3 leading-relaxed" style={md}>
            Manage family member permissions and task completion authority.
          </p>

          {/* Active linked caregiver */}
          <div className="p-3 rounded-2xl mb-3" style={subCell}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold" style={hd}>Ramesh Kumar</div>
                <div className="text-[11px]" style={md}>Relationship: Son (Active Link)</div>
              </div>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                style={isLight
                  ? { backgroundColor: '#E4F6F1', color: '#1A7A50' }
                  : { backgroundColor: 'rgba(6,78,59,0.6)', color: '#6ee7b7' }}
              >
                Active
              </span>
            </div>

            <div className="mt-3 pt-3 flex items-center justify-between border-t" style={div}>
              <div>
                <div className="text-xs font-semibold" style={hd}>Allow Marking Tasks Done</div>
                <div className="text-[10px]" style={md}>Caregiver can complete medicines & tasks</div>
              </div>
              <button
                onClick={() => handleToggleCaregiverMarkDone(!patientContext.canMarkDone)}
                className="min-h-[32px] px-3 rounded-xl text-xs font-bold transition cursor-pointer"
                style={
                  patientContext.canMarkDone
                    ? isLight
                      ? { backgroundColor: '#E4F6F1', color: '#1A7A50', border: '1px solid #A8DFC9' }
                      : { backgroundColor: 'rgba(6,78,59,0.8)', color: '#6ee7b7' }
                    : isLight
                    ? { backgroundColor: '#FFF5D9', color: '#C58A00', border: '1px solid #F5D57A' }
                    : { backgroundColor: 'rgba(120,53,15,0.8)', color: '#fcd34d' }
                }
              >
                {patientContext.canMarkDone ? 'Allowed' : 'View Only'}
              </button>
            </div>
          </div>

          {/* Pending access requests */}
          {pendingRequests.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider" style={acc}>
                Pending Access Requests
              </div>
              {pendingRequests.map((req) => (
                <div key={req.id} className="p-3 rounded-2xl flex items-center justify-between" style={subCell}>
                  <div>
                    <div className="text-xs font-bold" style={hd}>{req.caregiver_name}</div>
                    <div className="text-[11px]" style={md}>{req.relationship} ({req.caregiver_email})</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDecideRequest(req.id, 'approved')}
                      aria-label="Approve"
                      className="p-2 rounded-xl text-white transition cursor-pointer"
                      style={{ backgroundColor: '#00AFA3' }}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDecideRequest(req.id, 'denied')}
                      aria-label="Deny"
                      className="p-2 rounded-xl text-rose-300 transition cursor-pointer"
                      style={isLight ? { backgroundColor: '#FEE2E2', color: '#DC2626' } : { backgroundColor: 'rgba(127,29,29,0.6)' }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
              dataService.resetToDefault();
              notifyInfo('Demo state has been reset to factory defaults.', 'Reset Complete');
              refreshData();
            }
          }}
          className="w-full min-h-[44px] rounded-2xl flex items-center justify-center gap-2 text-xs transition cursor-pointer"
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
