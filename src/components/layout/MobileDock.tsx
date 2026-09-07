import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Compass, 
  CheckCircle2, 
  Plus, 
  Trophy, 
  Shield 
} from 'lucide-react';

interface MobileDockProps {
  onOpenLogModal?: () => void;
  onOpenDailyQuote?: () => void;
}

export const MobileDock: React.FC<MobileDockProps> = ({ onOpenLogModal, onOpenDailyQuote: _onOpenDailyQuote }) => {
  const dockLinkClass = ({ isActive }: { isActive: boolean }) =>
    `touch-target flex flex-col items-center justify-center w-full h-full py-1 text-[10px] font-sans transition-colors ${
      isActive 
        ? 'text-theatre-curtain font-semibold' 
        : 'text-text-secondary hover:text-text-primary'
    }`;

  return (
    <nav 
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-canvas/95 backdrop-blur-sm border-t border-border-subtle shadow-[0_-2px_10px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]"
      aria-label="Mobil Alt Navigasyon"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1 max-w-lg mx-auto">
        {/* 1. Keşfet / Katalog */}
        <NavLink to="/" end className={dockLinkClass}>
          <Compass className="w-5 h-5 mb-0.5" />
          <span>Keşfet</span>
        </NavLink>

        {/* 2. İzlediklerim */}
        <NavLink to="/izlediklerim" className={dockLinkClass}>
          <CheckCircle2 className="w-5 h-5 mb-0.5" />
          <span>İzlediklerim</span>
        </NavLink>

        {/* 3. Not Al [+] (Central Elevated CTA) */}
        <button
          type="button"
          onClick={onOpenLogModal}
          className="touch-target group flex flex-col items-center justify-center w-full h-full focus:outline-none"
          aria-label="Tiyatronot Al"
        >
          <div className="w-10 h-10 -mt-3 bg-theatre-curtain text-white rounded-sm flex items-center justify-center shadow-md group-hover:bg-theatre-curtain-hover group-active:scale-95 transition-all">
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-medium text-text-secondary mt-0.5">Not Al</span>
        </button>

        {/* 4. Liderler */}
        <NavLink to="/liderler" className={dockLinkClass}>
          <Trophy className="w-5 h-5 mb-0.5" />
          <span>Liderler</span>
        </NavLink>

        {/* 5. Yönetim / Profil */}
        <NavLink to="/admin" className={dockLinkClass}>
          <Shield className="w-5 h-5 mb-0.5" />
          <span>Yönetim</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default MobileDock;
