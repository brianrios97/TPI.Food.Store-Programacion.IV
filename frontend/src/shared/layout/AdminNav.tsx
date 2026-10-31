import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Tags, UtensilsCrossed, Users } from "lucide-react";

interface AdminNavProps {
  titulo: string;
  subtitulo?: string;
  accion?: React.ReactNode;
}

const pestañas = [
  { ruta: "/admin/resumen", etiqueta: "Resumen", icono: <LayoutDashboard className="w-4 h-4" /> },
  { ruta: "/admin/pedidos", etiqueta: "Pedidos", icono: <ClipboardList className="w-4 h-4" /> },
  { ruta: "/admin/categorias", etiqueta: "Categorías", icono: <Tags className="w-4 h-4" /> },
  { ruta: "/admin/productos", etiqueta: "Productos", icono: <UtensilsCrossed className="w-4 h-4" /> },
  { ruta: "/admin/usuarios", etiqueta: "Usuarios", icono: <Users className="w-4 h-4" /> }
];

export const AdminNav: React.FC<AdminNavProps> = ({ titulo, subtitulo, accion }) => {
  return (
    <div className="space-y-6 mb-8">
      {/* Título de la sección y acción opcional */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            {titulo}
          </h1>
          {subtitulo && (
            <p className="text-stone-500 text-xs sm:text-sm mt-0.5">{subtitulo}</p>
          )}
        </div>
        {accion && <div>{accion}</div>}
      </div>

      {/* Barra de Pestañas */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-stone-200 scrollbar-none">
        {pestañas.map((p) => (
          <NavLink
            key={p.ruta}
            to={p.ruta}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? "bg-[#1e3a8a] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`
            }
          >
            {p.icono}
            <span>{p.etiqueta}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

