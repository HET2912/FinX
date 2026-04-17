import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  placeholder?: string; // ✅ NEW
  variant?: "teal" | "slate" | "premium";
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      placeholder,
      variant = "teal",
      className = "",
      disabled,
      value,
      ...props
    },
    ref,
  ) => {
    const variantStyles = {
      teal: {
        select: `
          bg-[#0B1220]
          border border-[#1F2A44]
          text-[#E5E7EB]
          hover:border-[#2DD4BF]
          focus:border-[#14B8A6]
          focus:ring-[#14B8A6]/20
        `,
        chevron: "text-[#6B7280] group-hover:text-[#2DD4BF]",
      },
      slate: {
        select: `
          bg-[#111827]
          border border-[#374151]
          text-[#E5E7EB]
          hover:border-[#6B7280]
          focus:border-[#818CF8]
          focus:ring-[#818CF8]/20
        `,
        chevron: "text-[#6B7280] group-hover:text-[#A5B4FC]",
      },
      premium: {
        select: `
          bg-[#0F172A]
          border border-[#2E3A59]
          text-[#F1F5F9]
          hover:border-[#6366F1]
          focus:border-[#7C3AED]
          focus:ring-[#7C3AED]/25
        `,
        chevron: "text-[#64748B] group-hover:text-[#A78BFA]",
      },
    };

    const styles = variantStyles[variant];

    const isPlaceholder = !value;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            className={`block text-[#9CA3AF] text-xs font-semibold tracking-wide ${
              disabled ? "opacity-50" : ""
            }`}
          >
            {label}
          </label>
        )}

        <div className="relative group">
          <select
            ref={ref}
            disabled={disabled}
            value={value}
            className={`
              w-full rounded-lg px-4 py-2.5 pr-10
              text-sm font-medium
              appearance-none cursor-pointer

              transition-all duration-200 ease-out
              outline-none

              shadow-sm
              focus:ring-2

              disabled:opacity-50 disabled:cursor-not-allowed

              ${styles.select}
              ${isPlaceholder ? "text-[#6B7280]" : ""}  // ✅ placeholder color
              ${className}
            `}
            {...props}
          >
            {/* ✅ Placeholder */}
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}

            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-[#020617] text-[#E5E7EB]"
              >
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown
            className={`
              absolute right-3 top-1/2 -translate-y-1/2
              w-4 h-4 pointer-events-none

              transition-all duration-200
              group-hover:translate-y-[calc(-50%+1px)]

              ${styles.chevron}
              ${disabled ? "opacity-40" : ""}
            `}
          />
        </div>
      </div>
    );
  },
);

Select.displayName = "Select";
