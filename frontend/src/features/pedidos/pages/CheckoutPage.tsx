import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import {
  MapPin,
  CreditCard,
  FileText,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Banknote,
  Send
} from "lucide-react";
import { useCartStore } from "../../../store/cartStore";
import { toast } from "../../../store/toastStore";
import { pedidosApi } from "../api/pedidosApi";
import { handleApiError } from "../../../shared/api/handleApiError";
import { FormaPago } from "../types";

export const CheckoutPage: React.FC = () => {
  const { items, total, vaciar } = useCartStore();
  const [errorCheckout, setErrorCheckout] = useState<string | null>(null);
  const navigate = useNavigate();

  const totalCalculado = total();

  const form = useForm({
    defaultValues: {
      direccion_entrega: "",
      forma_pago: "EFECTIVO" as FormaPago,
      notas: ""
    },
    onSubmit: async ({ value }) => {
      setErrorCheckout(null);

      if (items.length === 0) {
        toast.error("Tu carrito está vacío");
        navigate("/carrito");
        return;
      }

      try {
        const payload = {
          items: items.map((i) => ({
            producto_id: i.producto_id,
            cantidad: i.cantidad
          })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim() ? value.notas.trim() : null
        };

        const nuevoPedido = await pedidosApi.crearPedido(payload);

        // Vacía el carrito local y muestra toast de éxito
        vaciar();
        toast.success(`¡Pedido #${nuevoPedido.id} confirmado con éxito!`);
        navigate("/mis-pedidos");
      } catch (err) {
        const mensaje = handleApiError(err);
        setErrorCheckout(mensaje);
        toast.error(mensaje);
      }
    }
  });

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-800 mb-2">No hay productos para ordenar</h2>
        <p className="text-stone-500 text-sm mb-6">
          Tu carrito está vacío. Agregá al menos un plato antes de finalizar tu compra.
        </p>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-colors"
        >
          Explorar Menú
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Encabezado */}
      <div>
        <Link
          to="/carrito"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al carrito</span>
        </Link>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">Finalizar Compra</h1>
        <p className="text-stone-500 text-sm mt-0.5">
          Ingresá los datos de entrega para confirmar tu pedido
        </p>
      </div>

      {/* Banner de Error */}
      {errorCheckout && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorCheckout}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de Checkout */}
        <div className="lg:col-span-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6"
          >
            {/* Dirección de Entrega (RN-06: min 5, max 200) */}
            <form.Field
              name="direccion_entrega"
              validators={{
                onChange: ({ value }) =>
                  !value || value.trim().length === 0
                    ? "La dirección de entrega es obligatoria"
                    : value.trim().length < 5
                    ? "La dirección debe tener al menos 5 caracteres"
                    : value.trim().length > 200
                    ? "La dirección no puede superar los 200 caracteres"
                    : undefined
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5"
                  >
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span>Dirección de Entrega (Requerido)</span>
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="ej: Av. San Martín 1234, Dpto 2B, Ciudad"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-colors outline-none focus:ring-2 ${
                      field.state.meta.errors && field.state.meta.errors.length > 0
                        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                        : "border-stone-300 focus:border-amber-500 focus:ring-amber-100"
                    }`}
                  />
                  {field.state.meta.errors && field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                  <p className="text-[11px] text-stone-600 mt-1">
                    Entre 5 y 200 caracteres para asegurar la correcta llegada del repartidor.
                  </p>
                </div>
              )}
            </form.Field>

            {/* Forma de Pago */}
            <form.Field name="forma_pago">
              {(field) => (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    <span>Forma de Pago</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Efectivo */}
                    <button
                      type="button"
                      onClick={() => field.handleChange("EFECTIVO")}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        field.state.value === "EFECTIVO"
                          ? "border-amber-500 bg-amber-50/70 shadow-sm"
                          : "border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          field.state.value === "EFECTIVO"
                            ? "bg-amber-500 text-white"
                            : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-stone-900 block">
                          Efectivo
                        </span>
                        <span className="text-xs text-stone-500">
                          Abonás al recibir el pedido en tu puerta
                        </span>
                      </div>
                    </button>

                    {/* Transferencia */}
                    <button
                      type="button"
                      onClick={() => field.handleChange("TRANSFERENCIA")}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        field.state.value === "TRANSFERENCIA"
                          ? "border-amber-500 bg-amber-50/70 shadow-sm"
                          : "border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          field.state.value === "TRANSFERENCIA"
                            ? "bg-amber-500 text-white"
                            : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        <Send className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-stone-900 block">
                          Transferencia
                        </span>
                        <span className="text-xs text-stone-500">
                          Transferís por CBU / Alias luego de confirmar
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </form.Field>

            {/* Notas opcionales */}
            <form.Field name="notas">
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>Notas o Aclaraciones (Opcional)</span>
                  </label>
                  <textarea
                    id={field.name}
                    name={field.name}
                    rows={3}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="ej: Tocar timbre 2B, sin cebolla la hamburguesa, etc."
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm font-medium transition-colors outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 resize-none"
                  />
                </div>
              )}
            </form.Field>

            {/* Botón de Enviar Pedido */}
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-extrabold text-base shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Procesando pedido...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Confirmar y Realizar Pedido</span>
                    </>
                  )}
                </button>
              )}
            </form.Subscribe>
          </form>
        </div>

        {/* Resumen Lateral */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-black text-stone-900 border-b border-stone-100 pb-3">
              Detalle de Productos ({items.length})
            </h2>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.producto_id} className="flex justify-between items-start text-xs">
                  <div className="pr-2">
                    <span className="font-bold text-stone-800 block">
                      {item.cantidad}x {item.nombre}
                    </span>
                    <span className="text-stone-600">
                      ${item.precio_unitario.toLocaleString("es-AR")} c/u
                    </span>
                  </div>
                  <span className="font-bold text-stone-900 whitespace-nowrap">
                    ${(item.precio_unitario * item.cantidad).toLocaleString("es-AR")}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-stone-100 space-y-2 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-800">
                  ${totalCalculado.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Envío</span>
                <span className="font-bold text-emerald-600">Gratis</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-stone-100 text-sm font-black text-stone-900">
                <span>Total a pagar</span>
                <span className="text-xl">
                  ${totalCalculado.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
