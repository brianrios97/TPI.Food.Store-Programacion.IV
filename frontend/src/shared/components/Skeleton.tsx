import React from "react";

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return <div className={`animate-pulse bg-stone-200/80 rounded-xl ${className}`}></div>;
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4">
      <Skeleton className="w-full h-44 rounded-xl" />
      <div className="flex flex-col gap-2">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-1/2 h-4" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="w-20 h-6" />
        <Skeleton className="w-28 h-9 rounded-xl" />
      </div>
    </div>
  );
};

