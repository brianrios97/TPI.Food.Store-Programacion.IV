import { axiosInstance } from "../../../shared/api/axiosInstance";
import { UserPublic } from "../../auth/types";

export const usuariosApi = {
  obtenerTodos: async (): Promise<UserPublic[]> => {
    const response = await axiosInstance.get<UserPublic[]>("/admin/usuarios");
    return response.data;
  },

  activar: async (id: number): Promise<UserPublic> => {
    const response = await axiosInstance.post<UserPublic>(`/admin/usuarios/${id}/activar`);
    return response.data;
  },

  desactivar: async (id: number): Promise<UserPublic> => {
    const response = await axiosInstance.post<UserPublic>(`/admin/usuarios/${id}/desactivar`);
    return response.data;
  }
};

