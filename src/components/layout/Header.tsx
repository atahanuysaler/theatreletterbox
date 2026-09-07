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
  LogIn
} from 'lucide-react';
import { useAuthSafe } from '../../context/AuthContext';

interface HeaderProps {
  onOpenLogModal?: () => void;
  onOpenDailyQuote?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogModal, onOpenDailyQuote: _onOpenDailyQuote }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const navigate = useNavigate();
  const authContext = useAuthSafe();
  const user = authContext?.user || null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `h-9 px-3 text-xs lg:text-sm font-medium rounded-sm flex items-center gap-1.5 transition-colors ${
      isActive
        ? 'text-theatre-curtain bg-layer-01 border-b-2 border-theatre-curtain font-semibold'
        : 'text-text-secondary hover:text-text-primary hover:bg-layer-01'
    }`;

  const userInitials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'EC';

  return (
    <header className="sticky top-0 z-30 bg-canvas border-b border-border-subtle">
      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left: Editorial Logo & Tagline */}
          <div className="flex items-center gap-3">
            <Link 
              to="/" 
              className="flex items-center group focus:outline-none"
              aria-label="Tiyatronot Ana Sayfa"
            >
              <span className="font-serif font-bold text-xl sm:text-2xl tracking-tight text-text-primary group-hover:text-theatre-curtain transition-colors">
                TIYATRO<span className="text-theatre-curtain font-black">·</span>NOT
              </span>
            </Link>
            <span className="hidden lg:inline-block text-[11px] font-mono tracking-widest text-text-tertiary uppercase pl-3 border-l border-border-subtle">
              Sahne Günlüğü & Tiyatro Notu
            </span>
          </div>

          {/* Center: Desktop Search Bar (Hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
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
          <div className="flex items-center gap-1 sm:gap-3">
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
              <NavLink to="/admin" className={navLinkClass}>
                <Shield className="w-4 h-4" />
                <span>Yönetim</span>
              </NavLink>
            </nav>

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

            {/* Dynamic User Pill / Login Button */}
            {user ? (
              <Link
                to="/admin"
                className="hidden md:flex items-center gap-2 pl-2 pr-3 py-1 bg-layer-01 hover:bg-layer-02 border border-border-subtle rounded-sm transition-colors"
                title={`${user.displayName} (${user.role === 'admin' ? 'Admin' : user.level}) - Oturum Açık`}
              >
                <div className="w-6 h-6 rounded-sm bg-theatre-curtain text-white text-[10px] font-bold flex items-center justify-center font-mono">
                  {userInitials}
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-xs font-semibold text-text-primary">{user.displayName}</span>
                  <span className="text-[10px] font-mono text-text-secondary">
                    {user.xp} XP · {user.role === 'admin' ? 'Admin' : user.level}
                  </span>
                </div>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => authContext?.loginWithGoogle()}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-layer-01 hover:bg-layer-02 border border-border-subtle text-xs font-medium text-text-primary rounded-sm transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-theatre-curtain" />
                <span>Giriş Yap</span>
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
