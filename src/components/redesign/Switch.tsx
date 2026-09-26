import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  id,
  className = '',
}) => {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`inline-flex items-center gap-2.5 min-h-[44px] border-none bg-transparent p-0 font-serif text-sm text-tn-text cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none ${className}`}
    >
      <span
        className={`w-11 h-[26px] rounded-full p-0.5 flex items-center transition-colors duration-200 ${
          checked ? 'bg-tn-red justify-end' : 'bg-tn-line-strong justify-start'
        }`}
      >
        <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
      </span>
      {label && <span className="italic text-xs sm:text-sm text-tn-text">{label}</span>}
    </button>
  );
};

export default Switch;
