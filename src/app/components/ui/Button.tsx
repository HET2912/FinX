import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-lg
    transition-all duration-200 ease-out

    focus:outline-none
    focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#020617]

    active:scale-[0.97]
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-[#7C3AED]
      text-white
      shadow-sm

      hover:bg-[#6D28D9]
      focus:ring-[#7C3AED]/30
    `,

    secondary: `
      bg-[#0F172A]
      border border-[#2E3A59]
      text-[#E5E7EB]

      hover:border-[#6366F1]
      hover:bg-[#111827]

      focus:ring-[#6366F1]/20
    `,

    ghost: `
      bg-transparent
      text-[#9CA3AF]

      hover:bg-[#1F2937]
      hover:text-[#F1F5F9]

      focus:ring-[#6B7280]/20
    `,

    danger: `
      bg-[#DC2626]
      text-white
      shadow-sm

      hover:bg-[#B91C1C]
      focus:ring-[#DC2626]/30
    `,
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base",
  };

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
