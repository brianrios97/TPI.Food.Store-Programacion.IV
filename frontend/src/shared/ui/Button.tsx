import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  cargando?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  cargando = false,
  disabled,
  className = "",
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5"
  }[size];

  const variantClasses = {
    primary: "bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6] to-[#1e3a8a] hover:from-[#1e40af] hover:to-[#1e40af] text-white shadow-sm shadow-blue-900/20 focus:ring-blue-600",
    secondary: "bg-slate-800 hover:bg-slate-900 text-white focus:ring-slate-800",
    danger: "bg-rose-500 hover:bg-rose-600 text-white shadow-sm focus:ring-rose-500",
    outline: "border border-slate-300 hover:border-slate-400 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400",
    ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-400"
  }[variant];

  return (
    <button
      disabled={disabled || cargando}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {cargando ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Procesando...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

