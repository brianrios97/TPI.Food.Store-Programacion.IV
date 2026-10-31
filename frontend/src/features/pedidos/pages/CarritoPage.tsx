import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import { useCartStore } from "../../../store/cartStore";
import { toast } from "../../../store/toastStore";
import { Modal } from "../../../shared/ui/Modal";

export const CarritoPage: React.FC = () => {
  const { items, cambiarCantidad, quitar, vaciar, total, cantidadTotal } = useCartStore();
  const [modalVaciarAbierto, setModalVaciarAbierto] = useState(false);
  const navigate = useNavigate();

  const totalCalculado = total();
  const cantTotal = cantidadTotal();

  const handleIncrementar = (producto_id: number, cantidadActual: number, stock: number) => {
    if (cantidadActual >= stock) {
      toast.warning(`Alcanzaste el límite de stock disponible (${stock})`);
      return;
    }
    cambiarCantidad(producto_id, cantidadActual + 1);
  };

  const handleDecrementar = (producto_id: number, cantidadActual: number) => {
    cambiarCantidad(producto_id, cantidadActual - 1);
  };

  const handleConfirmarVaciar = () => {
    vaciar();
    setModalVaciarAbierto(false);
    toast.info("El carrito ha sido vaciado");
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-4">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mb-5 shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-stone-900 mb-2">Tu carrito está vacío</h2>
        <p className="text-stone-500 max-w-sm mb-8 text-sm">
          Aún no agregaste ningún plato a tu orden. Descubrí nuestras opciones artesanales y comenzá a pedir.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ver Menú y Platos</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Carrito de Compras
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Tenés {cantTotal} {cantTotal === 1 ? "producto" : "productos"} en tu orden
          </p>
        </div>

        <button
          onClick={() => setModalVaciarAbierto(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Vaciar Carrito</span>
        </button>
      </div>

      {/* Contenido en dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Lista de Ítems */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm divide-y divide-stone-100 overflow-hidden">
            {items.map((item) => {
              const subtotal = item.precio_unitario * item.cantidad;
              return (
                <div
                  key={item.producto_id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-colors hover:bg-stone-50/50"
                >
                  {/* Imagen */}
                  <img
                    src={
                      item.imagen_url ||
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop"
                    }
                    alt={item.nombre}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop";
                    }}
                    className="w-20 h-20 rounded-2xl object-cover border border-stone-200 shrink-0"
                  />

                  {/* Nombre y Precio Unitario */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-stone-900 text-base truncate">
                      {item.nombre}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Precio: ${item.precio_unitario.toLocaleString("es-AR")} c/u
                    </p>
                    <p className="text-[11px] text-stone-600 mt-1">
                      Disponibles: {item.stock_disponible} unid.
                    </p>
                  </div>

                  {/* Selector de Cantidad */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50">
                      <button
                        onClick={() => handleDecrementar(item.producto_id, item.cantidad)}
                        className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-l-xl transition-colors"
                        title="Restar una unidad"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 text-sm font-bold text-stone-800">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() =>
                          handleIncrementar(
                            item.producto_id,
                            item.cantidad,
                            item.stock_disponible
                          )
                        }
                        className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-r-xl transition-colors"
                        title="Sumar una unidad"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="min-w-[90px] text-right">
                      <span className="text-sm font-black text-stone-900 block">
                        ${subtotal.toLocaleString("es-AR")}
                      </span>
                    </div>

                    {/* Eliminar Ítem */}
                    <button
                      onClick={() => {
                        quitar(item.producto_id);
                        toast.info(`"${item.nombre}" quitado del carrito`);
                      }}
                      className="p-2 text-stone-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                      title="Eliminar del pedido"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 hover:text-amber-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Seguir comprando y agregar más platos</span>
          </Link>
        </div>

        {/* Columna Derecha: Resumen de la Orden */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-3">
              Resumen de la Orden
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal ({cantTotal} ítems)</span>
                <span className="font-semibold text-stone-800">
                  ${totalCalculado.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Costo de Envío</span>
                <span className="font-bold text-emerald-600">¡GRATIS!</span>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-between items-baseline">
              <span className="text-base font-bold text-stone-900">Total Final</span>
              <span className="text-2xl font-black text-stone-900">
                ${totalCalculado.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Continuar al Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación para Vaciar Carrito (Idea Prog 3) */}
      <Modal
        abierto={modalVaciarAbierto}
        onCerrar={() => setModalVaciarAbierto(false)}
        titulo="¿Vaciar carrito de compras?"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>
              Se quitarán todos los platos agregados y tu carrito quedará en cero.
            </span>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalVaciarAbierto(false)}
              className="px-4 py-2 border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmarVaciar}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Sí, vaciar carrito
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
