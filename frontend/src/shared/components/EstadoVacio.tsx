import React from "react";
import { Inbox } from "lucide-react";

interface EstadoVacioProps {
  titulo: string;
  descripcion?: string;
  icono?: React.ReactNode;
  accion?: React.ReactNode;
}

export const EstadoVacio: React.FC<EstadoVacioProps> = ({
  titulo,
  descripcion,
  icono,
  accion
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 mb-4">
        {icono || <Inbox className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-bold text-stone-800 mb-1">{titulo}</h3>
      {descripcion && (
        <p className="text-sm text-stone-500 max-w-sm mb-6">{descripcion}</p>
      )}
      {accion && <div>{accion}</div>}
    </div>
  );
};

