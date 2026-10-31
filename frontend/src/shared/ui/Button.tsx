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
    primary: "bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20 focus:ring-amber-500",
    secondary: "bg-stone-800 hover:bg-stone-900 text-white focus:ring-stone-800",
    danger: "bg-rose-500 hover:bg-rose-600 text-white shadow-sm focus:ring-rose-500",
    outline: "border border-stone-300 hover:border-stone-400 bg-white text-stone-700 hover:bg-stone-50 focus:ring-stone-400",
    ghost: "text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus:ring-stone-400"
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

