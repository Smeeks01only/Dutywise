import { useState, useRef, useEffect, useId } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  icon?: ReactNode; // Supports flag emojis or Lucide icons
}

interface SelectProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  error?: string;
  className?: string;
  icon?: ReactNode; // Global icon for the select input
}

export function Select({ label, value, onChange, options, error, className = '', icon }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`flex flex-col gap-1.5 relative ${className}`} ref={containerRef}>
      <label id={`${generatedId}-label`} className="text-sm font-medium text-neutral-600">
        {label}
      </label>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${generatedId}-label`}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative w-full rounded-xl border bg-white py-2.5 text-left text-sm text-neutral-900 shadow-sm
          transition-all duration-200 focus:outline-none focus:ring-4 flex items-center justify-between
          ${icon ? 'pl-14 pr-10' : 'pl-3 pr-10'}
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20 hover:border-neutral-400'}
        `}
      >
        {/* Global leading icon (e.g. globe) */}
        {icon && (
          <div className="absolute left-1.5 h-9 w-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 pointer-events-none">
            {icon}
          </div>
        )}

        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && <span className="flex-shrink-0">{selectedOption.icon}</span>}
          <span className="truncate">{selectedOption?.label}</span>
        </div>

        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className={`h-5 w-5 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {isOpen && (
        <ul
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-lg top-full focus:outline-none"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  relative cursor-pointer select-none py-2.5 pl-3 pr-9 text-sm transition-colors
                  ${isSelected ? 'bg-primary-50 text-primary-900 font-medium' : 'text-neutral-900 hover:bg-neutral-50'}
                `}
              >
                <div className="flex items-center gap-2">
                  {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                  <span className="truncate">{option.label}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
