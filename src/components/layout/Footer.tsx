import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border-subtle bg-layer-01 text-text-secondary text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand Identity & Tagline */}
          <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2 sm:gap-3 text-center sm:text-left">
            <Link
              to="/"
              className="font-serif font-bold text-base text-text-primary tracking-tight hover:text-theatre-curtain transition-colors"
            >
              TIYATRO<span className="text-theatre-curtain font-black">·</span>NOT
            </Link>
            <span className="hidden sm:inline text-border-subtle">·</span>
            <span className="text-text-tertiary text-xs font-serif italic">
              Dijital Tiyatro Günlüğü
            </span>
          </div>

          {/* Simple Clean Navigation */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-mono" aria-label="Altbilgi Gezintisi">
            <Link to="/" className="hover:text-theatre-curtain transition-colors">
              Oyun Kataloğu
            </Link>
            <Link to="/izlediklerim" className="hover:text-theatre-curtain transition-colors">
              İzlediklerim
            </Link>
            <Link to="/bulmacalar" className="hover:text-theatre-curtain transition-colors">
              Bulmacalar
            </Link>
            <Link to="/oyun-ekle" className="hover:text-theatre-curtain transition-colors">
              Oyun Ekle
            </Link>
            <Link to="/iletisim" className="hover:text-theatre-curtain transition-colors">
              İletişim
            </Link>
          </nav>
        </div>

        {/* Copyright */}
        <div className="border-t border-border-subtle/60 mt-5 pt-4 text-center text-[11px] text-text-tertiary font-mono">
          © {new Date().getFullYear()} Tiyatronot. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
