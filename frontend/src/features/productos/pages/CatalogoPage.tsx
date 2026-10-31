import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ShoppingBag, Utensils, X, Check, Flame } from "lucide-react";
import { productosApi } from "../api/productosApi";
import { categoriasApi } from "../../categorias/api/categoriasApi";
import { useCartStore } from "../../../store/cartStore";
import { toast } from "../../../store/toastStore";
import { CardSkeleton } from "../../../shared/components/Skeleton";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Paginacion } from "../../../shared/components/Paginacion";

const ITEMS_POR_PAGINA = 8;

export const CatalogoPage: React.FC = () => {
  const [pagina, setPagina] = useState(1);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const { items: itemsCarrito, agregar } = useCartStore();

  // 1. Consulta de Categorías
  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => categoriasApi.obtenerTodas(true)
  });

  // 2. Consulta de Productos Paginados
  const skip = (pagina - 1) * ITEMS_POR_PAGINA;
  const {
    data: dataProductos,
    isLoading,
    isError
  } = useQuery({
    queryKey: ["productos", { skip, limit: ITEMS_POR_PAGINA, categoria_id: categoriaSeleccionada, q: busqueda }],
    queryFn: () =>
      productosApi.obtenerTodos({
        skip,
        limit: ITEMS_POR_PAGINA,
        categoria_id: categoriaSeleccionada,
        q: busqueda,
        solo_activos: true
      })
  });

  const productos = dataProductos?.items || [];
  const totalItems = dataProductos?.total || 0;
  const totalPaginas = Math.ceil(totalItems / ITEMS_POR_PAGINA);

  // Manejadores
  const handleCambiarCategoria = (catId: number | null) => {
    setCategoriaSeleccionada(catId);
    setPagina(1);
  };

  const handleBuscar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setPagina(1);
  };

  const handleLimpiarBusqueda = () => {
    setBusqueda("");
    setPagina(1);
  };

  const handleAgregarAlCarrito = (producto: {
    id: number;
    nombre: string;
    precio_base: number;
    imagen_url?: string | null;
    stock: number;
  }) => {
    agregar({
      id: producto.id,
      nombre: producto.nombre,
      precio_base: producto.precio_base,
      imagen_url: producto.imagen_url || undefined,
      stock: producto.stock
    });
    toast.success(`¡"${producto.nombre}" agregado al carrito!`);
  };

  return (
    <div className="space-y-8">
      {/* Banner Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white p-8 sm:p-12 shadow-xl shadow-amber-500/15">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-amber-200" />
            <span>Delivery Rápido y Sabroso</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Los mejores sabores, directo a tu mesa.
          </h1>
          <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
            Platos preparados con los mejores ingredientes, hamburguesas caseras, pizzas al molde y pastas artesanales.
          </p>
        </div>
        {/* Decoración geométrica de fondo */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Buscador */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={busqueda}
            onChange={handleBuscar}
            placeholder="Buscar por nombre o descripción..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-medium placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all shadow-sm"
          />
          {busqueda && (
            <button
              onClick={handleLimpiarBusqueda}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
              title="Borrar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Píldoras de Categorías */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => handleCambiarCategoria(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              categoriaSeleccionada === null
                ? "bg-stone-900 text-white shadow-sm"
                : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            Todas
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCambiarCategoria(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                categoriaSeleccionada === cat.id
                  ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20"
                  : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Grilla de Productos */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: ITEMS_POR_PAGINA }).map((_, idx) => (
            <CardSkeleton key={idx} />
          ))}
        </div>
      ) : isError ? (
        <EstadoVacio
          titulo="Error al cargar productos"
          descripcion="No pudimos comunicarnos con el servidor. Por favor, reintentalo."
        />
      ) : productos.length === 0 ? (
        <EstadoVacio
          titulo="No se encontraron productos"
          descripcion="Probá seleccionando otra categoría o cambiando las palabras de búsqueda."
          icono={<Utensils className="w-8 h-8" />}
          accion={
            <button
              onClick={() => {
                setBusqueda("");
                setCategoriaSeleccionada(null);
                setPagina(1);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors shadow-sm"
            >
              Limpiar filtros
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productos.map((producto) => {
            const itemEnCarrito = itemsCarrito.find(
              (i) => i.producto_id === producto.id
            );
            const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;
            const sinStock = producto.stock <= 0;
            const limiteAlcanzado = cantidadEnCarrito >= producto.stock;

            return (
              <div
                key={producto.id}
                className="group bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-300 flex flex-col"
              >
                {/* Imagen del Producto */}
                <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                  <img
                    src={
                      producto.imagen_url ||
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop"
                    }
                    alt={producto.nombre}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Badge de Stock / Estado */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                    {sinStock ? (
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-red-500/90 text-white backdrop-blur-xs shadow-sm">
                        Agotado
                      </span>
                    ) : producto.stock <= 5 ? (
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-500/90 text-white backdrop-blur-xs shadow-sm">
                        ¡Últimos {producto.stock}!
                      </span>
                    ) : null}

                    {cantidadEnCarrito > 0 && (
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>{cantidadEnCarrito} en carrito</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-stone-900 text-base group-hover:text-amber-600 transition-colors line-clamp-1">
                      {producto.nombre}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                      {producto.descripcion || "Plato fresco y delicioso elaborado al momento."}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-600 block">
                        Precio
                      </span>
                      <span className="text-lg font-black text-stone-900">
                        ${producto.precio_base.toLocaleString("es-AR")}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAgregarAlCarrito(producto)}
                      disabled={sinStock || limiteAlcanzado}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        sinStock || limiteAlcanzado
                          ? "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
                          : "bg-amber-500 hover:bg-amber-600 active:scale-95 text-white shadow-amber-500/20 cursor-pointer"
                      }`}
                      title={
                        sinStock
                          ? "Sin stock"
                          : limiteAlcanzado
                          ? "Límite disponible ya en carrito"
                          : "Agregar al carrito"
                      }
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>
                        {sinStock
                          ? "Agotado"
                          : limiteAlcanzado
                          ? "Alcanzado"
                          : "Agregar"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      <Paginacion
        paginaActual={pagina}
        totalPaginas={totalPaginas}
        onCambiarPagina={(nuevaPagina) => {
          setPagina(nuevaPagina);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
};
