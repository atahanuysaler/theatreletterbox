import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#1C1A1B] text-white rounded-2xl p-6 sm:p-8 mt-6 font-serif">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-baseline gap-2.5">
            <span className="font-extrabold text-2xl tracking-tight leading-none text-white">
              TİYATRO<span className="text-tn-red">·</span>NOT
            </span>
            <span className="italic text-sm text-[#B8B0A8]">dijital oyun günlüğü</span>
          </div>
          <p className="mt-2 text-sm italic text-[#B8B0A8] max-w-md leading-relaxed">
            Türk tiyatrosunun bağımsız seyirci günlüğü ve açık sahne arşivi. Sahne deneyimlerini kaydet, biletlerini sakla, yeni oyunlar keşfet.
          </p>
        </div>

        {/* Links */}
        <nav aria-label="Alt menü" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#E2DCD4]">
          <Link to="/" className="hover:text-white transition-colors">Katalog</Link>
          <Link to="/izlediklerim" className="hover:text-white transition-colors">İzlediklerim</Link>
          <Link to="/listeler" className="hover:text-white transition-colors">Listeler</Link>
          <Link to="/bulmacalar" className="hover:text-white transition-colors">Bulmacalar</Link>
          <Link to="/liderler" className="hover:text-white transition-colors">Liderler</Link>
          <Link to="/oyun-ekle" className="hover:text-white transition-colors">Oyun Ekle</Link>
          <Link to="/iletisim" className="hover:text-white transition-colors">İletişim</Link>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto pt-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#8A847E]">
        <span>© {new Date().getFullYear()} Tiyatronot. Tüm hakları saklıdır.</span>
        <span className="italic">Kültür ve sahne sevgisiyle hazırlandı.</span>
      </div>
    </footer>
  );
};

export default Footer;
