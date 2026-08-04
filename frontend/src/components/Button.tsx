import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm focus:ring-primary-500/20',
    secondary: 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 hover:shadow-sm focus:ring-neutral-500/20',
    outline: 'border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 hover:shadow-sm focus:ring-primary-500/20',
    ghost: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus:ring-neutral-500/20',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
