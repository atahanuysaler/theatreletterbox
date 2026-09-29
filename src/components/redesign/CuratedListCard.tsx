import React from 'react';
import { Link } from 'react-router-dom';

interface CuratedListCardProps {
  id?: string;
  category: string;
  playCount: number;
  title: string;
  description: string;
  curator: string;
  colorVariant?: 'ink' | 'lilac' | 'sage' | 'red';
}

const STYLES = {
  ink: {
    container: 'bg-tn-ink text-white',
    pill: 'border-white/40 text-white bg-white/10',
    subtitle: 'text-white/70',
    desc: 'text-white/80',
  },
  lilac: {
    container: 'bg-tn-lilac text-tn-text',
    pill: 'border-tn-text/30 text-tn-text bg-black/5',
    subtitle: 'text-tn-text/70',
    desc: 'text-tn-text/80',
  },
  sage: {
    container: 'bg-tn-sage text-tn-text',
    pill: 'border-tn-text/30 text-tn-text bg-black/5',
    subtitle: 'text-tn-text/70',
    desc: 'text-tn-text/80',
  },
  red: {
    container: 'bg-tn-red text-white',
    pill: 'border-white/40 text-white bg-white/10',
    subtitle: 'text-white/70',
    desc: 'text-white/80',
  },
};

export const CuratedListCard: React.FC<CuratedListCardProps> = ({
  id,
  category,
  playCount,
  title,
  description,
  curator,
  colorVariant = 'ink',
}) => {
  const currentStyle = STYLES[colorVariant] || STYLES.ink;

  return (
    <Link
      to={id ? `/listeler#${id}` : '/listeler'}
      className={`h-full min-h-[280px] rounded-2xl p-5 sm:p-5.5 flex flex-col justify-between font-serif no-underline shadow-sm transition-all hover:scale-[1.01] hover:shadow-md ${currentStyle.container}`}
    >
      {/* Top row */}
      <div className="flex justify-between items-center gap-2">
        <span
          className={`h-6.5 px-3 flex items-center border rounded-full text-[11px] font-semibold tracking-wider uppercase ${currentStyle.pill}`}
        >
          {category}
        </span>
        <span className="text-xs sm:text-sm italic opacity-85 flex-shrink-0">
          {playCount} oyun
        </span>
      </div>

      {/* Title & Desc */}
      <div className="my-2.5 flex-1 flex flex-col justify-center">
        <div className={`text-[11px] font-extrabold tracking-wider uppercase ${currentStyle.subtitle}`}>
          KÜRATÖRLÜ SEÇKİ
        </div>
        <div className="font-extrabold text-xl sm:text-[23px] leading-snug mt-1 line-clamp-2">
          {title}
        </div>
        <p className={`mt-2 text-xs sm:text-[13px] leading-relaxed line-clamp-3 ${currentStyle.desc}`}>
          {description}
        </p>
      </div>

      {/* Curator Footer */}
      <div className="pt-3 border-t border-current/15 flex justify-between items-center gap-2 text-xs">
        <span className="italic opacity-80 truncate max-w-[55%]">
          Küratör: {curator}
        </span>
        <span className="font-semibold text-xs sm:text-sm whitespace-nowrap flex-shrink-0 hover:underline">
          Seçkiyi İncele →
        </span>
      </div>
    </Link>
  );
};

export default CuratedListCard;
