import React from "react";
import { useNavigate } from "react-router-dom";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "../../../store/cartStore";
import { toast } from "../../../store/toastStore";

export const CartDrawer: React.FC = () => {
  const {
    items,
    isDrawerOpen,
    cerrarDrawer,
    cambiarCantidad,
    quitar,
    total,
    cantidadTotal
  } = useCartStore();

  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const totalCalculado = total();
  const cantTotal = cantidadTotal();

  const handleCheckout = () => {
    cerrarDrawer();
    navigate("/checkout");
  };

  const handleVerCarritoCompleto = () => {
    cerrarDrawer();
    navigate("/carrito");
  };

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Fondo oscuro con desenfoque */}
      <div
        onClick={cerrarDrawer}
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Panel deslizante lateral */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Cabecera */}
          <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#1e3a8a]" />
              <h2 className="text-base font-bold text-stone-900">Tu Carrito</h2>
              {cantTotal > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-[#1e3a8a]">
                  {cantTotal} {cantTotal === 1 ? "ítem" : "ítems"}
                </span>
              )}
            </div>
            <button
              onClick={cerrarDrawer}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cuerpo */}
          <div className="flex-1 overflow-y-auto p-5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-1">
                  Tu carrito está vacío
                </h3>
                <p className="text-sm text-stone-500 mb-6 max-w-xs">
                  Explorá nuestro catálogo y descubrí todas las opciones deliciosas que tenemos preparadas.
                </p>
                <button
                  onClick={cerrarDrawer}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6] to-[#1e3a8a] text-white font-semibold text-sm rounded-xl shadow-sm hover:opacity-95 transition-all cursor-pointer"
                >
                  Explorar Platos
                </button>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {items.map((item) => (
                  <div key={item.producto_id} className="py-3.5 flex gap-3.5 items-center">
                    {/* Imagen con fallback local */}
                    <img
                      src={item.imagen_url || "/assets/hamburguesa.jpg"}
                      alt={item.nombre}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/assets/hamburguesa.jpg";
                      }}
                      className="w-16 h-16 rounded-xl object-contain bg-slate-50 border border-stone-200 shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-stone-800 truncate">
                        {item.nombre}
                      </h4>
                      <p className="text-xs text-stone-500">
                        ${item.precio_unitario.toLocaleString("es-AR")} c/u
                      </p>

                      {/* Control cantidad */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                          <button
                            onClick={() => handleDecrementar(item.producto_id, item.cantidad)}
                            className="p-1 text-[#1e3a8a] hover:bg-stone-100 rounded-l-lg transition-colors cursor-pointer"
                            title="Restar una unidad"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-stone-800">
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
                            className="p-1 text-[#1e3a8a] hover:bg-stone-100 rounded-r-lg transition-colors cursor-pointer"
                            title="Sumar una unidad"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-[#1e3a8a] ml-auto">
                          ${(item.precio_unitario * item.cantidad).toLocaleString("es-AR")}
                        </span>
                      </div>
                    </div>

                    {/* Botón Eliminar */}
                    <button
                      onClick={() => {
                        quitar(item.producto_id);
                        toast.info(`${item.nombre} quitado del carrito`);
                      }}
                      className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pie con totales y acciones */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50/70 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-stone-600">Total a pagar</span>
                <span className="text-xl font-extrabold text-[#1e3a8a]">
                  ${totalCalculado.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleVerCarritoCompleto}
                  className="w-full py-2.5 px-3 border border-[#1e3a8a] hover:bg-blue-50 text-[#1e3a8a] font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Ver carrito
                </button>
                <button
                  onClick={handleCheckout}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6] to-[#1e3a8a] hover:from-[#1e40af] hover:to-[#1e40af] text-white font-semibold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Pedir ahora</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

