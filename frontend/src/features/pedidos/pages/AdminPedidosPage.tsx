import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  MapPin,
  CreditCard,
  ChefHat,
  CheckCircle,
  XCircle,
  Package,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from "lucide-react";
import { pedidosApi } from "../api/pedidosApi";
import { EstadoPedido } from "../types";
import { AdminNav } from "../../../shared/layout/AdminNav";
import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { Modal } from "../../../shared/ui/Modal";
import { toast } from "../../../store/toastStore";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Skeleton } from "../../../shared/components/Skeleton";
import { Paginacion } from "../../../shared/components/Paginacion";

const ITEMS_POR_PAGINA = 10;

const filtrosEstado: { etiqueta: string; valor: string | undefined }[] = [
  { etiqueta: "Todos", valor: undefined },
  { etiqueta: "Pendientes", valor: "PENDIENTE" },
  { etiqueta: "En Preparación", valor: "EN_PREPARACION" },
  { etiqueta: "Entregados", valor: "ENTREGADO" },
  { etiqueta: "Cancelados", valor: "CANCELADO" }
];

export const AdminPedidosPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [pagina, setPagina] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState<string | undefined>(undefined);
  const [pedidoExpandido, setPedidoExpandido] = useState<number | null>(null);
  const [pedidoACancelar, setPedidoACancelar] = useState<number | null>(null);

  const skip = (pagina - 1) * ITEMS_POR_PAGINA;

  // 1. Obtener pedidos paginados de la tienda
  const { data: dataPedidos, isLoading, isError } = useQuery({
    queryKey: ["admin-pedidos", { skip, limit: ITEMS_POR_PAGINA, estado: filtroEstado }],
    queryFn: () => pedidosApi.obtenerTodosAdmin(skip, ITEMS_POR_PAGINA, filtroEstado),
    refetchInterval: 1000 * 20 // Sincronización en tiempo real cada 20 segundos
  });

  const pedidos = dataPedidos?.items || [];
  const totalPedidos = dataPedidos?.total || 0;
  const totalPaginas = Math.ceil(totalPedidos / ITEMS_POR_PAGINA);

  // 2. Mutación de Cambio de Estado
  const cambiarEstadoMutation = useMutation({
    mutationFn: ({ id, nuevoEstado }: { id: number; nuevoEstado: EstadoPedido }) =>
      pedidosApi.cambiarEstadoAdmin(id, nuevoEstado),
    onSuccess: (pedidoActualizado) => {
      queryClient.invalidateQueries({ queryKey: ["admin-pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["admin-resumen"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      setPedidoACancelar(null);
      toast.success(
        `Pedido #${pedidoActualizado.id} pasó a "${pedidoActualizado.estado}"`
      );
    },
    onError: (err) => {
      const msg = handleApiError(err);
      toast.error(msg);
    }
  });

  const handleCambiarFiltro = (estado: string | undefined) => {
    setFiltroEstado(estado);
    setPagina(1);
  };

  const toggleExpandir = (id: number) => {
    setPedidoExpandido(pedidoExpandido === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <AdminNav
        titulo="Gestión de Pedidos"
        subtitulo="Control en tiempo real de la cocina, estados de entrega y despacho"
      />

      {/* Píldoras de Filtro por Estado */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filtrosEstado.map((f) => (
          <button
            key={f.etiqueta}
            onClick={() => handleCambiarFiltro(f.valor)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filtroEstado === f.valor
                ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20"
                : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            {f.etiqueta}
          </button>
        ))}
      </div>

      {/* Lista de Pedidos */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-3xl border border-stone-200 p-6 space-y-3">
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-3/4 h-5" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-red-50 rounded-3xl border border-red-200 text-red-700">
          <p className="font-bold text-sm">Error al recuperar pedidos del servidor.</p>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-stone-500 text-xs">
          No hay pedidos registrados con el filtro seleccionado.
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => {
            const expandido = pedidoExpandido === pedido.id;
            const fechaFormateada = new Date(pedido.created_at).toLocaleString("es-AR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });

            return (
              <div
                key={pedido.id}
                className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden transition-all hover:border-amber-200"
              >
                {/* Cabecera */}
                <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-sm">
                      #{pedido.id}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">
                          Orden #{pedido.id}
                        </span>
                        <BadgeEstado estado={pedido.estado} />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-600 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{fechaFormateada}</span>
                        <span>•</span>
                        <span>Usuario ID: #{pedido.usuario_id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones de la Máquina de Estados */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                    {/* Si está PENDIENTE -> Pasar a EN_PREPARACION o CANCELADO */}
                    {pedido.estado === "PENDIENTE" && (
                      <>
                        <button
                          onClick={() =>
                            cambiarEstadoMutation.mutate({
                              id: pedido.id,
                              nuevoEstado: "EN_PREPARACION"
                            })
                          }
                          disabled={cambiarEstadoMutation.isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                        >
                          <ChefHat className="w-3.5 h-3.5" />
                          <span>Preparar</span>
                        </button>
                        <button
                          onClick={() => setPedidoACancelar(pedido.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancelar</span>
                        </button>
                      </>
                    )}

                    {/* Si está EN_PREPARACION -> Pasar a ENTREGADO */}
                    {pedido.estado === "EN_PREPARACION" && (
                      <button
                        onClick={() =>
                          cambiarEstadoMutation.mutate({
                            id: pedido.id,
                            nuevoEstado: "ENTREGADO"
                          })
                        }
                        disabled={cambiarEstadoMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Marcar Entregado</span>
                      </button>
                    )}

                    <div className="text-right pl-3 border-l border-stone-200">
                      <span className="text-[10px] uppercase font-bold text-stone-600 block">
                        Total
                      </span>
                      <span className="text-base font-black text-stone-900">
                        ${pedido.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info de Entrega */}
                <div className="px-5 py-2.5 bg-stone-50/70 border-y border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>{pedido.direccion_entrega}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                    <span>Pago: {pedido.forma_pago}</span>
                  </div>
                  <button
                    onClick={() => toggleExpandir(pedido.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 ml-auto cursor-pointer"
                  >
                    <span>{expandido ? "Ocultar artículos" : "Ver artículos"}</span>
                    {expandido ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Desglose Expandible */}
                {expandido && (
                  <div className="p-5 bg-stone-50/40 space-y-3 animate-fadeIn">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-amber-500" />
                      <span>Artículos ordenados</span>
                    </h5>
                    <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 text-xs">
                      {pedido.items.map((linea, idx) => (
                        <div key={idx} className="p-3 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-stone-800">
                              {linea.cantidad}x {linea.nombre_producto}
                            </span>
                            <span className="text-stone-600 block text-[11px]">
                              Unitario: ${linea.precio_unitario.toLocaleString("es-AR")}
                            </span>
                          </div>
                          <span className="font-bold text-stone-900">
                            ${linea.subtotal.toLocaleString("es-AR")}
                          </span>
                        </div>
                      ))}
                    </div>
                    {pedido.notas && (
                      <p className="text-xs bg-amber-50/60 p-2.5 rounded-lg border border-amber-200 text-stone-700">
                        <strong className="text-amber-900">Nota del cliente:</strong> {pedido.notas}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <Paginacion
            paginaActual={pagina}
            totalPaginas={totalPaginas}
            onCambiarPagina={(nueva) => {
              setPagina(nueva);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}

      {/* Modal de Cancelación */}
      <Modal
        abierto={pedidoACancelar !== null}
        onCerrar={() => setPedidoACancelar(null)}
        titulo="¿Cancelar este pedido?"
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              Al cancelar la orden #{pedidoACancelar}, los artículos se devolverán al stock de la tienda automáticamente.
            </span>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setPedidoACancelar(null)}
              className="px-4 py-2 border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-xl transition-colors"
            >
              Cerrar
            </button>
            <button
              disabled={cambiarEstadoMutation.isPending}
              onClick={() => {
                if (pedidoACancelar !== null) {
                  cambiarEstadoMutation.mutate({
                    id: pedidoACancelar,
                    nuevoEstado: "CANCELADO"
                  });
                }
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              {cambiarEstadoMutation.isPending ? "Cancelando..." : "Sí, cancelar orden"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
