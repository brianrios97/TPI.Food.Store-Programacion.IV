import { axiosInstance } from "../../../shared/api/axiosInstance";
import { CategoriaPublic } from "../types";

export const categoriasApi = {
  obtenerTodas: async (soloActivas: boolean = true): Promise<CategoriaPublic[]> => {
    const response = await axiosInstance.get<CategoriaPublic[]>(
      `/categorias?solo_activas=${soloActivas}`
    );
    return response.data;
  }
};

