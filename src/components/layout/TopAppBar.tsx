import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { RoleSwitcher } from '../common/RoleSwitcher';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { t } from '../../i18n/translations';

export const TopAppBar: React.FC = () => {
  const { patientContext, language, setActiveSubRoute, activeSubRoute } = useAuth();

  const handleOpenWarningSigns = () => {
    setActiveSubRoute('warning_signs');
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-teal-900/40 text-white transition-colors">
      {/* Caregiver Context Indicator if viewing as caregiver */}
      {patientContext.role === 'caregiver' && (
        <div className="bg-amber-950/80 border-b border-amber-800/60 px-4 py-1.5 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-1.5 font-medium truncate">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="truncate">
              {t(language, 'viewing_patient_plan', { name: patientContext.patientName })}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-900/70 text-amber-300 font-semibold text-[10px] border border-amber-700/50 shrink-0">
            {patientContext.relationship || t(language, 'caregiver_badge')}
          </span>
        </div>
      )}

      {/* Main Bar */}
      <div className="px-3.5 py-2.5 flex items-center justify-between gap-2 max-w-lg mx-auto">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-sm shrink-0">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-4h2v4zm0-6h-2V6h2v4z"/>
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1">
              <span>CarePlus</span>
            </div>
            <div className="text-[11px] text-teal-300/90 truncate font-medium">
              {patientContext.patientName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Warning Signs Icon (Always accessible, calm amber treatment) */}
          <button
            onClick={handleOpenWarningSigns}
            aria-label="Warning signs and emergency alerts"
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all ${
              activeSubRoute === 'warning_signs'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-amber-950/60 border border-amber-700/60 text-amber-300 hover:bg-amber-900/50 hover:text-amber-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </button>

          {/* Role Switcher */}
          <RoleSwitcher />
        </div>
      </div>
    </header>
  );
};
