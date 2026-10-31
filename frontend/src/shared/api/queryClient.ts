import { QueryClient } from "@tanstack/react-query";

/**
 * Instancia singleton de TanStack Query para toda la aplicación.
 * Configura opciones por defecto de caché y reintentos.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 2 // 2 minutos de frescura para datos del servidor
    }
  }
});
