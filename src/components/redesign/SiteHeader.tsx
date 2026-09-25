import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthSafe } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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

  let themeContext: ReturnType<typeof useTheme> | null = null;
  try {
    themeContext = useTheme();
  } catch {
    // optional fallback
  }

  const isDark = themeContext?.isDark ?? false;
  const toggleTheme = themeContext?.toggleTheme ?? (() => {});

  return (
    <>
      <header className="w-full flex justify-between items-center gap-3 sm:gap-5 py-2 sm:py-3.5 px-1 sm:px-1.5 font-serif text-tn-text">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            data-action="openMenu"
            aria-label="Menüyü aç"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
            className="flex-shrink-0 w-11 h-11 rounded-full bg-tn-surface border-none cursor-pointer flex items-center justify-center hover:bg-tn-border transition-colors text-tn-text"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <Link to="/" className="flex items-baseline gap-2 sm:gap-2.5 text-tn-text no-underline hover:text-tn-red transition-colors">
            <span className="font-extrabold text-2xl sm:text-[30px] tracking-tight leading-none whitespace-nowrap">
              TİYATRO<span className="text-tn-red">·</span>NOT
            </span>
            <span className="italic text-xs sm:text-[15px] text-tn-muted hidden xs:inline whitespace-nowrap">
              dijital oyun günlüğü
            </span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex justify-end gap-1.5 sm:gap-2 items-center flex-shrink-0">
          {/* Dark mode button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Aydınlık görünüm' : 'Karanlık görünüm'}
            className="w-10 sm:w-11 h-10 sm:h-11 rounded-full bg-tn-surface border-none cursor-pointer flex items-center justify-center hover:bg-tn-border transition-colors text-tn-text"
          >
            {isDark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            )}
          </button>

          {/* Desktop links */}
          <Link
            to="/oyun-ekle"
            className="hidden md:flex h-11 px-4 items-center rounded-full bg-tn-surface text-[15px] font-normal hover:bg-tn-border transition-colors text-tn-text no-underline whitespace-nowrap"
          >
            Oyun Ekle
          </Link>

          {user ? (
            <Link
              to="/profil"
              className="hidden sm:flex h-11 px-3 sm:px-4 items-center gap-2 rounded-full bg-tn-surface text-[15px] hover:bg-tn-border transition-colors text-tn-text no-underline whitespace-nowrap"
            >
              {user.photoURL && (
                <img src={user.photoURL} alt={user.displayName} className="w-5 h-5 rounded-full object-cover" />
              )}
              <span className="max-w-[100px] truncate">{user.displayName?.split(' ')[0] || 'Profil'}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => loginWithGoogle?.()}
              className="hidden sm:flex h-11 px-4 items-center rounded-full bg-tn-surface text-[15px] hover:bg-tn-border transition-colors text-tn-text cursor-pointer border-none whitespace-nowrap"
            >
              Giriş Yap
            </button>
          )}

          {/* Primary Action: Not Ekle */}
          <button
            type="button"
            onClick={onOpenLogModal}
            className="h-10 sm:h-11 px-3.5 sm:px-4.5 flex items-center rounded-full bg-tn-red text-white text-[15px] font-semibold hover:bg-tn-red/90 transition-colors cursor-pointer border-none whitespace-nowrap shadow-sm"
          >
            Not Ekle
          </button>
        </div>
      </header>

      {/* Drawer */}
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenLogModal={onOpenLogModal}
      />
    </>
  );
};

export default SiteHeader;
