import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { UserPublic } from "../features/auth/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

interface AuthState {
  usuario: UserPublic | null;
  cargando: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  limpiarSesion: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username: string, password: string) => {
        set({ cargando: true });
        try {
          const formData = new URLSearchParams();
          formData.append("username", username);
          formData.append("password", password);

          // 1. Envía credenciales con OAuth2; el backend establece la cookie HttpOnly
          await axios.post(`${API_URL}/auth/token`, formData, {
            withCredentials: true,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
          });

          // 2. Obtiene datos del perfil recién autenticado
          const meResponse = await axios.get<UserPublic>(`${API_URL}/auth/me`, {
            withCredentials: true
          });

          set({ usuario: meResponse.data, cargando: false });
        } catch (error) {
          set({ usuario: null, cargando: false });
          throw error;
        }
      },

      logout: async () => {
        set({ cargando: true });
        try {
          await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
        } catch {
          // Ignorar error al cerrar sesión
        } finally {
          set({ usuario: null, cargando: false });
        }
      },

      checkSession: async () => {
        set({ cargando: true });
        try {
          const res = await axios.get<UserPublic>(`${API_URL}/auth/me`, {
            withCredentials: true
          });
          set({ usuario: res.data, cargando: false });
        } catch {
          // Si no hay cookie o expiró, limpia el estado
          set({ usuario: null, cargando: false });
        }
      },

      limpiarSesion: () => {
        set({ usuario: null, cargando: false });
      }
    }),
    {
      name: "foodstore-auth",
      // Exigencia de la consigna: partialize guarda solo usuario, nunca el token
      partialize: (state) => ({ usuario: state.usuario })
    }
  )
);
