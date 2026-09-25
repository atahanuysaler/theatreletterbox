import React from 'react';

interface CircleArrowButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'black' | 'white';
  className?: string;
  onClick?: () => void;
  'aria-label'?: string;
}

export const CircleArrowButton: React.FC<CircleArrowButtonProps> = ({
  size = 'md',
  variant = 'black',
  className = '',
  onClick,
  'aria-label': ariaLabel = 'İlerle',
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-[52px] h-[52px]',
  }[size];

  const variantClasses = {
    black: 'bg-tn-ink text-white hover:bg-tn-ink/80',
    white: 'bg-white text-tn-ink shadow-[0_2px_8px_rgba(28,26,27,0.12)] hover:bg-white/90',
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`rounded-full flex items-center justify-center transition-transform active:scale-95 flex-shrink-0 cursor-pointer ${sizeClasses} ${variantClasses} ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
};

export default CircleArrowButton;
