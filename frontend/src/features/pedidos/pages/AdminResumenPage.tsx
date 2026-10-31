import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Calendar,
  Clock,
  ChefHat,
  CheckCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { pedidosApi } from "../api/pedidosApi";
import { AdminNav } from "../../../shared/layout/AdminNav";
import { Skeleton } from "../../../shared/components/Skeleton";

export const AdminResumenPage: React.FC = () => {
  const {
    data: resumen,
    isLoading,
    isError,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ["admin-resumen"],
    queryFn: () => pedidosApi.obtenerResumenAdmin(),
    refetchInterval: 1000 * 30 // Refresca métricas automáticamente cada 30 segundos
  });

  return (
    <div className="space-y-6">
      <AdminNav
        titulo="Panel de Administración"
        subtitulo="Métricas operativas y de ventas de Food Store"
        accion={
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>Actualizar Métricas</span>
          </button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-3xl border border-stone-200 p-6 space-y-3">
              <Skeleton className="w-12 h-12 rounded-2xl" />
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-32 h-8" />
            </div>
          ))}
        </div>
      ) : isError || !resumen ? (
        <div className="p-8 text-center bg-red-50 rounded-3xl border border-red-200 text-red-700">
          <p className="font-bold text-sm">No pudimos cargar las métricas en este momento.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Grilla de Tarjetas KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Ingresos Entregados */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-3xl p-6 shadow-lg shadow-emerald-500/15 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-emerald-100 text-xs font-bold uppercase tracking-wider block">
                    Ingresos Entregados
                  </span>
                  <div className="text-3xl font-black mt-2">
                    ${resumen.ingresos_entregados.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-[11px] text-emerald-100 mt-4 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Facturación acumulada de pedidos completados</span>
              </p>
            </div>

            {/* 2. Pedidos Hoy */}
            <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-stone-500 text-xs font-bold uppercase tracking-wider block">
                    Pedidos Registrados Hoy
                  </span>
                  <div className="text-3xl font-black text-stone-900 mt-2">
                    {resumen.pedidos_hoy}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-stone-600 mt-4">
                Total de órdenes ingresadas en la fecha actual
              </p>
            </div>

            {/* 3. En Preparación */}
            <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-blue-600 text-xs font-bold uppercase tracking-wider block">
                    En Preparación
                  </span>
                  <div className="text-3xl font-black text-stone-900 mt-2">
                    {resumen.en_preparacion}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ChefHat className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-stone-600 mt-4">
                Platos actualmente en cocina listos para despachar
              </p>
            </div>

            {/* 4. Pendientes */}
            <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-amber-600 text-xs font-bold uppercase tracking-wider block">
                    Pendientes de Aceptación
                  </span>
                  <div className="text-3xl font-black text-stone-900 mt-2">
                    {resumen.pendientes}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-stone-600 mt-4">
                Pedidos nuevos que requieren confirmación para entrar a cocina
              </p>
            </div>

            {/* 5. Entregados */}
            <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider block">
                    Total Entregados
                  </span>
                  <div className="text-3xl font-black text-stone-900 mt-2">
                    {resumen.entregados}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-stone-600 mt-4">
                Órdenes finalizadas y recibidas por los clientes
              </p>
            </div>

            {/* 6. Cancelados */}
            <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-rose-600 text-xs font-bold uppercase tracking-wider block">
                    Total Cancelados
                  </span>
                  <div className="text-3xl font-black text-stone-900 mt-2">
                    {resumen.cancelados}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <XCircle className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-stone-600 mt-4">
                Órdenes anuladas con stock restituido al almacén
              </p>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-stone-100/70 rounded-3xl p-6 border border-stone-200/80">
            <h3 className="font-bold text-stone-900 text-sm mb-3">Acciones Operativas Rápidas</h3>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/pedidos"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-colors"
              >
                <span>Gestionar Pedidos en Curso</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/admin/productos"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-bold text-xs transition-colors"
              >
                <span>Ajustar Stock y Menú</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
