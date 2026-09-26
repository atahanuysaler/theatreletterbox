import React from 'react';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: (SegmentOption<T> | T)[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  variant?: 'light' | 'dark';
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  variant = 'light',
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1 p-1 rounded-xl font-serif text-sm border ${
        variant === 'dark'
          ? 'bg-tn-ink text-white border-tn-ink'
          : 'bg-tn-surface text-tn-text border-tn-line/50'
      } ${className}`}
    >
      {options.map((opt) => {
        const optVal = typeof opt === 'string' ? opt : opt.value;
        const optLabel = typeof opt === 'string' ? opt : opt.label;
        const isSelected = value === optVal;

        return (
          <button
            key={optVal}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(optVal as T)}
            className={`min-h-[36px] px-3.5 rounded-lg font-serif text-sm transition-all cursor-pointer ${
              isSelected
                ? 'bg-white dark:bg-tn-card text-tn-text font-bold shadow-seg'
                : 'bg-transparent text-tn-muted hover:text-tn-text font-normal'
            }`}
          >
            {optLabel}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
