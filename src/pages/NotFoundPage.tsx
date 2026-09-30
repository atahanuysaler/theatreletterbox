import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="w-full py-4 sm:py-6 font-serif">
      {/* 404 Stage Box with Deep Red & Pinstripe Stage Curtain effect */}
      <div
        className="w-full rounded-2xl p-8 sm:p-14 sm:py-20 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[500px]"
        style={{
          backgroundColor: '#9A2121',
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.12) 0px, rgba(0, 0, 0, 0.12) 2px, transparent 2px, transparent 36px)',
        }}
      >
        <div className="flex flex-col gap-3 max-w-2xl z-10">
          <span className="text-xs font-extrabold tracking-widest uppercase text-white/80">
            HATA 404 · SAYFA BULUNAMADI
          </span>

          <div className="font-extrabold text-[96px] sm:text-[140px] leading-[0.88] tracking-tight text-white select-none">
            404
          </div>

          <h1 className="m-0 mt-2 font-normal text-3xl sm:text-5xl leading-tight tracking-tight text-white">
            <span className="font-extrabold">Perde</span> <span className="italic font-normal">kapandı.</span>
          </h1>

          <p className="m-0 text-sm sm:text-lg italic text-white/90 leading-relaxed max-w-xl pt-1">
            Aradığın sayfa sahneden inmiş ya da hiç sahnelenmemiş olabilir. Bağlantıyı kontrol et veya fuayeye dön.
          </p>
        </div>

        {/* Action buttons on bottom */}
        <div className="flex flex-wrap items-center gap-3 pt-8 z-10">
          <Link
            to="/katalog"
            className="h-10 sm:h-11 px-6 rounded-full bg-white text-tn-text font-serif text-sm font-semibold flex items-center justify-center hover:bg-white/90 transition-all no-underline shadow-xs"
          >
            Kataloğa Dön
          </Link>

          <Link
            to="/bulmacalar"
            className="h-10 sm:h-11 px-5 rounded-full border border-white/40 bg-white/5 hover:bg-white/15 text-white font-serif text-sm font-semibold flex items-center justify-center transition-all no-underline backdrop-blur-xs"
          >
            Günün Başlığı'nı Çöz
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
