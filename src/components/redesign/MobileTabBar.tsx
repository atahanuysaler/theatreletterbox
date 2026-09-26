import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface MobileTabBarProps {
  onOpenLogModal: () => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({ onOpenLogModal }) => {
  const location = useLocation();

  const isTabActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      aria-label="Mobil alt gezinme"
      className="md:hidden fixed bottom-2 left-2 right-2 max-w-[420px] mx-auto z-40 h-[76px] rounded-[22px] bg-white/85 dark:bg-tn-surface/85 backdrop-blur-[16px] shadow-bar border border-white/40 dark:border-tn-line/40 px-3 pb-[env(safe-area-inset-bottom)] box-border flex items-center justify-around font-serif text-tn-text"
    >
      {/* Katalog */}
      <Link
        to="/"
        className={`flex flex-col items-center gap-1 text-xs no-underline transition-colors ${
          isTabActive('/') ? 'text-tn-red font-bold' : 'text-tn-muted hover:text-tn-text'
        }`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="14" width="7" height="7" rx="2" />
          <rect x="3" y="14" width="7" height="7" rx="2" />
        </svg>
        <span>Katalog</span>
      </Link>

      {/* Biletlerim */}
      <Link
        to="/izlediklerim"
        className={`flex flex-col items-center gap-1 text-xs no-underline transition-colors ${
          isTabActive('/izlediklerim') ? 'text-tn-red font-bold' : 'text-tn-muted hover:text-tn-text'
        }`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
          <path d="M13 5v2M13 17v2M13 11v2" />
        </svg>
        <span>Biletlerim</span>
      </Link>

      {/* Center: Not Ekle (+) Button (56px) */}
      <button
        type="button"
        onClick={onOpenLogModal}
        aria-label="Not Ekle"
        className="-mt-5 w-14 h-14 rounded-full bg-tn-red text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer border-none flex-shrink-0"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {/* Bulmacalar */}
      <Link
        to="/bulmacalar"
        className={`flex flex-col items-center gap-1 text-xs no-underline transition-colors ${
          isTabActive('/bulmacalar') ? 'text-tn-red font-bold' : 'text-tn-muted hover:text-tn-text'
        }`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
        <span>Bulmacalar</span>
      </Link>

      {/* Profil */}
      <Link
        to="/profil"
        className={`flex flex-col items-center gap-1 text-xs no-underline transition-colors ${
          isTabActive('/profil') ? 'text-tn-red font-bold' : 'text-tn-muted hover:text-tn-text'
        }`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>Profil</span>
      </Link>
    </nav>
  );
};

export default MobileTabBar;
