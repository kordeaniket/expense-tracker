import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ComponentType<any>;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon: Icon, className = "", type = "text", ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </label>
        )}
        <div className="relative w-full">
          {Icon && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/80">
              <Icon className="h-4 w-4" />
            </span>
          )}
          <input
            type={type}
            ref={ref}
            className={`w-full bg-background border border-input rounded-md py-2 px-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-55 text-foreground ${
              Icon ? "pl-9" : ""
            } ${
              error ? "border-danger focus:ring-danger/20 focus:border-danger" : ""
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

Input.displayName = "Input";
