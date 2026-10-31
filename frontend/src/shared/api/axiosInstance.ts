import axios from "axios";
import { useAuthStore } from "../../store/authStore";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

/**
 * Cliente Axios configurado para adjuntar cookies HttpOnly en cada petición (withCredentials: true).
 */
export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

// Interceptor de respuesta para manejar expiración de sesión y cuentas desactivadas
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const url = error.config?.url || "";
      const detail = error.response.data?.detail;

      const isAuthEndpoint = url.includes("/auth/token") || url.includes("/auth/me");

      // 1. Ante 401 fuera de los endpoints de autenticación, la sesión expiró
      if (status === 401 && !isAuthEndpoint) {
        useAuthStore.getState().limpiarSesion();
      }

      // 2. Ante 400 con texto exacto «Cuenta de usuario desactivada»
      if (status === 400 && detail === "Cuenta de usuario desactivada") {
        useAuthStore.getState().limpiarSesion();
      }
    }

    return Promise.reject(error);
  }
);
