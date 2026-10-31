import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
  rolesPermitidos?: ("user" | "admin")[];
}

/**
 * Componente guardián de rutas.
 * - Muestra un spinner mientras checkSession verifica la sesión con el backend.
 * - Si no hay sesión activa, redirige a /login.
 * - Si el usuario no tiene el rol permitido, redirige a /unauthorized.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ rolesPermitidos }) => {
  const { usuario, cargando } = useAuthStore();

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-stone-500">Verificando sesión...</p>
      </div>
    );
  }

  // Sin sesión activa
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Rol no autorizado
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
