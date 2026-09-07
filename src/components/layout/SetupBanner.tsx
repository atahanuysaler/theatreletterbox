import React, { useState, useEffect } from 'react';
import { Sparkles, X, Terminal, LogIn } from 'lucide-react';
import { useAuthSafe } from '../../context/AuthContext';

export interface SetupBannerProps {
  isDemoMode?: boolean;
}

export const SetupBanner: React.FC<SetupBannerProps> = ({ isDemoMode: propIsDemoMode }) => {
  const authContext = useAuthSafe();
  const isDemo = propIsDemoMode !== undefined ? propIsDemoMode : (authContext?.isDemoMode ?? true);
  const [dismissed, setDismissed] = useState(false);

  // Clean console message prompting the user to run firebase login and set .env.local
  useEffect(() => {
    if (isDemo) {
      console.log('Tiyatronot is running in interactive LocalStorage demo mode. To connect Firebase, run firebase login and set .env.local');
    }
  }, [isDemo]);

  if (dismissed || !isDemo) {
    return null;
  }

  return (
    <aside 
      className="bg-layer-01 border-b border-border-subtle px-4 py-2 text-xs text-text-secondary"
      aria-label="Demo Modu Bildirimi"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-theatre-curtain bg-canvas px-2 py-0.5 border border-border-subtle rounded-none font-mono text-[11px]">
            <Sparkles className="w-3.5 h-3.5" />
            Demo Modu Aktif
          </span>
          <span className="hidden sm:inline text-text-tertiary">|</span>
          <span className="text-text-primary font-medium">
            Emir Can <span className="text-text-secondary font-normal">(Admin, 240 XP)</span> oturumuyla LocalStorage üzerinde çalışıyor.
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-text-tertiary bg-layer-02 px-2 py-0.5 rounded-none border border-border-subtle">
            <Terminal className="w-3 h-3 text-theatre-curtain" />
            .env.local hazır olduğunda Firebase otomatik bağlanacaktır.
          </span>
          <button
            type="button"
            onClick={() => authContext?.loginWithGoogle()}
            className="inline-flex items-center gap-1 font-mono text-[11px] text-text-primary hover:text-theatre-curtain bg-canvas px-2 py-0.5 rounded-none border border-border-subtle transition-colors cursor-pointer"
            title="Google hesabı ile giriş yap"
          >
            <LogIn className="w-3 h-3 text-theatre-curtain" />
            <span>Google ile Giriş Yap</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-text-tertiary hover:text-text-primary p-1 rounded-sm focus:outline-none transition-colors cursor-pointer"
          aria-label="Kapat"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};

export default SetupBanner;
