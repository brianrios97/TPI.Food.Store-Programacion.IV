import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, User, LogOut } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";

export const Navbar: React.FC = () => {
  const { usuario, logout } = useAuthStore();
  const cantidadCarrito = useCartStore((state) => state.cantidadTotal());
  const toggleDrawer = useCartStore((state) => state.toggleDrawer);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="shrink-0 bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6] to-[#1e3a8a] text-white shadow-md z-40">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo / Marca */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
              <span className="text-2xl">🍔</span>
              <span className="text-xl font-bold tracking-tight text-white">Food Store</span>
            </Link>

            <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
              <Link to="/" className="text-white hover:text-blue-100 transition-colors">
                Inicio
              </Link>
              {usuario && usuario.role === "user" && (
                <Link to="/mis-pedidos" className="text-white/80 hover:text-white transition-colors">
                  Mis Pedidos
                </Link>
              )}
              {usuario && usuario.role === "admin" && (
                <Link to="/admin/resumen" className="text-white/80 hover:text-white transition-colors">
                  Panel Admin
                </Link>
              )}
            </nav>
          </div>

          {/* Acciones Derecha */}
          <div className="flex items-center gap-3">
            {/* Botón Carrito estilo TP3 */}
            <button
              onClick={toggleDrawer}
              className="bg-white text-[#1e3a8a] hover:bg-blue-50 px-3.5 py-1.5 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-sm transition-transform hover:scale-105 cursor-pointer"
              title="Ver Carrito"
            >
              <ShoppingBag className="w-4 h-4 text-[#1e3a8a]" />
              <span>Carrito</span>
              {cantidadCarrito > 0 && (
                <span className="bg-[#1e3a8a] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cantidadCarrito}
                </span>
              )}
            </button>

            {usuario ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-xs">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white leading-tight">{usuario.full_name}</div>
                    <div className="text-[10px] text-blue-100 uppercase tracking-wider">{usuario.role}</div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-white/10 hover:bg-white/20 border border-blue-300/40 text-white px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cerrar sesión</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <Link
                  to="/login"
                  className="bg-white/10 hover:bg-white/20 border border-blue-300/40 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
                >
                  Ingresar
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-[#1e3a8a] hover:bg-blue-50 px-3 py-1.5 rounded-md text-xs font-bold shadow-sm transition-all"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

