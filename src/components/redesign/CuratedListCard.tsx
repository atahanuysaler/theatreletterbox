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
    container: 'bg-[#1C1A1B] text-white',
    pill: 'border-white text-white',
    subtitle: 'opacity-80 text-white',
    desc: 'opacity-90 text-white',
  },
  lilac: {
    container: 'bg-[#D9CFF2] text-tn-text',
    pill: 'border-tn-ink text-tn-text',
    subtitle: 'opacity-80 text-tn-text',
    desc: 'opacity-90 text-tn-text',
  },
  sage: {
    container: 'bg-[#D6E0D3] text-tn-text',
    pill: 'border-tn-ink text-tn-text',
    subtitle: 'opacity-80 text-tn-text',
    desc: 'opacity-90 text-tn-text',
  },
  red: {
    container: 'bg-[#BA1B23] text-white',
    pill: 'border-white text-white',
    subtitle: 'opacity-80 text-white',
    desc: 'opacity-90 text-white',
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
      className={`min-h-[280px] sm:h-[300px] rounded-2xl p-5 flex flex-col justify-between font-serif no-underline shadow-sm transition-transform hover:scale-[1.01] ${currentStyle.container}`}
    >
      {/* Top row */}
      <div className="flex justify-between items-center">
        <span
          className={`h-6 px-2.5 flex items-center border rounded-full text-[11px] font-semibold tracking-wider ${currentStyle.pill}`}
        >
          {category}
        </span>
        <span className="text-sm italic">{playCount} oyun</span>
      </div>

      {/* Title & Desc */}
      <div className="my-2">
        <div className={`text-xs font-extrabold tracking-wider ${currentStyle.subtitle}`}>
          KÜRATÖRLÜ SEÇKİ
        </div>
        <div className="font-extrabold text-2xl sm:text-[26px] leading-tight mt-1 line-clamp-2">
          {title}
        </div>
        <p className={`mt-2 text-xs sm:text-[14px] leading-relaxed line-clamp-3 ${currentStyle.desc}`}>
          {description}
        </p>
      </div>

      {/* Curator */}
      <span className="italic text-xs sm:text-sm">{curator}</span>
    </Link>
  );
};

export default CuratedListCard;
