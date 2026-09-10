import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { 
  Plus,
  PlusCircle, 
  Compass, 
  CheckCircle2, 
  Trophy, 
  Shield, 
  LogIn, 
  LogOut, 
  Puzzle, 
  X, 
  User as UserIcon,
  Bookmark,
  Library,
  Menu,
  Sun,
  Moon,
  BookOpen,
  StickyNote
} from 'lucide-react';
import { useAuthSafe } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onOpenLogModal?: () => void;
  onOpenDailyQuote?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogModal }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const isSidebarOpenRef = useRef(isSidebarOpen);
  const location = useLocation();
  const authContext = useAuthSafe();
  const user = authContext?.user;
  const { isDark, toggleTheme } = useTheme();

  // Sync isSidebarOpen ref and ensure header is visible when menu is opened
  useEffect(() => {
    isSidebarOpenRef.current = isSidebarOpen;
    if (isSidebarOpen) {
      setIsVisible(true);
    }
  }, [isSidebarOpen]);

  // Close sidebar and show header on route change
  useEffect(() => {
    setIsSidebarOpen(false);
    setIsVisible(true);
  }, [location.pathname]);

  // Dynamic header visibility on mobile scroll / swipe:
  // - Swiping/scrolling down -> slides away (-translate-y-full)
  // - Swiping/scrolling up -> slides back into view (translate-y-0)
  // - Near top of page (scrollY <= 20) -> always visible
  // - Desktop (sm: >= 640px) -> always visible (sm:translate-y-0)
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (isSidebarOpenRef.current) {
        ticking = false;
        return;
      }

      const currentScrollY = window.scrollY;

      // Always keep header visible when near or at the top of the page
      if (currentScrollY <= 20) {
        setIsVisible(true);
        lastScrollY = Math.max(0, currentScrollY);
        ticking = false;
        return;
      }

      // Avoid false triggers on iOS rubber-band overscroll at the bottom of the page
      const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScrollY > 0 && currentScrollY >= maxScrollY - 20) {
        ticking = false;
        return;
      }

      const diff = currentScrollY - lastScrollY;
      const threshold = 8; // Small threshold to avoid micro-jitter

      if (Math.abs(diff) > threshold) {
        if (diff > 0 && currentScrollY > 60) {
          // Scrolling / swiping down -> hide header on mobile
          setIsVisible(false);
        } else if (diff < 0) {
          // Scrolling / swiping up -> show header on mobile
          setIsVisible(true);
        }
        lastScrollY = currentScrollY;
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Lock background body scrolling when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };
    if (isSidebarOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  type VisibilityMode = 'all' | 'mobile-only' | 'desktop-only' | 'none';

  const getSidebarNavLinkClass = (visibility: VisibilityMode = 'all') => ({ isActive }: { isActive: boolean }) => {
    let displayClass = 'flex';
    if (visibility === 'mobile-only') {
      displayClass = 'flex sm:hidden';
    } else if (visibility === 'desktop-only') {
      displayClass = 'hidden sm:flex';
    } else if (visibility === 'none') {
      displayClass = 'hidden';
    }

    return `${displayClass} items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
      isActive
        ? 'bg-layer-02 text-theatre-curtain font-semibold border-l-2 border-theatre-curtain shadow-xs'
        : 'text-text-secondary hover:text-text-primary hover:bg-layer-01'
    }`;
  };

  const userInitials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'TN';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-30 bg-canvas/95 backdrop-blur-sm border-b border-border-subtle transition-transform duration-300 ease-in-out will-change-transform ${
          isVisible ? 'translate-y-0' : '-translate-y-full sm:translate-y-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-3 sm:gap-4">
            {/* Left: Menu Trigger, Brand & Logo */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Dedicated Menu Drawer Trigger */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-1.5 text-text-secondary hover:text-text-primary hover:bg-layer-01 active:bg-layer-02 rounded-lg transition-colors cursor-pointer flex items-center justify-center focus:outline-none shrink-0"
                title="Menüyü Aç"
                aria-label="Navigasyon Menüsünü Aç"
              >
                <Menu className="w-5 h-5 text-text-secondary" />
              </button>

              {/* Logo + Brand Name (Links to Home) */}
              <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer min-w-0">
                <img
                  src="/logo.png"
                  alt="Tiyatronot"
                  className="h-9 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-xs shrink-0"
                />
                <span className="font-serif font-black text-xl sm:text-2xl tracking-tighter text-text-primary group-hover:text-theatre-curtain transition-colors truncate">
                  TIYATRO·NOT
                </span>
              </Link>

              <span className="hidden md:inline-block text-[11px] font-mono tracking-widest text-text-tertiary uppercase pl-3 border-l border-border-subtle shrink-0">
                Dijital Oyun Günlüğü
              </span>
            </div>

            {/* Right: Model 3 Segmented Action Pill Group & User Capsule (Hidden on mobile) */}
            <div className="hidden sm:flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Segmented Action Capsule */}
              <div className="inline-flex items-center h-9 bg-layer-01 border border-border-subtle hover:border-border-strong rounded-lg p-0.5 shadow-xs transition-colors">
                {/* Bulmacalar */}
                <Link
                  to="/bulmacalar"
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 h-full text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-layer-02/80 active:bg-layer-02 rounded-md transition-all cursor-pointer"
                  title="Tiyatro Bulmacaları & Replik Tahmini"
                >
                  <Puzzle className="w-3.5 h-3.5 text-theatre-curtain" />
                  <span className="hidden sm:inline">Bulmacalar</span>
                </Link>

                <span className="w-px h-3.5 bg-border-subtle my-auto" />

                {/* Oyun Ekle */}
                <Link
                  to="/oyun-ekle"
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 h-full text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-layer-02/80 active:bg-layer-02 rounded-md transition-all cursor-pointer"
                  title="Yeni Oyun Öner / Ekle"
                >
                  <BookOpen className="w-3.5 h-3.5 text-text-tertiary" />
                  <span className="hidden sm:inline">Oyun Ekle</span>
                </Link>

                <span className="w-px h-3.5 bg-border-subtle my-auto" />

                {/* Primary CTA: Not Ekle */}
                <button
                  type="button"
                  onClick={onOpenLogModal}
                  className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 h-full text-xs font-semibold bg-theatre-curtain hover:bg-theatre-curtain-hover active:bg-theatre-curtain/90 text-white rounded-md transition-all cursor-pointer shadow-xs"
                  title="İzlediğin oyun hakkında not ekle"
                >
                  <StickyNote className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Not Ekle</span>
                </button>
              </div>

              {/* User Avatar Capsule or Login Button */}
              {user ? (
                <div className="flex items-center h-9 bg-layer-01 border border-border-subtle hover:border-border-strong rounded-lg p-0.5 shadow-xs transition-colors">
                  <Link
                    to="/profil"
                    className="flex items-center gap-2 px-2 h-full hover:bg-layer-02/80 rounded-md transition-colors cursor-pointer"
                    title={`${user.displayName} - Tiyatro Pasaportu`}
                  >
                    <div className="w-6 h-6 rounded-full bg-theatre-curtain/15 text-theatre-curtain text-[11px] font-bold flex items-center justify-center font-mono flex-shrink-0 border border-theatre-curtain/25">
                      {userInitials}
                    </div>
                    <div className="hidden lg:flex flex-col text-left leading-none">
                      <span className="text-xs font-semibold text-text-primary truncate max-w-[90px]">
                        {user.displayName}
                      </span>
                      <span className="text-[10px] font-mono text-text-tertiary mt-0.5">
                        {user.xp} XP
                      </span>
                    </div>
                  </Link>

                  <span className="w-px h-3.5 bg-border-subtle my-auto" />

                  <button
                    type="button"
                    onClick={() => authContext?.logout()}
                    className="px-2 h-full text-text-tertiary hover:text-theatre-curtain hover:bg-layer-02/80 rounded-md transition-colors cursor-pointer flex items-center justify-center"
                    title="Çıkış Yap"
                    aria-label="Oturumu Kapat"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => authContext?.loginWithGoogle()}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-layer-01 hover:bg-layer-02 text-xs font-medium text-text-primary border border-border-subtle hover:border-border-strong rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-theatre-curtain" />
                  <span className="hidden sm:inline">Giriş Yap</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      {/* Spacer to preserve normal document layout below fixed header */}
      <div className="h-16 sm:h-18 shrink-0 pointer-events-none" aria-hidden="true" />

      {/* Slide-out Navigation Drawer */}
      <div
        className={`fixed inset-0 z-50 flex transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none delay-300'
        }`}
        aria-hidden={!isSidebarOpen}
      >
        {/* Backdrop Scrim (Soft translucent shadow scrim keeping website visible) */}
        <div
          className={`fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ease-in-out cursor-pointer ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer Content with deep casting shadow */}
        <aside
          className={`relative w-72 sm:w-80 bg-canvas h-full shadow-2xl border-r border-border-subtle flex flex-col justify-between p-6 z-10 select-none transform transition-transform duration-300 ease-in-out will-change-transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-label="Ana Menü"
        >
          <div className="flex-1 overflow-y-auto pr-1 -mr-1">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-border-subtle">
              <Link
                to="/"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-2.5 group cursor-pointer"
                title="Ana Sayfaya Git"
              >
                <img
                  src="/logo.png"
                  alt="Tiyatronot"
                  className="w-8 h-8 object-contain transition-transform duration-200 group-hover:scale-105"
                />
                <span className="font-serif font-black text-lg tracking-tight text-text-primary group-hover:text-theatre-curtain transition-colors">
                  TIYATRO·NOT
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 text-text-secondary hover:text-text-primary rounded-sm hover:bg-layer-01 transition-colors cursor-pointer"
                aria-label="Menüyü Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1.5">
              {/* Oyun Kataloğu (Accessible via brand logo in header & drawer) */}
              <NavLink
                to="/"
                end
                className={getSidebarNavLinkClass('none')}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Compass className="w-4 h-4 text-theatre-curtain" />
                <span>Oyun Kataloğu</span>
              </NavLink>

              {/* İzlediklerim (Always accessible in sidebar) */}
              <NavLink
                to="/izlediklerim"
                className={getSidebarNavLinkClass('all')}
                onClick={() => setIsSidebarOpen(false)}
              >
                <CheckCircle2 className="w-4 h-4 text-theatre-curtain" />
                <span>İzlediklerim</span>
              </NavLink>

              {/* İzlemek İstediklerim (In neither bar -> always visible) */}
              <NavLink
                to="/izlemek-istediklerim"
                className={getSidebarNavLinkClass('all')}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Bookmark className="w-4 h-4 text-theatre-curtain" />
                <span>İzlemek İstediklerim</span>
              </NavLink>

              {/* Küratörlü Listeler (In neither bar -> always visible) */}
              <NavLink
                to="/listeler"
                className={getSidebarNavLinkClass('all')}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Library className="w-4 h-4 text-theatre-curtain" />
                <span>Küratörlü Listeler</span>
              </NavLink>

              {/* Bulmacalar (Accessible in sidebar) */}
              <NavLink
                to="/bulmacalar"
                className={getSidebarNavLinkClass('all')}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Puzzle className="w-4 h-4 text-theatre-curtain" />
                <div className="flex items-center justify-between flex-1">
                  <span>Bulmacalar</span>
                  <span className="text-[9px] font-mono bg-theatre-curtain/10 text-theatre-curtain px-1.5 py-0.2 rounded font-bold">
                    Yeni
                  </span>
                </div>
              </NavLink>

              {/* Sahne Liderleri (In mobile bottom dock -> desktop-only in sidebar) */}
              <NavLink
                to="/liderler"
                className={getSidebarNavLinkClass('desktop-only')}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Trophy className="w-4 h-4 text-theatre-curtain" />
                <span>Sahne Liderleri</span>
              </NavLink>

              {/* Tiyatro Pasaportu (In mobile bottom dock and desktop header user capsule) */}
              <NavLink
                to="/profil"
                className={getSidebarNavLinkClass('none')}
                onClick={() => setIsSidebarOpen(false)}
              >
                <UserIcon className="w-4 h-4 text-theatre-curtain" />
                <span>Tiyatro Pasaportu</span>
              </NavLink>

              {/* Oyun Ekle (In desktop header -> mobile-only in sidebar) */}
              <NavLink
                to="/oyun-ekle"
                className={getSidebarNavLinkClass('mobile-only')}
                onClick={() => setIsSidebarOpen(false)}
              >
                <BookOpen className="w-4 h-4 text-theatre-curtain" />
                <span>Oyun Ekle</span>
              </NavLink>

              {/* Yönetim Paneli (In neither bar -> always visible for admins) */}
              {user?.role === 'admin' && (
                <NavLink
                  to="/admin"
                  className={getSidebarNavLinkClass('all')}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Shield className="w-4 h-4 text-theatre-curtain" />
                  <span>Yönetim Paneli</span>
                </NavLink>
              )}
            </nav>
          </div>

          {/* Drawer Footer: Theme Toggle & User Status */}
          <div className="pt-4 border-t border-border-subtle space-y-3 flex-shrink-0">
            {/* Dark / Light Theme Mode Option */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono text-text-secondary">Görünüm</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-layer-01 hover:bg-layer-02 border border-border-subtle text-xs font-mono text-text-primary transition-colors cursor-pointer"
                title={isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-theatre-gold" />
                    <span>Aydınlık</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-text-secondary" />
                    <span>Karanlık</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] font-serif italic text-text-tertiary">
              Dijital Tiyatro Günlüğü & Topluluğu
            </p>
            {user ? (
              <div className="flex items-center justify-between text-xs bg-layer-01 p-2.5 rounded-sm border border-border-subtle">
                <div className="truncate pr-2">
                  <div className="font-semibold text-text-primary truncate">{user.displayName}</div>
                  <div className="text-[10px] font-mono text-text-tertiary">{user.xp} XP · {user.level}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    authContext?.logout();
                    setIsSidebarOpen(false);
                  }}
                  className="text-text-tertiary hover:text-theatre-curtain p-1 transition-colors cursor-pointer"
                  title="Çıkış Yap"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  authContext?.loginWithGoogle();
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium bg-theatre-curtain text-white rounded-sm hover:bg-theatre-curtain-hover transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Giriş Yap</span>
              </button>
            )}
          </div>
        </aside>
      </div>
    </>
  );
};

export default Header;
