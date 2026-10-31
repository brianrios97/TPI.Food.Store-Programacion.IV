import axios from "axios";

/**
 * Extrae y formatea el mensaje de error retornado por la API FastAPI.
 * Maneja cadenas simples, errores de validación (Pydantic 422) y errores de red.
 */
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (data && typeof data === "object") {
      // 1. Mensaje de error simple { detail: "string" }
      if (typeof data.detail === "string") {
        return data.detail;
      }

      // 2. Errores de validación de Pydantic { detail: [ { loc, msg, ... } ] }
      if (Array.isArray(data.detail)) {
        return data.detail
          .map((item: { msg?: string; loc?: string[] }) => item.msg || JSON.stringify(item))
          .join(" | ");
      }

      // 3. Objeto genérico con propiedad message
      if ("message" in data && typeof data.message === "string") {
        return data.message;
      }
    }

    if (error.response?.status === 404) {
      return "El recurso solicitado no fue encontrado.";
    }

    if (error.response?.status === 403) {
      return "No tienes permisos para realizar esta acción.";
    }

    if (error.response?.status === 401) {
      return "Sesión no válida o expirada. Por favor, inicia sesión.";
    }

    if (error.message === "Network Error") {
      return "Error de conexión. Verifica que el servidor backend esté corriendo.";
    }

    return error.message || "Error al procesar la solicitud.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ha ocurrido un error inesperado.";
}

