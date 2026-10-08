import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { dataService } from '../services/dataService';
import { useNotification } from './NotificationContext';
import {
  UserProfile,
  PatientContext,
  TabPermissions,
  Language,
  ActiveTab,
  SubRoute,
} from '../types';

export type AppTheme = 'dark' | 'light';

interface AuthContextType {
  currentUser: UserProfile;
  patientContext: PatientContext;
  tabPermissions: TabPermissions;
  language: Language;
  setLanguage: (lang: Language) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeSubRoute: SubRoute | null;
  setActiveSubRoute: (route: SubRoute | null) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  switchPersona: (userId: 'usr_patient_lakshmi' | 'usr_caregiver_ramesh') => void;
  isOnline: boolean;
  canSeeTab: (tab: ActiveTab) => boolean;
  canSeeSubRoute: (route: SubRoute) => boolean;
  refreshData: () => void;
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  isSupabaseLive: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState<string>('usr_patient_lakshmi');
  const [activeTab, setActiveTabState] = useState<ActiveTab>('today');
  const [activeSubRoute, setActiveSubRouteState] = useState<SubRoute | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [dbVersion, setDbVersion] = useState<number>(0);
  const [theme, setThemeState] = useState<AppTheme>(
    () => (localStorage.getItem('cp_theme') as AppTheme) || 'dark'
  );

  const { notifyInfo, notifyWarning } = useNotification();
  const isSupabaseLive = dataService.isUsingRealSupabase();

  const setTheme = useCallback((t: AppTheme) => {
    setThemeState(t);
    localStorage.setItem('cp_theme', t);
  }, []);

  // Synchronize route state with browser URL path and history
  useEffect(() => {
    const parseUrl = () => {
      const fullPath = window.location.pathname + window.location.hash;
      if (fullPath.includes('warning-signs')) {
        setActiveSubRouteState('warning_signs');
      } else if (fullPath.includes('tests')) {
        setActiveSubRouteState('tests');
      } else if (fullPath.includes('find-care')) {
        setActiveSubRouteState('find_care');
      } else if (fullPath.includes('reminders')) {
        setActiveSubRouteState('reminders');
      } else if (fullPath.includes('settings')) {
        setActiveSubRouteState('settings');
      } else if (fullPath.includes('print')) {
        setActiveSubRouteState('print');
      } else if (fullPath.includes('plan')) {
        setActiveTabState('plan');
        setActiveSubRouteState(null);
      } else if (fullPath.includes('medicines')) {
        setActiveTabState('medicines');
        setActiveSubRouteState(null);
      } else if (fullPath.includes('ask')) {
        setActiveTabState('ask');
        setActiveSubRouteState(null);
      } else if (fullPath.includes('more')) {
        setActiveTabState('more');
        setActiveSubRouteState(null);
      } else {
        setActiveTabState('today');
        setActiveSubRouteState(null);
      }
    };

    parseUrl();
    window.addEventListener('popstate', parseUrl);
    return () => window.removeEventListener('popstate', parseUrl);
  }, []);

