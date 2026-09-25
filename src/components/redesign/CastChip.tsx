import React from 'react';

interface CastChipProps {
  actorName: string;
  role?: string;
  isFeatured?: boolean;
  featuredVariant?: 'red' | 'dark';
  onClick?: () => void;
}

export const CastChip: React.FC<CastChipProps> = ({
  actorName,
  role,
  isFeatured = false,
  featuredVariant = 'dark',
  onClick,
}) => {
  if (isFeatured) {
    const isRed = featuredVariant === 'red';
    return (
      <div
        onClick={onClick}
        className={`rounded-xl p-3.5 sm:p-4 flex flex-col gap-0.5 text-white transition-transform hover:scale-[1.01] ${
          isRed ? 'bg-tn-red shadow-xs' : 'bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 shadow-xs'
        } ${onClick ? 'cursor-pointer' : ''}`}
      >
        {role && (
          <span className="text-xs sm:text-[13px] italic opacity-90 truncate">
            {role}
          </span>
        )}
        <span className="font-extrabold text-xl sm:text-[24px] leading-tight truncate">
          {actorName}
        </span>
      </div>
    );
  }

  return (
    <span
      onClick={onClick}
      className={`h-[34px] px-3.5 flex items-center rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white text-[15px] sm:text-base font-serif whitespace-nowrap transition-colors ${
        onClick ? 'cursor-pointer hover:bg-white/20' : ''
      }`}
    >
      {actorName}
    </span>
  );
};

export default CastChip;
