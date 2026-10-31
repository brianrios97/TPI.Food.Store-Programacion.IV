import { axiosInstance } from "../../../shared/api/axiosInstance";
import { PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos, EstadoPedido } from "../types";

export const pedidosApi = {
  obtenerMisPedidos: async (): Promise<PedidoRead[]> => {
    const response = await axiosInstance.get<PedidoRead[]>("/pedidos");
    return response.data;
  },

  crearPedido: async (dto: PedidoCreate): Promise<PedidoRead> => {
    const response = await axiosInstance.post<PedidoRead>("/pedidos", dto);
    return response.data;
  },

  cancelarPedido: async (id: number): Promise<PedidoRead> => {
    const response = await axiosInstance.patch<PedidoRead>(`/pedidos/${id}/cancelar`);
    return response.data;
  },

  // Para el administrador
  obtenerTodosAdmin: async (skip: number = 0, limit: number = 20, estado?: string): Promise<PedidosPaginados> => {
    const params = new URLSearchParams();
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());
    if (estado) params.append("estado", estado);

    const response = await axiosInstance.get<PedidosPaginados>(`/pedidos/admin?${params.toString()}`);
    return response.data;
  },

  cambiarEstadoAdmin: async (id: number, nuevoEstado: EstadoPedido): Promise<PedidoRead> => {
    const response = await axiosInstance.patch<PedidoRead>(`/pedidos/${id}/estado`, {
      estado: nuevoEstado
    });
    return response.data;
  },

  obtenerResumenAdmin: async (): Promise<ResumenPedidos> => {
    const response = await axiosInstance.get<ResumenPedidos>("/pedidos/resumen");
    return response.data;
  }
};
