import React from 'react';
import { Link } from 'react-router-dom';

interface LeaderboardEmptyProps {
  className?: string;
}

export const LeaderboardEmpty: React.FC<LeaderboardEmptyProps> = ({ className = '' }) => {
  return (
    <div
      className={`rounded-xl border-1.5 border-dashed border-tn-line-strong p-6 text-center flex flex-col items-center justify-center gap-1.5 font-serif min-h-[140px] ${className}`}
    >
      <span className="text-[11px] font-semibold tracking-wider text-tn-muted uppercase">
        SIRA · TİYATROSEVER · KADEME · İZLENEN · XP
      </span>
      <span className="font-extrabold text-xl text-tn-text">
        Henüz sıralamada kimse yok.
      </span>
      <Link
        to="/liderler"
        className="italic text-base text-tn-red font-semibold hover:opacity-85 transition-opacity no-underline"
      >
        İlk sen ol!
      </Link>
    </div>
  );
};

export default LeaderboardEmpty;
