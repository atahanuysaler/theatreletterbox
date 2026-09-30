import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, PenLine, User } from 'lucide-react';
import { useAuthSafe } from '../../context/AuthContext';
import SideMenu from './SideMenu';

interface SiteHeaderProps {
  onOpenLogModal: () => void;
  onOpenDailyQuote?: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  onOpenLogModal,
  onOpenDailyQuote,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const auth = useAuthSafe();
  const user = auth?.user;
  const loginWithGoogle = auth?.loginWithGoogle;

  return (
    <>
      <header className="w-full flex justify-between items-center gap-2.5 sm:gap-4 py-2 sm:py-3.5 px-0.5 sm:px-1 font-sans text-tn-text antialiased">
        {/* Left: Hamburger + Smooth Logo & Subtitle */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <button
            type="button"
            data-action="openMenu"
            aria-label="Menüyü aç"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
            className="flex-shrink-0 min-w-[40px] min-h-[40px] w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-tn-surface/90 border border-tn-line/50 cursor-pointer flex items-center justify-center hover:bg-tn-line transition-colors text-tn-text shadow-2xs"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <Link
            to="/"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('tiyatronot:reset-catalog'));
            }}
            className="flex items-center gap-2.5 sm:gap-3 text-tn-text no-underline hover:text-tn-red transition-colors cursor-pointer group"
          >
            <img
              src="/logo.png"
              alt="Tiyatronot Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-contain flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
            />
            <div className="flex items-baseline gap-2 sm:gap-2.5">
              <span className="font-bold text-[22px] sm:text-[27px] tracking-tight leading-none whitespace-nowrap">
                TİYATRO<span className="text-tn-red font-extrabold">·</span>NOT
              </span>
              <span className="font-serif italic text-xs sm:text-[13.5px] text-tn-muted hidden xs:inline whitespace-nowrap">
                dijital oyun günlüğü
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Exactly 3 buttons: Oyun Ekle (Black), Not Ekle (Red), Profil */}
        <div className="flex justify-end gap-1.5 sm:gap-2.5 items-center flex-shrink-0 font-sans">
          {/* 1. Oyun Ekle - Black Button with text next to icon (hidden on mobile) */}
          <Link
            to="/oyun-ekle"
            className="hidden sm:flex h-9.5 sm:h-10 px-3.5 sm:px-4.5 rounded-full bg-tn-ink text-white hover:bg-tn-ink/85 border-none font-sans text-[13px] sm:text-[14px] font-medium items-center gap-1.5 sm:gap-2 transition-all no-underline whitespace-nowrap shadow-2xs"
          >
            <Plus className="w-4 h-4 text-white flex-shrink-0" />
            <span>Oyun Ekle</span>
          </Link>

          {/* 2. Not Ekle - Red Button (hidden on mobile since bottom navbar has dedicated (+) Not Ekle button) */}
          <button
            type="button"
            onClick={onOpenLogModal}
            className="hidden sm:flex h-9.5 sm:h-10 px-3.5 sm:px-4.5 rounded-full bg-tn-red text-white hover:bg-tn-red/90 border-none font-sans text-[13px] sm:text-[14px] font-medium sm:font-semibold items-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap shadow-2xs"
          >
            <PenLine className="w-4 h-4 text-white flex-shrink-0" />
            <span>Not Ekle</span>
          </button>

          {/* 3. Profil (visible on mobile and desktop) */}
          {user ? (
            <Link
              to="/profil"
              className="flex h-8 sm:h-10 px-3 sm:px-3.5 rounded-full bg-[#F6F4FA] dark:bg-tn-surface/90 hover:bg-[#EDE8F5] dark:hover:bg-tn-surface border border-[#E3DCF0] dark:border-tn-line/50 text-tn-text font-sans text-[12px] sm:text-[13px] font-medium items-center gap-1.5 transition-all no-underline whitespace-nowrap shadow-2xs"
            >
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'Profil'} 
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover flex-shrink-0 border border-tn-line/40" 
                  style={{ width: '22px', height: '22px' }}
                />
              ) : (
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-tn-muted flex-shrink-0" />
              )}
              <span className="truncate max-w-[80px]">{user.displayName?.split(' ')[0] || 'Profil'}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => loginWithGoogle?.()}
              className="flex h-8 sm:h-10 px-3 sm:px-3.5 rounded-full bg-[#F6F4FA] dark:bg-tn-surface/90 hover:bg-[#EDE8F5] dark:hover:bg-tn-surface border border-[#E3DCF0] dark:border-tn-line/50 text-tn-text font-sans text-[12px] sm:text-[13px] font-medium items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-tn-muted flex-shrink-0" />
              <span>Profil</span>
            </button>
          )}
        </div>
      </header>

      {/* SideMenu Drawer */}
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenLogModal={onOpenLogModal}
      />
    </>
  );
};

export default SiteHeader;
