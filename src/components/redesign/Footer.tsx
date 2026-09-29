import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-auto rounded-2xl bg-tn-ink text-white p-6 sm:px-8 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 sm:gap-6 box-border font-serif">
      {/* Brand & Slogan */}
      <div className="flex flex-col sm:flex-row items-start sm:items-baseline gap-2 sm:gap-4">
        <span className="font-extrabold text-3xl sm:text-[40px] leading-none tracking-tight">
          TİYATRO<span className="text-tn-red">·</span>NOT
        </span>
        <span className="italic text-sm sm:text-base text-tn-on-dark-muted">
          Dijital tiyatro günlüğü &amp; topluluğu
        </span>
      </div>

      {/* Right: Single button to 'İletişim' */}
      <div className="flex items-center">
        <Link
          to="/iletisim"
          className="h-11 px-7 rounded-[11px] bg-white text-tn-ink font-semibold text-[15px] inline-flex items-center justify-center hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all no-underline shadow-sm"
        >
          İletişim
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
