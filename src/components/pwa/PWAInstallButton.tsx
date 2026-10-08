import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download, Share2, X, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { t } from '../../i18n/translations';

export const PWAInstallButton: React.FC<{ variant?: 'card' | 'compact' }> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { language } = useAuth();

  // If already installed, show small subtle status indicator if card variant
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="flex items-center gap-2 p-3 bg-teal-900/40 border border-teal-700/50 rounded-xl text-teal-200 text-xs">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>CarePlus is installed on your device.</span>
        </div>
      );
    }
    return null;
  }

  return (
    <>
      {isInstallable && (
        <button
          onClick={install}
          className={`flex items-center gap-2 font-medium transition-all active:scale-98 ${
            variant === 'card'
              ? 'w-full justify-center p-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-md text-sm'
              : 'px-3 py-1.5 bg-teal-600/90 hover:bg-teal-600 text-white text-xs rounded-lg'
          }`}
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>{t(language, 'install_pwa')}</span>
        </button>
      )}

      {isIOS && (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`flex items-center gap-2 font-medium transition-all active:scale-98 ${
              variant === 'card'
                ? 'w-full justify-center p-3.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-sm'
                : 'px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg'
            }`}
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>Install on iPhone / iPad</span>
          </button>

          {showIOSGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-base font-semibold">Install CarePlus on iOS</h3>
                  <button
                    onClick={() => setShowIOSGuide(false)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold">
                      1
                    </span>
                    <p>
                      Tap the <strong className="text-white">Share</strong> icon at the bottom of Safari.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold">
                      2
                    </span>
                    <p>
                      Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold">
                      3
                    </span>
                    <p>Launch CarePlus directly from your phone home screen like a native app.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="mt-6 w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm transition"
                >
                  {t(language, 'close')}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};
