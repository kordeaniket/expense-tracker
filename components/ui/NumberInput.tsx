import React, { forwardRef } from "react";

export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  prefix?: string;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, error, prefix, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </label>
        )}
        <div className="relative w-full">
          {prefix && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/90 text-sm font-semibold select-none">
              {prefix}
            </span>
          )}
          <input
            type="number"
            ref={ref}
            className={`w-full bg-background border border-input rounded-md py-2 px-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-55 text-foreground ${prefix ? "pl-7" : ""
              } ${error ? "border-danger focus:ring-danger/20 focus:border-danger" : ""
              } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="text-[11px] font-bold text-danger animate-in fade-in slide-in-from-top-1 duration-150">
            {error}
          </p>
        )}
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";
