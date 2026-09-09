import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
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
  const authContext = useAuthSafe();
  const user = authContext?.user;
  const { isDark, toggleTheme } = useTheme();

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

  const sidebarNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
      isActive
        ? 'bg-layer-02 text-theatre-curtain font-semibold border-l-2 border-theatre-curtain shadow-xs'
        : 'text-text-secondary hover:text-text-primary hover:bg-layer-01'
    }`;

  const userInitials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'TN';

  return (
    <>
      <header className="sticky top-0 z-30 bg-canvas/95 backdrop-blur-sm border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-3 sm:gap-4">
            {/* Left: Menu Trigger, Brand & Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Dedicated Menu Drawer Trigger */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-1.5 text-text-secondary hover:text-text-primary hover:bg-layer-01 active:bg-layer-02 rounded-lg transition-colors cursor-pointer flex items-center justify-center focus:outline-none"
                title="Menüyü Aç"
                aria-label="Navigasyon Menüsünü Aç"
              >
                <Menu className="w-5 h-5 text-text-secondary" />
              </button>

              {/* Logo + Brand Name (Links to Home) */}
              <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
                <img
                  src="/logo.png"
                  alt="Tiyatronot"
                  className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-xs"
                />
                <span className="font-serif font-black text-xl sm:text-2xl tracking-tighter text-text-primary group-hover:text-theatre-curtain transition-colors">
                  TIYATRO·NOT
                </span>
              </Link>

              <span className="hidden md:inline-block text-[11px] font-mono tracking-widest text-text-tertiary uppercase pl-3 border-l border-border-subtle">
                Dijital Oyun Günlüğü
              </span>
            </div>

            {/* Right: Model 3 Segmented Action Pill Group & User Capsule */}
            <div className="flex items-center gap-2 sm:gap-3">
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

      {/* Slide-out Navigation Drawer (Triggered by the Red Dot) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Scrim (Soft translucent shadow scrim keeping website visible) */}
          <div
            className="fixed inset-0 bg-black/25 dark:bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 cursor-pointer"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content with deep casting shadow */}
          <aside
            className="relative w-72 sm:w-80 bg-canvas h-full shadow-2xl border-r border-border-subtle flex flex-col justify-between p-6 z-10 animate-fade-in select-none"
            aria-label="Ana Menü"
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/logo.png"
                    alt="Tiyatronot"
                    className="w-8 h-8 object-contain"
                  />
                  <span className="font-serif font-black text-lg tracking-tight text-text-primary">
                    TIYATRO·NOT
                  </span>
                </div>
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
                <NavLink
                  to="/"
                  end
                  className={sidebarNavLinkClass}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Compass className="w-4 h-4 text-theatre-curtain" />
                  <span>Oyun Kataloğu</span>
                </NavLink>

                <NavLink
                  to="/izlediklerim"
                  className={sidebarNavLinkClass}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <CheckCircle2 className="w-4 h-4 text-theatre-curtain" />
                  <span>İzlediklerim</span>
                </NavLink>

                <NavLink
                  to="/izlemek-istediklerim"
                  className={sidebarNavLinkClass}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Bookmark className="w-4 h-4 text-theatre-curtain" />
                  <span>İzlemek İstediklerim</span>
                </NavLink>

                <NavLink
                  to="/listeler"
                  className={sidebarNavLinkClass}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Library className="w-4 h-4 text-theatre-curtain" />
                  <span>Küratörlü Listeler</span>
                </NavLink>

                <NavLink
                  to="/bulmacalar"
                  className={sidebarNavLinkClass}
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

                <NavLink
                  to="/liderler"
                  className={sidebarNavLinkClass}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Trophy className="w-4 h-4 text-theatre-curtain" />
                  <span>Sahne Liderleri</span>
                </NavLink>

                <NavLink
                  to="/profil"
                  className={sidebarNavLinkClass}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <UserIcon className="w-4 h-4 text-theatre-curtain" />
                  <span>Tiyatro Pasaportu</span>
                </NavLink>

                <NavLink
                  to="/oyun-ekle"
                  className={sidebarNavLinkClass}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <BookOpen className="w-4 h-4 text-theatre-curtain" />
                  <span>Oyun Ekle</span>
                </NavLink>

                {user?.role === 'admin' && (
                  <NavLink
                    to="/admin"
                    className={sidebarNavLinkClass}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Shield className="w-4 h-4 text-theatre-curtain" />
                    <span>Yönetim Paneli</span>
                  </NavLink>
                )}
              </nav>
            </div>

            {/* Drawer Footer: Theme Toggle & User Status */}
            <div className="pt-4 border-t border-border-subtle space-y-3">
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
      )}
    </>
  );
};

export default Header;
