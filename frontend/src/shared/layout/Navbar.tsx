import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Utensils, User, LogOut, ShieldCheck, ClipboardList } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";

export const Navbar: React.FC = () => {
  const { usuario, logout } = useAuthStore();
  const cantidadCarrito = useCartStore((state) => state.cantidadTotal());
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Marca */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-stone-900">Food<span className="text-amber-600">Store</span></span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-stone-600 -mt-1">Delivery</span>
            </div>
          </Link>

          {/* Navegación Derecha */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Botón Carrito */}
            <Link
              to="/carrito"
              className="relative p-2.5 text-stone-700 hover:text-amber-600 rounded-lg hover:bg-stone-100 transition-colors"
              title="Ver Carrito de Compras"
            >
              <ShoppingBag className="w-5 h-5" />
              {cantidadCarrito > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm animate-pulse">
                  {cantidadCarrito}
                </span>
              )}
            </Link>

            {usuario ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Si es Admin: acceso al panel */}
                {usuario.role === "admin" && (
                  <Link
                    to="/admin/resumen"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Panel Admin</span>
                  </Link>
                )}

                {/* Si es Cliente: acceso a Mis Pedidos */}
                {usuario.role === "user" && (
                  <Link
                    to="/mis-pedidos"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                  >
                    <ClipboardList className="w-4 h-4 text-stone-500" />
                    <span className="hidden sm:inline">Mis Pedidos</span>
                  </Link>
                )}

                {/* Badge de Usuario y Rol */}
                <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                  <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-xs font-bold text-stone-800 leading-none">{usuario.full_name}</div>
                    <div className="text-[10px] text-stone-600 font-medium capitalize">{usuario.role}</div>
                  </div>
                </div>

                {/* Botón Salir */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-stone-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-semibold text-stone-700 hover:text-stone-900 transition-colors"
                >
                  Ingresar
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition-colors"
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
