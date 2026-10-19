import React from 'react';
import { Link } from 'react-router-dom';

interface CuratedListCardProps {
  id?: string;
  category?: string;
  playCount?: number;
  title: string;
  description?: string;
  curator?: string;
  colorVariant?: 'ink' | 'lilac' | 'sage' | 'red';
}

export const CuratedListCard: React.FC<CuratedListCardProps> = ({
  id,
  title,
  colorVariant = 'ink',
}) => {
  // Format title to match mockup short titles if matching known IDs
  const displayTitle = React.useMemo(() => {
    if (id === 'kadikoy-sahneleri' || title.toLowerCase().includes('kadıköy')) {
      return (
        <>
          Kadıköy'de<br />bu sezon
        </>
      );
    }
    if (id === 'tek-kisilik-dev-kadrolar' || title.toLowerCase().includes('tek kişilik')) {
      return (
        <>
          Tek kişilik dev<br />performanslar
        </>
      );
    }
    if (id === 'dunya-klasikleri-modern-yorum' || title.toLowerCase().includes('klasik')) {
      return (
        <>
          Klasiklere<br />yeni<br />yorumlar
        </>
      );
    }
    if (id === 'cagdas-turk-metinleri' || title.toLowerCase().includes('çağdaş')) {
      return (
        <>
          Çağdaş Türk<br />tiyatrosu
        </>
      );
    }
    return title;
  }, [id, title]);

  // Specific visual styling per colorVariant
  if (colorVariant === 'ink') {
    return (
      <Link
        to={id ? `/listeler#${id}` : '/listeler'}
        className="rounded-[16px] sm:rounded-[24px] p-3.5 sm:p-5 lg:p-6 flex flex-col justify-between font-sans no-underline shadow-sm transition-all hover:scale-[1.01] hover:shadow-md bg-[#1C1A1B] text-white min-h-[130px] sm:min-h-[220px] lg:min-h-[240px] group"
      >
        {/* Top row */}
        <div className="flex justify-between items-start">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#EDB63B] text-black flex items-center justify-center shrink-0 shadow-xs">
            {/* Location Pin */}
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.418-5.582-7-9.5-7-13a7 7 0 1114 0c0 3.5-2.582 7.418-7 13z" />
              <circle cx="12" cy="8" r="2.5" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-2.5 sm:mt-4">
          <div className="font-display font-extrabold text-[16px] sm:text-[24px] lg:text-[28px] leading-[1.08] tracking-[-0.03em] text-white">
            {displayTitle}
          </div>
        </div>
      </Link>
    );
  }

  if (colorVariant === 'lilac') {
    return (
      <Link
        to={id ? `/listeler#${id}` : '/listeler'}
        className="rounded-[16px] sm:rounded-[24px] p-3.5 sm:p-5 lg:p-6 flex flex-col justify-between font-sans no-underline shadow-sm transition-all hover:scale-[1.01] hover:shadow-md bg-[#D8D0F5] text-[#1C1A1B] min-h-[130px] sm:min-h-[220px] lg:min-h-[240px] group"
      >
        {/* Top row */}
        <div className="flex justify-between items-start">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#5B48B4] text-white flex items-center justify-center shrink-0 shadow-xs">
            {/* Lamp / Spotlight */}
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m-5 5h10M7 11l2-5h6l2 5M12 11v6m-4 3h8" />
            </svg>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-2.5 sm:mt-4">
          <div className="font-display font-extrabold text-[16px] sm:text-[24px] lg:text-[28px] leading-[1.08] tracking-[-0.03em] text-[#1C1A1B]">
            {displayTitle}
          </div>
        </div>
      </Link>
    );
  }

  if (colorVariant === 'sage') {
    return (
      <Link
        to={id ? `/listeler#${id}` : '/listeler'}
        className="rounded-[16px] sm:rounded-[24px] p-3.5 sm:p-5 lg:p-6 flex flex-col justify-between font-sans no-underline shadow-sm transition-all hover:scale-[1.01] hover:shadow-md bg-[#DCE7DB] text-[#1C1A1B] min-h-[130px] sm:min-h-[220px] lg:min-h-[240px] group"
      >
        {/* Top row */}
        <div className="flex justify-between items-start">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#2B5E3E] text-white flex items-center justify-center shrink-0 shadow-xs">
            {/* Pen / Quill */}
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-2.5 sm:mt-4">
          <div className="font-display font-extrabold text-[16px] sm:text-[24px] lg:text-[28px] leading-[1.08] tracking-[-0.03em] text-[#1C1A1B]">
            {displayTitle}
          </div>
        </div>
      </Link>
    );
  }

  // Red variant
  return (
    <Link
      to={id ? `/listeler#${id}` : '/listeler'}
      className="rounded-[16px] sm:rounded-[24px] p-3.5 sm:p-5 lg:p-6 flex flex-col justify-between font-sans no-underline shadow-sm transition-all hover:scale-[1.01] hover:shadow-md bg-[#BA1B23] text-white min-h-[130px] sm:min-h-[220px] lg:min-h-[240px] group"
    >
      {/* Top row */}
      <div className="flex justify-between items-start">
        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white text-[#BA1B23] flex items-center justify-center shrink-0 shadow-xs">
          {/* Temple / Pillars */}
          <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7v2h20V7L12 2zm-7 8h2v8H5v-8zm5 0h2v8h-2v-8zm5 0h2v8h-2v-8zm5 0h2v8h-2v-8zM2 20h20v2H2v-2z" />
          </svg>
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-2.5 sm:mt-4">
        <div className="font-display font-extrabold text-[16px] sm:text-[24px] lg:text-[28px] leading-[1.08] tracking-[-0.03em] text-white">
          {displayTitle}
        </div>
      </div>
    </Link>
  );
};

export default CuratedListCard;
