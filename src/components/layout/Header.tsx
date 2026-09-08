import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Compass, 
  CheckCircle2, 
  Trophy, 
  Shield, 
  X,
  LogIn,
  LogOut
} from 'lucide-react';
import { useAuthSafe } from '../../context/AuthContext';

interface HeaderProps {
  onOpenLogModal?: () => void;
  onOpenDailyQuote?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogModal, onOpenDailyQuote }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const navigate = useNavigate();
  const authContext = useAuthSafe();
  const user = authContext?.user;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
    } else {
      navigate('/');
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
      isActive
        ? 'bg-layer-01 text-theatre-curtain font-semibold'
        : 'text-text-secondary hover:text-text-primary hover:bg-layer-01'
    }`;

  const userInitials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'TN';

  return (
    <header className="sticky top-0 z-30 bg-canvas/95 backdrop-blur-sm border-b border-border-subtle">
      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Left: Brand Identity & Sub-title */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 group cursor-pointer">
              <span className="w-2.5 h-2.5 bg-theatre-curtain rounded-full group-hover:scale-125 transition-transform" />
              <span className="font-serif font-black text-lg sm:text-xl tracking-tighter text-text-primary group-hover:text-theatre-curtain transition-colors">
                TIYATRO·NOT
              </span>
            </Link>
            <span className="hidden lg:inline-block text-[11px] font-mono tracking-widest text-text-tertiary uppercase pl-3 border-l border-border-subtle">
              Sahne Günlüğü & Tiyatro Notu
            </span>
          </div>

          {/* Center: Desktop Search Bar (Hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Oyun, yazar veya sahne ara..."
                className="w-full bg-layer-01 border border-border-subtle hover:border-border-strong focus:border-theatre-curtain text-xs sm:text-sm pl-9 pr-14 py-1.5 rounded-sm outline-none transition-colors text-text-primary placeholder:text-text-tertiary font-sans"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-text-tertiary bg-canvas border border-border-subtle px-1.5 py-0.5 rounded-none font-mono pointer-events-none">
                ⌘K
              </kbd>
            </form>
          </div>

          {/* Right: Desktop Navigation Links & Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Desktop Nav Links */}
            <nav className="hidden sm:flex items-center gap-1">
              <NavLink to="/" end className={navLinkClass}>
                <Compass className="w-4 h-4" />
                <span>Oyunlar</span>
              </NavLink>
              <NavLink to="/izlediklerim" className={navLinkClass}>
                <CheckCircle2 className="w-4 h-4" />
                <span>İzlediklerim</span>
              </NavLink>
              <NavLink to="/liderler" className={navLinkClass}>
                <Trophy className="w-4 h-4" />
                <span>Liderler</span>
              </NavLink>
              {onOpenDailyQuote && (
                <button
                  type="button"
                  onClick={onOpenDailyQuote}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-theatre-curtain hover:bg-layer-01 rounded-sm transition-colors cursor-pointer"
                  title="Günün Repliği Bulmacasını Çöz (+30 XP)"
                >
                  <span className="text-sm">🎭</span>
                  <span className="hidden lg:inline">Günün Repliği</span>
                  <span className="text-[9px] font-mono bg-theatre-curtain/10 text-theatre-curtain px-1 py-0.2 rounded font-bold">+30 XP</span>
                </button>
              )}
              {user?.role === 'admin' && (
                <NavLink to="/admin" className={navLinkClass}>
                  <Shield className="w-4 h-4" />
                  <span>Yönetim</span>
                </NavLink>
              )}
            </nav>

            {/* Mobile Daily Quote button */}
            {onOpenDailyQuote && (
              <button
                type="button"
                onClick={onOpenDailyQuote}
                className="sm:hidden touch-target p-2 text-theatre-curtain rounded-sm cursor-pointer text-base"
                title="Günün Repliği"
                aria-label="Günün Repliği Bulmacası"
              >
                🎭
              </button>
            )}

            {/* Mobile Search Icon Toggle (< 640px) */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="sm:hidden touch-target p-2 text-text-secondary hover:text-text-primary rounded-sm cursor-pointer"
              aria-label="Arama Yap"
            >
              {isMobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            {/* Desktop Primary CTA: Not Al */}
            <button
              type="button"
              onClick={onOpenLogModal}
              className="hidden sm:inline-flex items-center gap-1.5 bg-theatre-curtain hover:bg-theatre-curtain-hover active:bg-theatre-curtain/90 text-text-inverse px-3 py-1.5 text-xs font-medium rounded-sm shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>Not Al</span>
            </button>

            {/* Dynamic User Pill & Signout / Login Button */}
            {user ? (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Link
                  to="/profil"
                  className="flex items-center gap-2 pl-2 pr-2.5 sm:pr-3 py-1 bg-layer-01 hover:bg-layer-02 border border-border-subtle rounded-sm transition-colors cursor-pointer"
                  title={`${user.displayName} - Tiyatro Pasaportu`}
                >
                  <div className="w-6 h-6 rounded-sm bg-theatre-curtain text-white text-[10px] font-bold flex items-center justify-center font-mono flex-shrink-0">
                    {userInitials}
                  </div>
                  <div className="hidden md:flex flex-col text-left leading-none">
                    <span className="text-xs font-semibold text-text-primary truncate max-w-[120px]">{user.displayName}</span>
                    <span className="text-[10px] font-mono text-text-secondary">
                      {user.xp} XP · {user.role === 'admin' ? 'Admin' : user.level}
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => authContext?.logout()}
                  className="touch-target sm:touch-auto flex items-center justify-center p-1.5 bg-layer-01 hover:bg-layer-02 hover:text-theatre-curtain border border-border-subtle rounded-sm text-text-secondary transition-colors cursor-pointer"
                  title="Çıkış Yap"
                  aria-label="Oturumu Kapat"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => authContext?.loginWithGoogle()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-layer-01 hover:bg-layer-02 border border-border-subtle text-xs font-medium text-text-primary rounded-sm transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-theatre-curtain" />
                <span className="hidden sm:inline">Giriş Yap</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Search Input */}
        {isMobileSearchOpen && (
          <div className="sm:hidden py-2 px-1 border-t border-border-subtle bg-layer-01">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Oyun, yazar veya sahne ara..."
                className="w-full bg-canvas border border-border-subtle focus:border-theatre-curtain text-xs pl-9 pr-3 py-2 rounded-sm outline-none font-sans"
              />
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
