import React from 'react';
import { Link } from 'react-router-dom';

interface LeaderboardEmptyProps {
  className?: string;
}

export const LeaderboardEmpty: React.FC<LeaderboardEmptyProps> = ({ className = '' }) => {
  return (
    <div
      className={`rounded-xl border-1.5 border-dashed border-tn-line-strong p-6 text-center flex flex-col items-center justify-center gap-1.5 font-sans min-h-[140px] ${className}`}
    >
      <span className="text-[11px] font-sans font-bold tracking-[0.07em] text-tn-muted uppercase">
        SIRA · TİYATROSEVER · KADEME · İZLENEN · XP
      </span>
      <span className="font-display font-extrabold text-xl text-tn-text">
        Henüz sıralamada kimse yok.
      </span>
      <Link
        to="/liderler"
        className="font-accent italic font-normal text-lg text-tn-red hover:opacity-85 transition-opacity no-underline"
      >
        İlk sen ol!
      </Link>
    </div>
  );
};

export default LeaderboardEmpty;
