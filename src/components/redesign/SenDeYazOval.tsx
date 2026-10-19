import React from 'react';

interface SenDeYazOvalProps {
  onClick: () => void;
  subtitle?: string;
  className?: string;
}

export const SenDeYazOval: React.FC<SenDeYazOvalProps> = ({
  onClick,
  subtitle = 'Bu gece ne izledin? Not bırak',
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl flex items-center justify-center p-3.5 sm:p-5 box-border h-full min-h-[200px] sm:min-h-[320px] font-sans border border-tn-line/40 ${className}`}
      style={{
        background: 'var(--tn-stripe-lilac, repeating-linear-gradient(0deg, #CFC3F1 0 26px, #C0B2EA 26px 28px))',
      }}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label="Not bırak - Sen de yaz"
        className="w-full max-w-[340px] h-[180px] sm:h-[280px] border-2 border-tn-text/80 rounded-[50%] flex flex-col items-center justify-center gap-1.5 sm:gap-2.5 text-tn-text bg-transparent hover:scale-[1.02] transition-transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-tn-red"
      >
        <span className="font-display font-extrabold text-3xl sm:text-5xl lg:text-[60px] leading-[0.9] text-center tracking-[-0.04em] text-tn-text">
          SEN DE<br />YAZ
        </span>
        <span className="font-accent italic font-normal text-xs sm:text-base lg:text-lg text-tn-text opacity-90">
          {subtitle}
        </span>
      </button>
    </div>
  );
};

export default SenDeYazOval;
