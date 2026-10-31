import { create } from "zustand";

export type ToastTipo = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  tipo: ToastTipo;
  mensaje: string;
}

interface ToastState {
  toasts: ToastItem[];
  agregarToast: (mensaje: string, tipo?: ToastTipo) => void;
  eliminarToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  agregarToast: (mensaje: string, tipo: ToastTipo = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, tipo, mensaje }]
    }));

    // Auto-eliminar después de 3.5 segundos
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, 3500);
  },

  eliminarToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  }
}));

// Atajos para uso directo en cualquier función o componente sin hooks
export const toast = {
  success: (mensaje: string) => useToastStore.getState().agregarToast(mensaje, "success"),
  error: (mensaje: string) => useToastStore.getState().agregarToast(mensaje, "error"),
  info: (mensaje: string) => useToastStore.getState().agregarToast(mensaje, "info"),
  warning: (mensaje: string) => useToastStore.getState().agregarToast(mensaje, "warning")
};
