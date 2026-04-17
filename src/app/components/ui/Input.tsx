import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", disabled, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            className={`block text-[11px] font-semibold uppercase tracking-widest text-slate-400 ${
              disabled ? "opacity-40" : ""
            }`}
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          disabled={disabled}
          className={`
            w-full rounded-xl px-4 py-3
            text-sm text-white font-normal
            bg-[#1e2535]
            border border-[#2a3347]
            placeholder-[#4a5568]
            outline-none
            transition-all duration-150
            hover:border-[#3d4f6e]
            hover:bg-[#212840]
            focus:border-violet-500/70
            focus:bg-[#212840]
            focus:ring-2 focus:ring-violet-500/15
            disabled:opacity-40 disabled:cursor-not-allowed
            ${error ? "border-rose-500/60 focus:border-rose-500/70 focus:ring-rose-500/15" : ""}
            ${className}
          `}
          style={{ colorScheme: "dark" }}
          {...props}
        />

        {error && <p className="text-rose-400 text-xs">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
