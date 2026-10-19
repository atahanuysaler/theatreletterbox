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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = React.useRef(0);
  const auth = useAuthSafe();
  const user = auth?.user;
  const loginWithGoogle = auth?.loginWithGoogle;

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // When near the top, always show without sticky styling
      if (currentScrollY <= 20) {
        setIsVisible(true);
        setIsScrolled(false);
        lastScrollY.current = currentScrollY;
        return;
      }

      setIsScrolled(true);

      const diff = currentScrollY - lastScrollY.current;

      // Scrolling up (user scrolls towards the top): smoothly reveal header
      if (diff < -5) {
        setIsVisible(true);
      } else if (diff > 5 && currentScrollY > 80) {
        // Scrolling down past threshold: hide header to maximize reading area
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-transform duration-300 ease-out font-sans text-tn-text antialiased ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        } ${
          isScrolled
            ? 'bg-white/95 dark:bg-[#1C1A1B]/95 backdrop-blur-md shadow-xs border-b border-tn-line/40 py-2 sm:py-2.5'
            : 'bg-white dark:bg-tn-container sm:bg-transparent py-2.5 sm:py-3.5'
        }`}
      >
        <div className="w-full max-w-[1440px] mx-auto flex justify-between items-center gap-3 sm:gap-5 px-3 sm:px-4 md:px-5">
          {/* Left: Hamburger + Smooth Logo & Subtitle */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
          <button
            type="button"
            data-action="openMenu"
            aria-label="Menüyü aç"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
            className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-tn-surface hover:bg-tn-line border border-tn-line cursor-pointer flex items-center justify-center transition-all text-tn-text shadow-2xs active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <Link
            to="/"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('tiyatronot:reset-catalog'));
            }}
            className="flex items-center gap-2.5 sm:gap-3 text-tn-text no-underline hover:text-tn-red transition-colors cursor-pointer"
          >
            <img
              src="/logo.png"
              alt="Tiyatronot Logo"
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl object-contain flex-shrink-0 shadow-2xs"
            />
            <span className="font-display font-extrabold text-[26px] sm:text-[34px] tracking-[-0.035em] leading-none whitespace-nowrap">
              TİYATRO<span className="text-tn-red">·</span>NOT
            </span>
          </Link>
        </div>

        {/* Right: Exactly 3 buttons: Oyun Ekle, Not Ekle (Primary Red), Profil */}
        <div 
          className="flex justify-end gap-2 sm:gap-2.5 items-center flex-shrink-0 font-sans"
        >
          {/* 1. Oyun Ekle - Sleek black pill button (hidden on mobile) */}
          <Link
            to="/oyun-ekle"
            className="hidden sm:flex h-[38px] sm:h-10 px-4 rounded-full bg-tn-ink text-white hover:opacity-90 border border-transparent text-[13.5px] sm:text-[14px] font-sans font-medium items-center gap-1.5 sm:gap-2 transition-all no-underline whitespace-nowrap shadow-2xs hover:shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/90 stroke-[2] flex-shrink-0" />
            <span>Oyun Ekle</span>
          </Link>

          {/* 2. Not Ekle - Signature red primary action button (hidden on mobile since bottom navbar has dedicated (+) Not Ekle button) */}
          <button
            type="button"
            onClick={onOpenLogModal}
            className="hidden sm:flex h-[38px] sm:h-10 px-4 sm:px-4.5 rounded-full bg-tn-red hover:bg-[#A3161D] text-white border border-transparent text-[13.5px] sm:text-[14px] font-sans font-semibold items-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap shadow-xs hover:shadow-sm active:scale-[0.98]"
          >
            <PenLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/95 stroke-[2] flex-shrink-0" />
            <span>Not Ekle</span>
          </button>

          {/* 3. Profil - Subtle warm surface pill button (hidden on mobile, visible on desktop) */}
          {user ? (
            <Link
              to="/profil"
              className="hidden sm:flex h-[38px] sm:h-10 px-3.5 sm:px-4 rounded-full bg-tn-surface hover:bg-tn-line border border-tn-line text-tn-text text-[13px] sm:text-[13.5px] font-sans font-medium items-center gap-2 transition-all no-underline whitespace-nowrap shadow-2xs hover:shadow-xs active:scale-[0.98]"
            >
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'Profil'} 
                  className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full object-cover flex-shrink-0 border border-tn-line" 
                />
              ) : (
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-tn-text/75 stroke-[2] flex-shrink-0" />
              )}
              <span className="truncate max-w-[85px] sm:max-w-[110px]">{user.displayName?.split(' ')[0] || 'Profil'}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => loginWithGoogle?.()}
              className="hidden sm:flex h-[38px] sm:h-10 px-3.5 sm:px-4 rounded-full bg-tn-surface hover:bg-tn-line border border-tn-line text-tn-text text-[13px] sm:text-[13.5px] font-sans font-medium items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-2xs hover:shadow-xs active:scale-[0.98]"
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-tn-text/75 stroke-[2] flex-shrink-0" />
              <span>Profil</span>
            </button>
          )}
        </div>
        </div>
      </header>

      {/* Spacer to prevent layout shift with fixed header */}
      <div className="w-full h-[52px] sm:h-[68px] pointer-events-none" aria-hidden="true" />

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
