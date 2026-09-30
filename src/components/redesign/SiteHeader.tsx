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
      <header className="w-full flex justify-between items-center gap-3 sm:gap-5 py-3 sm:py-4 px-1 sm:px-2 font-sans text-tn-text antialiased">
        {/* Left: Hamburger + Smooth Logo & Subtitle */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            data-action="openMenu"
            aria-label="Menüyü aç"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
            className="flex-shrink-0 min-w-[42px] min-h-[42px] w-10.5 h-10.5 sm:w-12 sm:h-12 rounded-full bg-tn-surface/90 hover:bg-tn-line/70 border border-tn-line/60 cursor-pointer flex items-center justify-center transition-all text-tn-text shadow-xs hover:shadow-sm active:scale-95"
          >
            <svg width="20" height="20" className="sm:w-[22px] sm:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <Link
            to="/"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('tiyatronot:reset-catalog'));
            }}
            className="flex items-center gap-2.5 sm:gap-3.5 text-tn-text no-underline hover:text-tn-red transition-colors cursor-pointer group"
          >
            <img
              src="/logo.png"
              alt="Tiyatronot Logo"
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl object-contain flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-200"
            />
            <div className="flex items-baseline gap-2 sm:gap-3">
              <span className="font-bold text-[24px] sm:text-[31px] md:text-[33px] tracking-tight leading-none whitespace-nowrap text-tn-text">
                TİYATRO<span className="text-tn-red font-bold mx-0.5">·</span>NOT
              </span>
              <span className="font-serif italic text-xs sm:text-[14.5px] text-tn-muted hidden xs:inline whitespace-nowrap tracking-normal">
                dijital oyun günlüğü
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Exactly 3 buttons: Oyun Ekle (Black), Not Ekle (Red), Profil */}
        <div className="flex justify-end gap-2 sm:gap-3 items-center flex-shrink-0 font-sans">
          {/* 1. Oyun Ekle - Black Button with text next to icon (hidden on mobile) */}
          <Link
            to="/oyun-ekle"
            className="hidden sm:flex h-11 sm:h-12 px-4.5 sm:px-5.5 rounded-full bg-tn-ink text-white hover:bg-tn-ink/85 border-none font-sans text-[14px] sm:text-[15px] font-medium items-center gap-2 transition-all no-underline whitespace-nowrap shadow-xs hover:shadow-sm active:scale-95"
          >
            <Plus className="w-4.5 h-4.5 text-white flex-shrink-0 stroke-[2.2]" />
            <span>Oyun Ekle</span>
          </Link>

          {/* 2. Not Ekle - Red Button (hidden on mobile since bottom navbar has dedicated (+) Not Ekle button) */}
          <button
            type="button"
            onClick={onOpenLogModal}
            className="hidden sm:flex h-11 sm:h-12 px-4.5 sm:px-5.5 rounded-full bg-tn-red text-white hover:bg-tn-red/90 border-none font-sans text-[14px] sm:text-[15px] font-medium sm:font-semibold items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-xs hover:shadow-sm active:scale-95"
          >
            <PenLine className="w-4.5 h-4.5 text-white flex-shrink-0 stroke-[2.2]" />
            <span>Not Ekle</span>
          </button>

          {/* 3. Profil (visible on mobile and desktop) */}
          {user ? (
            <Link
              to="/profil"
              className="flex h-10 sm:h-12 px-3.5 sm:px-4.5 rounded-full bg-[#F4F1F9] dark:bg-tn-surface/90 hover:bg-[#EAE4F5] dark:hover:bg-tn-surface border border-[#DDD6EC] dark:border-tn-line/50 text-tn-text font-sans text-[13px] sm:text-[14.5px] font-medium items-center gap-2 transition-all no-underline whitespace-nowrap shadow-xs hover:shadow-sm active:scale-95"
            >
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'Profil'} 
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover flex-shrink-0 border border-tn-line/50 shadow-2xs" 
                  style={{ width: '26px', height: '26px' }}
                />
              ) : (
                <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-tn-muted flex-shrink-0 stroke-[2.2]" />
              )}
              <span className="truncate max-w-[90px] sm:max-w-[120px]">{user.displayName?.split(' ')[0] || 'Profil'}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => loginWithGoogle?.()}
              className="flex h-10 sm:h-12 px-3.5 sm:px-4.5 rounded-full bg-[#F4F1F9] dark:bg-tn-surface/90 hover:bg-[#EAE4F5] dark:hover:bg-tn-surface border border-[#DDD6EC] dark:border-tn-line/50 text-tn-text font-sans text-[13px] sm:text-[14.5px] font-medium items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-xs hover:shadow-sm active:scale-95"
            >
              <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-tn-muted flex-shrink-0 stroke-[2.2]" />
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
