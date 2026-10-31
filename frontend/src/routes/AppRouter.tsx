import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../shared/layout/MainLayout";
import { ProtectedRoute } from "./ProtectedRoute";

// Páginas Públicas
import { CatalogoPage } from "../features/productos/pages/CatalogoPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { UnauthorizedPage } from "../features/auth/pages/UnauthorizedPage";
import { CarritoPage } from "../features/pedidos/pages/CarritoPage";

// Páginas de Cliente (Protegidas)
import { CheckoutPage } from "../features/pedidos/pages/CheckoutPage";
import { MisPedidosPage } from "../features/pedidos/pages/MisPedidosPage";

// Páginas de Administrador (Protegidas)
import { AdminResumenPage } from "../features/pedidos/pages/AdminResumenPage";
import { AdminPedidosPage } from "../features/pedidos/pages/AdminPedidosPage";
import { AdminCategoriasPage } from "../features/categorias/pages/AdminCategoriasPage";
import { AdminProductosPage } from "../features/productos/pages/AdminProductosPage";
import { AdminUsuariosPage } from "../features/usuarios/pages/AdminUsuariosPage";

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Rutas Públicas */}
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Rutas Protegidas para Clientes y Admins */}
          <Route element={<ProtectedRoute rolesPermitidos={["user", "admin"]} />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          </Route>

          {/* Rutas Protegidas Exclusivas de Administrador */}
          <Route element={<ProtectedRoute rolesPermitidos={["admin"]} />}>
            <Route path="/admin/resumen" element={<AdminResumenPage />} />
            <Route path="/admin/pedidos" element={<AdminPedidosPage />} />
            <Route path="/admin/categorias" element={<AdminCategoriasPage />} />
            <Route path="/admin/productos" element={<AdminProductosPage />} />
            <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
          </Route>

          {/* Ruta por defecto (404 / redirect a Home) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
