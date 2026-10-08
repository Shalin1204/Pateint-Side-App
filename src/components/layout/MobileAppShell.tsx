import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TopAppBar } from './TopAppBar';
import { BottomTabBar } from './BottomTabBar';
import { OfflineBanner } from './OfflineBanner';
import { TodayView } from '../../views/TodayView';
import { PlanView } from '../../views/PlanView';
import { MedicinesView } from '../../views/MedicinesView';
import { AskView } from '../../views/AskView';
import { MoreView } from '../../views/MoreView';
import { WarningSignsView } from '../../views/WarningSignsView';
import { TestsView } from '../../views/TestsView';
import { FindCareView } from '../../views/FindCareView';
import { RemindersView } from '../../views/RemindersView';
import { SettingsView } from '../../views/SettingsView';
import { PrintView } from '../../views/PrintView';

export const MobileAppShell: React.FC = () => {
  const { activeTab, activeSubRoute } = useAuth();

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [activeTab, activeSubRoute]);

  const renderActiveRoute = () => {
    // 1. SubRoutes (Secondary screens accessible from More or Top Bar)
    if (activeSubRoute) {
      switch (activeSubRoute) {
        case 'warning_signs':
          return <WarningSignsView />;
        case 'tests':
          return <TestsView />;
        case 'find_care':
          return <FindCareView />;
        case 'reminders':
          return <RemindersView />;
        case 'settings':
          return <SettingsView />;
        case 'print':
          return <PrintView />;
        default:
          break;
      }
    }

    // 2. Primary 5 Bottom Navigation Tabs
    switch (activeTab) {
      case 'today':
        return <TodayView />;
      case 'plan':
        return <PlanView />;
      case 'medicines':
        return <MedicinesView />;
      case 'ask':
        return <AskView />;
      case 'more':
        return <MoreView />;
      default:
        return <TodayView />;
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-slate-950 flex justify-center selection:bg-teal-500 selection:text-white">
      {/* Mobile App Viewport Canvas: 375px–430px target, 320px min, 768px tablet support */}
      <div className="w-full max-w-md min-h-[100dvh] flex flex-col bg-slate-950 border-x border-slate-900 relative shadow-2xl overflow-x-hidden">
        {/* Offline indicator banner */}
        <OfflineBanner />

        {/* Top Navigation Bar with RoleSwitcher, language toggle, and warning icon */}
        <TopAppBar />

        {/* Scrollable Viewport Content Area */}
        <main
          id="main-content"
          role="main"
          className="flex-1 px-4 pt-3 pb-20 overflow-y-auto no-scrollbar"
        >
          {renderActiveRoute()}
        </main>

        {/* Bottom Navigation Tab Bar (Maximum 5 tabs, permissions filtered) */}
        <BottomTabBar />
      </div>
    </div>
  );
};
