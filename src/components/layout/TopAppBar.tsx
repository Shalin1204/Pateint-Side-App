import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Language } from '../../types';
import { AlertTriangle, Globe, User, Users, Check, ChevronDown } from 'lucide-react';
import { t } from '../../i18n/translations';

export const TopAppBar: React.FC = () => {
  const { patientContext, language, setLanguage, currentUser, switchPersona, setActiveSubRoute, activeSubRoute } = useAuth();
  const [isRoleOpen, setIsRoleOpen] = useState(false);

  const langs: { code: Language; label: string; short: string }[] = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिंदी', short: 'हिं' },
    { code: 'ta', label: 'தமிழ்', short: 'தமி' },
  ];

  const isCaregiver = patientContext.role === 'caregiver';

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-md border-b text-white no-print transition-colors duration-300"
      style={{
        backgroundColor: 'var(--cp-header-bg)',
        borderColor: 'var(--cp-header-border)',
        color: 'var(--cp-text)',
      }}
    >

      {/* Caregiver mode accent strip */}
      {isCaregiver && (
        <div className="bg-amber-950/90 border-b border-amber-800/50 px-3 py-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-amber-200 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="truncate">
              {t(language, 'viewing_patient_plan', { name: patientContext.patientName })}
            </span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-700/40 font-semibold shrink-0 ml-2">
            {patientContext.relationship || t(language, 'caregiver_badge')}
          </span>
        </div>
      )}

      {/* ── Row 1: Brand  +  User / Role pill ── */}
      <div className="px-3 pt-2.5 pb-1.5 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-sm shrink-0">
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-4h2v4zm0-6h-2V6h2v4z"/>
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold leading-tight text-white tracking-tight">CarePlus</div>
            <div className="text-[10px] text-teal-400 font-medium truncate leading-tight">
              {patientContext.patientName}
            </div>
          </div>
        </div>

        {/* Role / User pill — opens dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setIsRoleOpen(!isRoleOpen)}
            aria-label="Switch user persona"
            className={`flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-full border text-xs font-semibold transition-all ${
              isCaregiver
                ? 'bg-amber-950/70 border-amber-700/60 text-amber-200'
                : 'bg-teal-950/70 border-teal-700/60 text-teal-100'
            }`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
              isCaregiver ? 'bg-amber-500/20 text-amber-300' : 'bg-teal-500/20 text-teal-300'
            }`}>
              {isCaregiver ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
            </div>
            <span className="max-w-[72px] truncate">{currentUser.name.split(' ')[0]}</span>
            <ChevronDown className={`w-3 h-3 shrink-0 transition-transform duration-200 ${isRoleOpen ? 'rotate-180' : ''}`} />
          </button>

          {isRoleOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsRoleOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-700/80 p-1.5 shadow-2xl z-50">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                  Switch Persona
                </div>
                {[
                  { id: 'usr_patient_lakshmi', initials: 'LD', name: 'Lakshmi Devi', role: 'Patient (Self)', color: 'teal' },
                  { id: 'usr_caregiver_ramesh', initials: 'RK', name: 'Ramesh Kumar', role: 'Caregiver (Son)', color: 'amber' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { switchPersona(p.id as any); setIsRoleOpen(false); }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left mt-0.5 transition-all ${
                      currentUser.id === p.id
                        ? p.color === 'teal'
                          ? 'bg-teal-950/80 border border-teal-800/50'
                          : 'bg-amber-950/80 border border-amber-800/50'
                        : 'hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        p.color === 'teal' ? 'bg-teal-800/50 text-teal-300' : 'bg-amber-800/50 text-amber-300'
                      }`}>
                        {p.initials}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{p.name}</div>
                        <div className={`text-[11px] ${p.color === 'teal' ? 'text-teal-400' : 'text-amber-400'}`}>
                          {p.role}
                        </div>
                      </div>
                    </div>
                    {currentUser.id === p.id && (
                      <Check className={`w-4 h-4 shrink-0 ${p.color === 'teal' ? 'text-teal-400' : 'text-amber-400'}`} />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Row 2: Language pills  +  Warning Signs button ── */}
      <div className="px-3 pb-2 flex items-center justify-between gap-2">
        {/* Language switcher — compact pill group */}
        <div className="flex items-center gap-0.5 bg-slate-800/60 border border-slate-700/50 rounded-full p-0.5">
          <Globe className="w-3 h-3 text-slate-400 ml-1.5 mr-0.5 shrink-0" />
          {langs.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              aria-label={`Switch language to ${l.label}`}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all leading-none ${
                language === l.code
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {l.short}
            </button>
          ))}
        </div>

        {/* Warning Signs quick-access */}
        <button
          onClick={() => setActiveSubRoute('warning_signs')}
          aria-label="Warning signs and emergency alerts"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
            activeSubRoute === 'warning_signs'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-amber-950/50 border-amber-700/50 text-amber-300 hover:bg-amber-900/60'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Warning Signs</span>
        </button>
      </div>
    </header>
  );
};
