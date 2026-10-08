import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ActiveTab } from '../../types';
import { Calendar, CheckCircle2, Pill, MessageSquare, MoreHorizontal } from 'lucide-react';
import { t } from '../../i18n/translations';

interface TabConfig {
  id: ActiveTab;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const BottomTabBar: React.FC = () => {
  const { activeTab, setActiveTab, canSeeTab, language, activeSubRoute } = useAuth();

  const allTabs: TabConfig[] = [
    { id: 'today', labelKey: 'today', icon: CheckCircle2 },
    { id: 'plan', labelKey: 'plan', icon: Calendar },
    { id: 'medicines', labelKey: 'medicines', icon: Pill },
    { id: 'ask', labelKey: 'ask', icon: MessageSquare },
    { id: 'more', labelKey: 'more', icon: MoreHorizontal },
  ];

  // REMOVE tabs that are hidden by permissions (Do NOT show disabled grey tab)
  const visibleTabs = allTabs.filter((tab) => canSeeTab(tab.id)).slice(0, 5);

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-teal-900/50 pb-safe shadow-lg no-print"
    >
      <div className="max-w-lg mx-auto grid grid-flow-col auto-cols-fr items-center h-16 px-1">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id && activeSubRoute === null;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-label={t(language, tab.labelKey)}
              className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-all active:scale-95 ${
                isActive ? 'text-teal-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive ? 'bg-teal-500/15 text-teal-300' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] leading-tight tracking-tight mt-0.5">
                {t(language, tab.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
