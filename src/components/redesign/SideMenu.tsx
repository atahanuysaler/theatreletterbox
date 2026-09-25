import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { useAuthSafe } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogModal?: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  onOpenLogModal,
}) => {
  const location = useLocation();
  const auth = useAuthSafe();
  const user = auth?.user;
  const loginWithGoogle = auth?.loginWithGoogle;
  const logout = auth?.logout;

  let themeContext: ReturnType<typeof useTheme> | null = null;
  try {
    themeContext = useTheme();
  } catch {
    // optional fallback
  }

  const isDark = themeContext?.isDark ?? false;
  const toggleTheme = themeContext?.toggleTheme ?? (() => {});

  const drawerRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Esc key & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on open
    setTimeout(() => closeBtnRef.current?.focus(), 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navLinks = [
    { label: 'Katalog', path: '/' },
    { label: 'İzlediklerim', path: '/izlediklerim' },
    { label: 'İzlemek İstediklerim', path: '/izlemek-istediklerim' },
    { label: 'Küratörlü Listeler', path: '/listeler' },
    { label: 'Bulmacalar', path: '/bulmacalar', badge: 'YENİ' },
    { label: 'Sahne Liderleri', path: '/liderler' },
    { label: 'Yeni Oyun Öner / Ekle', path: '/oyun-ekle' },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ label: 'Yönetim Paneli (Admin)', path: '/admin' });
  }

  return createPortal(
    <div className="fixed inset-0 z-[999] overflow-hidden" role="dialog" aria-modal="true" aria-label="Yan Menü">
      {/* High-contrast Blur Backdrop */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Menüyü kapat"
        className="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-md border-none p-0 cursor-pointer transition-all duration-200"
      />

      {/* Drawer surface */}
      <aside
        ref={drawerRef}
        className="fixed top-2 left-2 bottom-2 w-[calc(100vw-16px)] sm:w-[380px] max-w-[380px] bg-tn-container rounded-[20px] shadow-drawer p-4 flex flex-col gap-1.5 font-serif text-tn-text border border-tn-line z-10 overflow-y-auto animate-in slide-in-from-left duration-200"
      >
        {/* Header with Logo */}
        <div className="flex justify-between items-center px-1 pt-1 pb-3">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Tiyatronot Logo" className="w-8 h-8 rounded-lg object-contain flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-extrabold text-[24px] tracking-tight leading-none text-tn-text">
                TİYATRO<span className="text-tn-red">·</span>NOT
              </span>
              <span className="italic text-xs text-tn-muted">dijital oyun günlüğü</span>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Menüyü kapat"
            className="w-11 h-11 rounded-full bg-tn-surface border-none flex items-center justify-center cursor-pointer text-tn-text hover:bg-tn-border transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Navigation items */}
        <nav aria-label="Yan menü bağlantıları" className="flex flex-col gap-0.5">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`h-12 px-3.5 flex items-center justify-between rounded-xl text-xl transition-colors ${
                  isActive
                    ? 'bg-tn-surface font-extrabold text-tn-text'
                    : 'bg-transparent font-normal text-tn-text hover:bg-tn-surface/60'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[11px] font-extrabold tracking-wider text-tn-red bg-tn-red/10 px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom utility section */}
        <div className="mt-auto flex flex-col gap-2.5 pt-3.5 border-t border-tn-border">
          {/* Theme switch */}
          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            onClick={toggleTheme}
            className="h-12 flex justify-between items-center bg-tn-surface rounded-xl px-3.5 text-[16px] text-tn-text cursor-pointer hover:bg-tn-border transition-colors border border-tn-line shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              {isDark ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-tn-red">
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-tn-muted">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                </svg>
              )}
              <span>
                <span className="italic text-tn-muted text-sm">Görünüm:</span>{' '}
                <span className="font-semibold text-tn-text">{isDark ? 'Karanlık' : 'Aydınlık'}</span>
              </span>
            </div>
            <span
              className={`w-11 h-[26px] rounded-full p-[3px] flex items-center transition-colors ${
                isDark ? 'bg-tn-red justify-end' : 'bg-tn-line-strong justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </span>
          </button>

          <span className="italic text-[14px] text-tn-muted px-1">
            Dijital Tiyatro Günlüğü & Topluluğu
          </span>

          {/* User Auth state */}
          {user ? (
            <div className="flex flex-col gap-2 pt-1">
              <Link
                to="/profil"
                onClick={onClose}
                className="h-12 flex items-center justify-center gap-2 rounded-xl bg-tn-surface text-tn-text font-semibold text-[17px] hover:bg-tn-border transition-colors border border-tn-line/40"
              >
                {user.photoURL && (
                  <img src={user.photoURL} alt={user.displayName} className="w-6 h-6 rounded-full object-cover" />
                )}
                <span>{user.displayName || 'Profilim'}</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout?.();
                  onClose();
                }}
                className="h-10 flex items-center justify-center rounded-xl text-sm italic text-tn-muted hover:text-tn-red transition-colors cursor-pointer border-none bg-transparent"
              >
                Çıkış Yap
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                loginWithGoogle?.();
                onClose();
              }}
              className="h-[50px] flex items-center justify-center rounded-xl bg-tn-red text-white text-[17px] font-semibold cursor-pointer hover:bg-tn-red/90 transition-colors border-none shadow-sm"
            >
              Giriş Yap
            </button>
          )}
        </div>
      </aside>
    </div>,
    document.body
  );
};

export default SideMenu;
