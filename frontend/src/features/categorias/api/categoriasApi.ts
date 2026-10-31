import { axiosInstance } from "../../../shared/api/axiosInstance";
import { CategoriaPublic, CategoriaCreate, CategoriaUpdate } from "../types";

export const categoriasApi = {
  obtenerTodas: async (soloActivas: boolean = true): Promise<CategoriaPublic[]> => {
    const response = await axiosInstance.get<CategoriaPublic[]>(
      `/categorias?solo_activas=${soloActivas}`
    );
    return response.data;
  },

  crear: async (data: CategoriaCreate): Promise<CategoriaPublic> => {
    const response = await axiosInstance.post<CategoriaPublic>("/categorias", data);
    return response.data;
  },

  actualizar: async (id: number, data: CategoriaUpdate): Promise<CategoriaPublic> => {
    const response = await axiosInstance.put<CategoriaPublic>(`/categorias/${id}`, data);
    return response.data;
  },

  eliminar: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/categorias/${id}`);
  }
};
