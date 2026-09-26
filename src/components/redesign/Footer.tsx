import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="w-full mt-auto rounded-2xl bg-tn-ink text-white p-6 sm:p-7.5 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[200px] box-border font-serif">
      {/* Col 1: Brand & Slogan */}
      <div className="flex flex-col justify-between gap-4">
        <span className="italic text-base text-tn-on-dark-muted">
          Dijital tiyatro günlüğü &amp; topluluğu
        </span>
        <span className="font-extrabold text-4xl sm:text-[50px] leading-none tracking-tight">
          TİYATRO<span className="text-tn-red">·</span>NOT
        </span>
      </div>

      {/* Col 2: Navigation Links */}
      <nav
        aria-label="Alt gezinme"
        className="flex flex-col gap-2 text-base text-white/90"
      >
        <Link to="/" className="hover:text-tn-red transition-colors no-underline">
          Katalog
        </Link>
        <Link to="/izlediklerim" className="hover:text-tn-red transition-colors no-underline">
          İzlediklerim
        </Link>
        <Link to="/listeler" className="hover:text-tn-red transition-colors no-underline">
          Küratörlü Listeler
        </Link>
        <Link to="/bulmacalar" className="hover:text-tn-red transition-colors no-underline">
          Bulmacalar
        </Link>
        <Link to="/liderler" className="hover:text-tn-red transition-colors no-underline">
          Sahne Liderleri
        </Link>
        <Link to="/oyun-ekle" className="hover:text-tn-red transition-colors no-underline">
          Yeni Oyun Öner / Ekle
        </Link>
      </nav>

      {/* Col 3: Newsletter form */}
      <div className="flex flex-col gap-3 justify-center">
        <label htmlFor="newsletter-email" className="text-base italic text-white/90">
          Haftanın sahnelerini e-postana gönderelim
        </label>
        {isSubscribed ? (
          <div className="h-13 px-4 rounded-xl bg-white/10 flex items-center text-sm italic text-tn-sage">
            ✓ Teşekkürler! Bültene kaydınız alındı.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-1.5 p-1 pl-4 rounded-xl bg-white/[0.08] border border-white/10"
          >
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresin"
              className="flex-grow h-11 bg-transparent border-none text-white font-serif text-base placeholder:text-white/40 focus:outline-none"
            />
            <button
              type="submit"
              className="h-11 px-4.5 rounded-[10px] bg-white text-tn-ink font-semibold text-[15px] cursor-pointer hover:bg-white/90 transition-colors border-none flex-shrink-0"
            >
              Abone ol
            </button>
          </form>
        )}
      </div>
    </footer>
  );
};

export default Footer;
