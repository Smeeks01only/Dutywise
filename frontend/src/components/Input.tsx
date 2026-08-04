import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  currencyPrefix?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
  onIconRightClick?: () => void;
}

export function Input({ label, error, currencyPrefix, icon, iconRight, onIconRightClick, className = '', id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={inputId} className="text-sm font-medium text-neutral-600">
        {label}
      </label>
      
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-1.5 h-9 w-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 pointer-events-none">
            {icon}
          </div>
        )}
        {currencyPrefix && (
          <span className={`absolute left-3 text-neutral-500 font-medium ${icon ? 'ml-10' : ''}`}>
            {currencyPrefix}
          </span>
        )}
        
        <input
          id={inputId}
          className={`
            w-full rounded-xl border bg-white py-2.5 text-sm text-neutral-900 shadow-sm
            transition-all duration-200 focus:outline-none focus:ring-4
            ${icon ? (currencyPrefix ? 'pl-20 pr-3' : 'pl-14 pr-3') : (currencyPrefix ? 'pl-8 pr-3' : 'px-3')}
            ${iconRight ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20 hover:border-neutral-400'}
            ${props.disabled ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed' : ''}
          `}
          {...props}
        />
        
        {iconRight && (
          <button
            type="button"
            onClick={onIconRightClick}
            className={`absolute right-3 text-neutral-400 flex items-center ${onIconRightClick ? 'cursor-pointer hover:text-neutral-600 focus:outline-none focus:text-neutral-600' : 'pointer-events-none'}`}
            tabIndex={onIconRightClick ? 0 : -1}
          >
            {iconRight}
          </button>
        )}
      </div>

      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
