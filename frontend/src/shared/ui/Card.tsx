import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hover = false,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 ${
        hover ? "hover:shadow-md hover:border-stone-300 transition-all" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
