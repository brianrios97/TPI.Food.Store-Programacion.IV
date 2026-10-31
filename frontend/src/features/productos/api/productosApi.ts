import { axiosInstance } from "../../../shared/api/axiosInstance";
import { ProductosPaginados, ProductoPublic } from "../types";

export interface FiltrosProductos {
  skip?: number;
  limit?: number;
  categoria_id?: number | null;
  q?: string;
  solo_activos?: boolean;
}

export const productosApi = {
  obtenerTodos: async (filtros: FiltrosProductos = {}): Promise<ProductosPaginados> => {
    const params = new URLSearchParams();
    if (filtros.skip !== undefined) params.append("skip", filtros.skip.toString());
    if (filtros.limit !== undefined) params.append("limit", filtros.limit.toString());
    if (filtros.categoria_id) params.append("categoria_id", filtros.categoria_id.toString());
    if (filtros.q && filtros.q.trim().length > 0) params.append("q", filtros.q.trim());
    if (filtros.solo_activos !== undefined) params.append("solo_activos", filtros.solo_activos.toString());

    const response = await axiosInstance.get<ProductosPaginados>(`/productos?${params.toString()}`);
    return response.data;
  },

  obtenerPorId: async (id: number): Promise<ProductoPublic> => {
    const response = await axiosInstance.get<ProductoPublic>(`/productos/${id}`);
    return response.data;
  }
};
