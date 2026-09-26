import React from 'react';

export type HashtagColor = 'red' | 'blush' | 'ink' | 'ochre' | 'lilac' | 'sage';

const COLOR_CLASSES: Record<HashtagColor, string> = {
  red: 'bg-tn-red text-white hover:bg-tn-red/90',
  blush: 'bg-tn-blush text-tn-ink hover:opacity-90',
  ink: 'bg-tn-ink text-white hover:bg-tn-ink/90',
  ochre: 'bg-tn-ochre text-tn-ink hover:opacity-90',
  lilac: 'bg-tn-lilac text-tn-ink hover:opacity-90',
  sage: 'bg-tn-sage text-tn-ink hover:opacity-90',
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
      className={`h-[34px] min-h-[34px] px-3.5 flex items-center rounded-full text-[15px] font-semibold transition-all cursor-pointer whitespace-nowrap border-none ${colorClass} ${
        isSelected ? 'ring-2 ring-tn-ink ring-offset-2 scale-105 shadow-sm' : ''
      } ${className}`}
    >
      {formattedLabel}
    </button>
  );
};

export default HashtagChip;
