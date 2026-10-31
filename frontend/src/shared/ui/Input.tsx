import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-stone-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl shadow-xs transition-colors focus:outline-none focus:ring-2 ${
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200 text-rose-900"
              : "border-stone-300 focus:border-amber-500 focus:ring-amber-200 text-stone-900"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-stone-500 mt-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

