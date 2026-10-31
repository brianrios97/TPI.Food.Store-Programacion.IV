import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToastStore, ToastTipo } from "../../store/toastStore";

const iconosPorTipo: Record<ToastTipo, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
  info: <Info className="w-5 h-5 text-blue-500 shrink-0" />
};

const bordesPorTipo: Record<ToastTipo, string> = {
  success: "border-l-4 border-l-emerald-500",
  error: "border-l-4 border-l-red-500",
  warning: "border-l-4 border-l-amber-500",
  info: "border-l-4 border-l-blue-500"
};

export const ToastContainer: React.FC = () => {
  const { toasts, eliminarToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 bg-white text-stone-800 rounded-xl shadow-lg border border-stone-200 ${bordesPorTipo[t.tipo]} transition-all duration-300 transform translate-y-0`}
        >
          {iconosPorTipo[t.tipo]}
          <div className="flex-1 text-xs sm:text-sm font-medium leading-snug break-words">
            {t.mensaje}
          </div>
          <button
            onClick={() => eliminarToast(t.id)}
            className="p-1 -mr-1 -mt-1 text-stone-400 hover:text-stone-600 rounded-lg transition-colors"
            title="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

