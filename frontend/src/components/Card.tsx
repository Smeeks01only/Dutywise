import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}

export function Card({ children, className = '', interactive = false }: CardProps) {
  return (
    <div className={`card ${interactive ? 'hover:-translate-y-1 hover:shadow-lg transition-all duration-300' : ''} ${className}`}>
      {children}
    </div>
  );
}
