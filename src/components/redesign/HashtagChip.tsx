import React from 'react';

export type HashtagColor = 'red' | 'blush' | 'ink' | 'ochre' | 'lilac' | 'sage';

const COLOR_CLASSES: Record<HashtagColor, string> = {
  red: 'bg-[#BA1B23] text-white hover:bg-[#a0161d]',
  blush: 'bg-[#F4D3CE] text-[#1C1A1B] hover:bg-[#ebd5d0]',
  ink: 'bg-[#1C1A1B] text-white hover:bg-[#333031]',
  ochre: 'bg-[#E4B33A] text-[#1C1A1B] hover:bg-[#d6a52f]',
  lilac: 'bg-[#D9CFF2] text-[#1C1A1B] hover:bg-[#cec2ea]',
  sage: 'bg-[#D6E0D3] text-[#1C1A1B] hover:bg-[#c6d3c2]',
};

export const COLOR_CYCLE: HashtagColor[] = ['red', 'blush', 'ink', 'ochre', 'lilac', 'sage'];

interface HashtagChipProps {
  label: string;
  color?: HashtagColor;
  index?: number;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const HashtagChip: React.FC<HashtagChipProps> = ({
  label,
  color,
  index = 0,
  isSelected = false,
  onClick,
  className = '',
}) => {
  const chosenColor = color || COLOR_CYCLE[index % COLOR_CYCLE.length];
  const colorClass = COLOR_CLASSES[chosenColor];

  const formattedLabel = label.startsWith('#') ? label : `#${label}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-[34px] px-3.5 flex items-center rounded-full text-[15px] font-semibold transition-all cursor-pointer whitespace-nowrap ${colorClass} ${
        isSelected ? 'ring-2 ring-tn-ink ring-offset-2 scale-105 shadow-sm' : ''
      } ${className}`}
    >
      {formattedLabel}
    </button>
  );
};

export default HashtagChip;
