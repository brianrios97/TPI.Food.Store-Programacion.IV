import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { ToastContainer } from "../ui/ToastContainer";
import { CartDrawer } from "../../features/pedidos/components/CartDrawer";

export const MainLayout: React.FC = () => {
  return (
    <div className="h-screen w-screen flex flex-col bg-[#eef2f6] text-[#1e293b] overflow-hidden">
      <ToastContainer />
      <CartDrawer />
      <Navbar />
      <main className="flex-1 min-h-0 w-full overflow-hidden flex flex-col px-4 sm:px-6 py-2">
        <Outlet />
      </main>
      <footer className="bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6] to-[#1e3a8a] text-white text-center py-2 text-xs font-medium shrink-0 shadow-md">
        <p>© 2026 Food Store - Todos los derechos reservados | Desarrollado por Brian Emanuel Rios</p>
      </footer>
    </div>
  );
};

