import React from "react";

export type EstadoPedidoType = "PENDIENTE" | "EN_PREPARACION" | "ENTREGADO" | "CANCELADO";

interface BadgeEstadoProps {
  estado: EstadoPedidoType | string;
}

const configEstado: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  PENDIENTE: {
    label: "Pendiente",
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500"
  },
  EN_PREPARACION: {
    label: "En Preparación",
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-500"
  },
  ENTREGADO: {
    label: "Entregado",
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500"
  },
  CANCELADO: {
    label: "Cancelado",
    bg: "bg-rose-50 border-rose-200",
    text: "text-rose-700",
    dot: "bg-rose-500"
  }
};

export const BadgeEstado: React.FC<BadgeEstadoProps> = ({ estado }) => {
  const cfg = configEstado[estado] || {
    label: estado,
    bg: "bg-stone-100 border-stone-200",
    text: "text-stone-700",
    dot: "bg-stone-400"
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
      {cfg.label}
    </span>
  );
};
