import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Package,
  Calendar,
  MapPin,
  CreditCard,
  ChevronDown,
  ChevronUp,
  XCircle,
  AlertCircle,
  ShoppingBag
} from "lucide-react";
import { pedidosApi } from "../api/pedidosApi";
import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { Modal } from "../../../shared/ui/Modal";
import { toast } from "../../../store/toastStore";
import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Skeleton } from "../../../shared/components/Skeleton";

export const MisPedidosPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [pedidoExpandido, setPedidoExpandido] = useState<number | null>(null);
  const [pedidoACancelar, setPedidoACancelar] = useState<number | null>(null);

  // 1. Obtener listado de pedidos del usuario
  const {
    data: pedidos = [],
    isLoading,
    isError
  } = useQuery({
    queryKey: ["mis-pedidos"],
    queryFn: () => pedidosApi.obtenerMisPedidos()
  });

  // 2. Mutación para Cancelar Pedido
  const cancelarMutation = useMutation({
    mutationFn: (id: number) => pedidosApi.cancelarPedido(id),
    onSuccess: (pedidoCancelado) => {
      queryClient.invalidateQueries({ queryKey: ["mis-pedidos"] });
      // También invalidamos productos porque el stock fue devuelto
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      setPedidoACancelar(null);
      toast.success(`Pedido #${pedidoCancelado.id} cancelado. El stock fue restaurado.`);
    },
    onError: (err) => {
      const mensaje = handleApiError(err);
      toast.error(mensaje);
    }
  });

  const toggleExpandir = (id: number) => {
    setPedidoExpandido(pedidoExpandido === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">Mis Pedidos</h1>
        <p className="text-stone-500 text-sm mt-0.5">
          Historial y estado de tus compras en tiempo real
        </p>
      </div>

      {/* Estados de carga o error */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-3xl border border-stone-200 p-6 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="w-32 h-6" />
                <Skeleton className="w-24 h-6 rounded-full" />
              </div>
              <Skeleton className="w-48 h-4" />
              <div className="flex justify-between pt-2">
                <Skeleton className="w-24 h-5" />
                <Skeleton className="w-20 h-5" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <EstadoVacio
          titulo="Error al cargar pedidos"
          descripcion="No pudimos recuperar tu historial de pedidos. Por favor, reintentalo."
        />
      ) : pedidos.length === 0 ? (
        <EstadoVacio
          titulo="Aún no realizaste ningún pedido"
          descripcion="¡Animate a pedir los platos más deliciosos de nuestra carta!"
          icono={<ShoppingBag className="w-8 h-8" />}
          accion={
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-colors"
            >
              Explorar Catálogo
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => {
            const expandido = pedidoExpandido === pedido.id;
            const esCancelable = pedido.estado === "PENDIENTE";
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
                className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden transition-all hover:border-amber-200"
              >
                {/* Cabecera del Pedido */}
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-sm">
                        #{pedido.id}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-stone-900 text-base">
                          Pedido #{pedido.id}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-stone-600">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{fechaFormateada}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <BadgeEstado estado={pedido.estado} />
                    <span className="text-lg font-black text-stone-900">
                      ${pedido.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Info Rápida de Dirección y Pago */}
                <div className="px-5 sm:px-6 py-3 bg-stone-50/70 border-y border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-medium truncate max-w-xs sm:max-w-md">
                      {pedido.direccion_entrega}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-medium">Pago: {pedido.forma_pago}</span>
                  </div>
                </div>

                {/* Desglose de Líneas (Inmutables) */}
                {expandido && (
                  <div className="p-5 sm:p-6 bg-stone-50/40 border-b border-stone-100 space-y-4 animate-fadeIn">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-amber-500" />
                      <span>Detalle de Artículos</span>
                    </h4>

                    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden divide-y divide-stone-100 text-xs">
                      {pedido.items.map((linea, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 flex justify-between items-center hover:bg-stone-50/50 transition-colors"
                        >
                          <div>
                            <span className="font-bold text-stone-800">
                              {linea.cantidad}x {linea.nombre_producto}
                            </span>
                            <span className="text-stone-600 block text-[11px]">
                              Precio unitario: ${linea.precio_unitario.toLocaleString("es-AR")}
                            </span>
                          </div>
                          <span className="font-bold text-stone-900 text-sm">
                            ${linea.subtotal.toLocaleString("es-AR")}
                          </span>
                        </div>
                      ))}
                    </div>

                    {pedido.notas && (
                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-stone-700">
                        <span className="font-bold text-amber-900">Nota del pedido: </span>
                        {pedido.notas}
                      </div>
                    )}
                  </div>
                )}

                {/* Pie de Acciones */}
                <div className="px-5 sm:px-6 py-3 flex items-center justify-between bg-white">
                  <button
                    onClick={() => toggleExpandir(pedido.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
                  >
                    <span>{expandido ? "Ocultar detalle" : "Ver detalle"}</span>
                    {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {/* Botón Cancelar (Solo en estado PENDIENTE - RN-05) */}
                  {esCancelable ? (
                    <button
                      onClick={() => setPedidoACancelar(pedido.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors border border-red-200 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancelar Pedido</span>
                    </button>
                  ) : pedido.estado === "CANCELADO" ? (
                    <span className="text-xs text-stone-600 italic">Pedido cancelado</span>
                  ) : (
                    <span className="text-xs text-stone-600 italic">
                      En preparación / entregado (no cancelable)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmación para Cancelar Pedido (Idea Prog 3) */}
      <Modal
        abierto={pedidoACancelar !== null}
        onCerrar={() => setPedidoACancelar(null)}
        titulo="¿Cancelar este pedido?"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold">Esta acción devolverá los artículos al stock del local.</p>
              <p className="mt-1 text-amber-700">
                ¿Estás seguro de que deseas cancelar el Pedido #{pedidoACancelar}?
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPedidoACancelar(null)}
              className="px-4 py-2 border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-xl transition-colors"
            >
              No, mantener pedido
            </button>
            <button
              type="button"
              disabled={cancelarMutation.isPending}
              onClick={() => {
                if (pedidoACancelar !== null) {
                  cancelarMutation.mutate(pedidoACancelar);
                }
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-stone-300 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
            >
              {cancelarMutation.isPending ? "Cancelando..." : "Sí, cancelar pedido"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
