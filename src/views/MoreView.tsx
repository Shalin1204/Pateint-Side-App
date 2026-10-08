import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SubRoute } from '../types';
import { t } from '../i18n/translations';
import { AboutModal } from './AboutModal';
import {
  AlertTriangle,
  FileCheck,
  MapPin,
  Clock,
  Settings,
  Printer,
  Info,
  ChevronRight,
  Phone,
} from 'lucide-react';

export const MoreView: React.FC = () => {
  const { language, setActiveSubRoute, canSeeSubRoute } = useAuth();
  const [showAboutModal, setShowAboutModal] = useState(false);

  const menuItems: {
    id: SubRoute | 'about';
    labelKey: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    accent?: string;
  }[] = [
    {
      id: 'warning_signs',
      labelKey: 'warning_signs',
      description: 'Critical emergency signs and call 112',
      icon: AlertTriangle,
      accent: 'text-amber-400 bg-amber-950/70 border-amber-800/80',
    },
    {
      id: 'tests',
      labelKey: 'tests_results',
      description: 'Scheduled lab tests and released results',
      icon: FileCheck,
      accent: 'text-teal-400 bg-teal-950/70 border-teal-800/80',
    },
    {
      id: 'find_care',
      labelKey: 'find_care',
      description: 'Clinics, diagnostic labs, and pharmacies',
      icon: MapPin,
      accent: 'text-blue-400 bg-blue-950/70 border-blue-800/80',
    },
    {
      id: 'reminders',
      labelKey: 'reminders',
      description: 'Simulated WhatsApp and SMS notifications',
      icon: Clock,
      accent: 'text-purple-400 bg-purple-950/70 border-purple-800/80',
    },
    {
      id: 'settings',
      labelKey: 'settings',
      description: 'Language, caregiver access, and PWA setup',
      icon: Settings,
      accent: 'text-slate-300 bg-slate-800 border-slate-700',
    },
    {
      id: 'print',
      labelKey: 'print',
      description: 'A4 discharge summary document',
      icon: Printer,
      accent: 'text-slate-300 bg-slate-800 border-slate-700',
    },
    {
      id: 'about',
      labelKey: 'about',
      description: 'Clinical safety protocols and app information',
      icon: Info,
      accent: 'text-slate-300 bg-slate-800 border-slate-700',
    },
  ];

  const handleItemClick = (id: SubRoute | 'about') => {
    if (id === 'about') {
      setShowAboutModal(true);
    } else {
      setActiveSubRoute(id);
    }
  };

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      <div className="mb-2">
        <h1 className="text-lg font-bold text-white tracking-tight">More Options</h1>
        <p className="text-xs text-teal-300/80">Support, clinical records, and settings</p>
      </div>

      {/* Emergency Quick Dial Card */}
      <div className="rounded-2xl bg-amber-950/60 border border-amber-800/70 p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-900/80 flex items-center justify-center text-amber-300">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-200">Emergency Protocol</div>
            <div className="text-[11px] text-amber-300/80">National Emergency Services</div>
          </div>
        </div>
        <a
          href="tel:112"
          className="min-h-[40px] px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call 112</span>
        </a>
      </div>

      {/* Clean Mobile List Items */}
      <div className="rounded-3xl bg-slate-900 border border-teal-900/40 divide-y divide-slate-800/80 overflow-hidden shadow-sm">
        {menuItems.map((item) => {
          // If item is a subroute check permissions
          if (item.id !== 'about' && !canSeeSubRoute(item.id)) {
            return null;
          }

          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className="w-full min-h-[58px] p-3.5 flex items-center justify-between hover:bg-slate-800/60 transition text-left active:bg-slate-800"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                    item.accent || 'text-slate-300 bg-slate-800 border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white tracking-tight truncate">
                    {t(language, item.labelKey)}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {item.description}
                  </div>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
            </button>
          );
        })}
      </div>

      {showAboutModal && <AboutModal onClose={() => setShowAboutModal(false)} />}
    </div>
  );
};
