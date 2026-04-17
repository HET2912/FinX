import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`neo-card p-6 transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}
