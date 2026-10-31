import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  imagen_url?: string;
  stock_disponible: number;
}

interface CartState {
  items: CartItem[];
  agregar: (producto: {
    id: number;
    nombre: string;
    precio_base: number;
    imagen_url?: string;
    stock: number;
  }, cantidad?: number) => void;
  quitar: (producto_id: number) => void;
  cambiarCantidad: (producto_id: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
  cantidadTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto, cantidad = 1) => {
        const { items } = get();
        const existente = items.find((i) => i.producto_id === producto.id);

        if (existente) {
          const nuevaCantidad = Math.min(
            existente.cantidad + cantidad,
            producto.stock
          );
          set({
            items: items.map((i) =>
              i.producto_id === producto.id
                ? { ...i, cantidad: nuevaCantidad, stock_disponible: producto.stock }
                : i
            )
          });
        } else {
          const cantidadInicial = Math.min(cantidad, producto.stock);
          if (cantidadInicial <= 0) return;

          set({
            items: [
              ...items,
              {
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio_base,
                cantidad: cantidadInicial,
                imagen_url: producto.imagen_url,
                stock_disponible: producto.stock
              }
            ]
          });
        }
      },

      quitar: (producto_id) => {
        set({
          items: get().items.filter((i) => i.producto_id !== producto_id)
        });
      },

      cambiarCantidad: (producto_id, cantidad) => {
        if (cantidad <= 0) {
          get().quitar(producto_id);
          return;
        }

        set({
          items: get().items.map((i) =>
            i.producto_id === producto_id
              ? { ...i, cantidad: Math.min(cantidad, i.stock_disponible) }
              : i
          )
        });
      },

      vaciar: () => {
        set({ items: [] });
      },

      total: () => {
        return get().items.reduce(
          (acc, item) => acc + item.precio_unitario * item.cantidad,
          0
        );
      },

      cantidadTotal: () => {
        return get().items.reduce((acc, item) => acc + item.cantidad, 0);
      }
    }),
    {
      name: "foodstore-cart"
    }
  )
);
