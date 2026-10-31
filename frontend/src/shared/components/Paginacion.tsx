import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  onCambiarPagina: (pagina: number) => void;
}

export const Paginacion: React.FC<PaginacionProps> = ({
  paginaActual,
  totalPaginas,
  onCambiarPagina
}) => {
  if (totalPaginas <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onCambiarPagina(paginaActual - 1)}
        disabled={paginaActual === 1}
        className="p-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        title="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <span className="text-xs font-semibold text-stone-600 px-3">
        Página {paginaActual} de {totalPaginas}
      </span>

      <button
        onClick={() => onCambiarPagina(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        className="p-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        title="Página siguiente"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