  // Connectivity listeners with notification feedback
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      notifyInfo('Network connection restored.', 'Online');
    };
    const handleOffline = () => {
      setIsOnline(false);
      notifyWarning('You are currently offline. Cached care plan is available.', 'Offline Mode');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [notifyInfo, notifyWarning]);

  // Database subscription for real-time reactivity
  useEffect(() => {
    const unsubscribe = dataService.subscribe(() => {
      setDbVersion((v) => v + 1);
    }, 'pat_lakshmi_01');

    return () => {
      unsubscribe();
    };
  }, []);

  const refreshData = useCallback(() => {
    setDbVersion((v) => v + 1);
  }, []);

  // Loaded user profile state
  const [loadedUser, setLoadedUser] = useState<UserProfile | null>(null);
  const [loadedContext, setLoadedContext] = useState<PatientContext | null>(null);
  const [loadedPermissions, setLoadedPermissions] = useState<TabPermissions | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadIdentity() {
      const prof = await dataService.getProfile(currentUserId);
      const ctx = await dataService.resolvePatientContext(currentUserId);
      const perms = await dataService.getTabPermissions(currentUserId);

      if (isMounted) {
        if (prof) setLoadedUser(prof);
        if (ctx) setLoadedContext(ctx);
        if (perms) setLoadedPermissions(perms);
      }
    }

    loadIdentity();
    return () => {
      isMounted = false;
    };
  }, [currentUserId, dbVersion]);

  const currentUser = useMemo(() => {
    if (loadedUser) return loadedUser;
    return {
      id: currentUserId,
      name: currentUserId === 'usr_caregiver_ramesh' ? 'Ramesh Kumar' : 'Lakshmi Devi',
      role: currentUserId === 'usr_caregiver_ramesh' ? 'caregiver' : 'patient',
      preferred_language: 'en',
      email: currentUserId === 'usr_caregiver_ramesh' ? 'ramesh.kumar@example.com' : 'lakshmi.devi@example.com',
    } as UserProfile;
  }, [loadedUser, currentUserId]);

  const patientContext = useMemo(() => {
    if (loadedContext) return loadedContext;
    return {
      userId: currentUserId,
      role: currentUserId === 'usr_caregiver_ramesh' ? 'caregiver' : 'patient',
      patientId: 'pat_lakshmi_01',
      patientName: 'Lakshmi Devi',
      relationship: currentUserId === 'usr_caregiver_ramesh' ? 'Son' : undefined,
      canMarkDone: true,
      hospital: 'Apollo Speciality Hospitals, Greams Road',
      primaryDoctor: 'Dr. Anita Sharma, MD DM (Cardiology)',
      dischargeDate: '2026-10-04',
      dischargeDiagnosis: 'Post-PCI to LAD with Stent, Type 2 Diabetes Mellitus',
    } as PatientContext;
  }, [loadedContext, currentUserId]);

  const tabPermissions = useMemo(() => {
    if (loadedPermissions) return loadedPermissions;
    return {
      can_see_today: true,
      can_see_plan: true,
      can_see_medicines: true,
      can_see_ask: true,
      can_see_more: true,
      can_see_warning_signs: true,
      can_see_tests: true,
      can_see_find_care: true,
      can_see_reminders: true,
      can_mark_done: true,
    };
  }, [loadedPermissions]);

  const [language, setLanguageState] = useState<Language>(currentUser.preferred_language || 'en');

  useEffect(() => {
    setLanguageState(currentUser.preferred_language || 'en');
  }, [currentUser]);

  const setLanguage = useCallback(
    (lang: Language) => {
      setLanguageState(lang);
      dataService.updateProfileLanguage(currentUserId, lang);
    },
    [currentUserId]
  );

  const canSeeTab = useCallback(
    (tab: ActiveTab): boolean => {
      switch (tab) {
        case 'today':
          return tabPermissions.can_see_today;
        case 'plan':
          return tabPermissions.can_see_plan;
        case 'medicines':
          return tabPermissions.can_see_medicines;
        case 'ask':
          return tabPermissions.can_see_ask;
        case 'more':
          return tabPermissions.can_see_more;
        default:
          return true;
      }
    },
    [tabPermissions]
  );

  const canSeeSubRoute = useCallback(
    (route: SubRoute): boolean => {
      switch (route) {
        case 'warning_signs':
          return tabPermissions.can_see_warning_signs;
        case 'tests':
          return tabPermissions.can_see_tests;
        case 'find_care':
          return tabPermissions.can_see_find_care;
        case 'reminders':
          return tabPermissions.can_see_reminders;
        case 'settings':
        case 'print':
          return true;
        default:
          return true;
      }
    },
    [tabPermissions]
  );

  const setActiveTab = useCallback(
    (tab: ActiveTab) => {
      if (canSeeTab(tab)) {
        setActiveSubRouteState(null);
        setActiveTabState(tab);
        const url = tab === 'today' ? '/app' : `/app/${tab}`;
        try {
          window.history.pushState(null, '', url);
        } catch {
          // ignore
        }
      }
    },
    [canSeeTab]
  );

  const setActiveSubRoute = useCallback((route: SubRoute | null) => {
    setActiveSubRouteState(route);
    if (route) {
      const routeMap: Record<SubRoute, string> = {
        warning_signs: '/app/warning-signs',
        tests: '/app/tests',
        find_care: '/app/find-care',
        reminders: '/app/reminders',
        settings: '/app/settings',
        print: '/app/print',
      };
      try {
        window.history.pushState(null, '', routeMap[route]);
      } catch {
        // ignore
      }
    } else {
      try {
        window.history.pushState(null, '', '/app');
      } catch {
        // ignore
      }
    }
  }, []);

  const switchPersona = useCallback((userId: 'usr_patient_lakshmi' | 'usr_caregiver_ramesh') => {
    setSelectedTaskId(null);
    setActiveSubRouteState(null);
    setActiveTabState('today');
    setCurrentUserId(userId);
    try {
      window.history.pushState(null, '', '/app');
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        patientContext,
        tabPermissions,
        language,
        setLanguage,
        activeTab,
        setActiveTab,
        activeSubRoute,
        setActiveSubRoute,
        selectedTaskId,
        setSelectedTaskId,
        switchPersona,
        isOnline,
        canSeeTab,
        canSeeSubRoute,
        refreshData,
        theme,
        setTheme,
        isSupabaseLive,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
