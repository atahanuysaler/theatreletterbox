import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border-subtle bg-layer-01 text-text-secondary text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Column 1: Brand & Editorial Identity */}
          <div className="md:col-span-2 space-y-2">
            <div className="font-serif font-bold text-lg text-text-primary tracking-tight">
              TIYATRO<span className="text-theatre-curtain font-black">·</span>NOT
            </div>
            <p className="text-text-secondary max-w-sm text-xs leading-relaxed">
              Türkiye tiyatro hafızası, kişisel dijital sahne not defteri ve tiyatrosever topluluğu. IBM Carbon Light tasarım sistemi ve editoryal tipografi ile geliştirilmiştir.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="font-serif font-semibold text-text-primary text-xs uppercase tracking-wider mb-2">
              Navigasyon
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/" className="hover:text-theatre-curtain transition-colors">
                  Oyun Kataloğu
                </Link>
              </li>
              <li>
                <Link to="/izlediklerim" className="hover:text-theatre-curtain transition-colors">
                  İzlediklerimi İşaretle
                </Link>
              </li>
              <li>
                <Link to="/liderler" className="hover:text-theatre-curtain transition-colors">
                  Sahne Liderleri
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-theatre-curtain transition-colors">
                  Yönetici Paneli
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Specifications */}
          <div>
            <h4 className="font-serif font-semibold text-text-primary text-xs uppercase tracking-wider mb-2">
              Tasarım & Mimari
            </h4>
            <ul className="space-y-1 font-mono text-[11px] text-text-tertiary">
              <li>IBM Carbon Tokens</li>
              <li>Newsreader & IBM Plex</li>
              <li>Remote Cloud Firestore</li>
              <li>CORS-Safe Story Canvas</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="editorial-divider pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-text-tertiary text-[11px]">
          <div>
            © 2026 Tiyatronot. Tüm hakları saklıdır.
          </div>
          <div className="font-mono">
            Sürüm: 1.0.0 (Milestone 1 — Layout Shell)
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
