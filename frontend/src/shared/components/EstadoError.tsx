import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "../ui/Button";

interface EstadoErrorProps {
  titulo?: string;
  mensaje: string;
  onReintentar?: () => void;
}

export const EstadoError: React.FC<EstadoErrorProps> = ({
  titulo = "Ocurrió un error",
  mensaje,
  onReintentar
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-stone-900 mb-1">{titulo}</h3>
      <p className="text-xs text-stone-600 max-w-md mb-5 leading-relaxed">{mensaje}</p>
      {onReintentar && (
        <Button variant="outline" size="sm" onClick={onReintentar}>
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reintentar</span>
        </Button>
      )}
    </div>
  );
};

