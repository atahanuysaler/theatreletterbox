import React from 'react';

interface SenDeYazOvalProps {
  onClick: () => void;
  className?: string;
}

export const SenDeYazOval: React.FC<SenDeYazOvalProps> = ({
  onClick,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl flex items-center justify-center p-5 box-border h-full min-h-[320px] font-serif border border-tn-line/40 ${className}`}
      style={{
        background: 'var(--tn-stripe-lilac, repeating-linear-gradient(0deg, #CFC3F1 0 26px, #C0B2EA 26px 28px))',
      }}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label="Not bırak - Sen de yaz"
        className="w-full max-w-[340px] h-[280px] border-2 border-tn-text/80 rounded-[50%] flex flex-col items-center justify-center gap-2.5 text-tn-text bg-transparent hover:scale-[1.02] transition-transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-tn-red"
      >
        <span className="font-extrabold text-5xl sm:text-[60px] leading-[0.9] text-center tracking-tight text-tn-text">
          SEN DE<br />YAZ
        </span>
        <span className="italic text-base sm:text-lg underline underline-offset-4 text-tn-text font-medium">
          Bu gece ne izledin? Not bırak
        </span>
      </button>
    </div>
  );
};

export default SenDeYazOval;
