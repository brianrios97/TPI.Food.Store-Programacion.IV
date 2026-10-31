import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-stone-50 text-stone-900">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-stone-200 py-6 bg-white text-center text-xs text-stone-500">
        <p>Food Store &copy; 2026 - Trabajo Práctico Integrador de Programación IV (UTN)</p>
      </footer>
    </div>
  );
};
