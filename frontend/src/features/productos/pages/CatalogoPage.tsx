import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ShoppingBag, Utensils, X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { productosApi } from "../api/productosApi";
import { categoriasApi } from "../../categorias/api/categoriasApi";
import { useCartStore } from "../../../store/cartStore";
import { toast } from "../../../store/toastStore";
import { CardSkeleton } from "../../../shared/components/Skeleton";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";

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
    toast.success(`¡${producto.nombre} agregado al carrito!`);
  };

  return (
    <div className="flex-1 min-h-0 flex gap-4 w-full overflow-hidden" style={{ height: "calc(100vh - 7.5rem)" }}>
      {/* SIDEBAR: Buscador + Lista de Categorías */}
      <aside className="w-52 shrink-0 bg-white rounded-xl p-3 border border-slate-200/90 shadow-sm flex flex-col overflow-hidden">
        {/* Buscador de productos */}
        <div className="relative mb-3">
          <input
            type="text"
            value={busqueda}
            onChange={handleBuscar}
            placeholder="Buscar producto..."
            className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]/30 transition-all"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          {busqueda && (
            <button
              onClick={handleLimpiarBusqueda}
              className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Borrar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Encabezado Categorías */}
        <h3 className="text-[11px] uppercase tracking-widest font-bold text-slate-500 mb-2 px-1">
          Categorías
        </h3>

        {/* Lista de Categorías */}
        <ul className="flex-1 overflow-y-auto space-y-0.5 pr-0.5 text-xs">
          <li>
            <button
              onClick={() => handleCambiarCategoria(null)}
              className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                categoriaSeleccionada === null
                  ? "bg-[#1e3a8a] text-white font-semibold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-[#1e3a8a]"
              }`}
            >
              Todas
            </button>
          </li>
          {categorias.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => handleCambiarCategoria(cat.id)}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                  categoriaSeleccionada === cat.id
                    ? "bg-[#1e3a8a] text-white font-semibold shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-[#1e3a8a]"
                }`}
              >
                <span className="truncate block">{cat.nombre}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-3 flex-1 min-h-0" style={{ gridTemplateRows: "1fr 1fr" }}>
            {Array.from({ length: ITEMS_POR_PAGINA }).map((_, idx) => (
              <CardSkeleton key={idx} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex-1 flex items-center justify-center">
            <EstadoVacio
              titulo="Error al cargar productos"
              descripcion="No pudimos comunicarnos con el servidor. Por favor, reintentalo."
            />
          </div>
        ) : productos.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <EstadoVacio
              titulo="No se encontraron productos"
              descripcion="Probá seleccionando otra categoría o cambiando las palabras de búsqueda."
              icono={<Utensils className="w-8 h-8 text-[#1e3a8a]" />}
              accion={
                <button
                  onClick={() => {
                    setBusqueda("");
                    setCategoriaSeleccionada(null);
                    setPagina(1);
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6] to-[#1e3a8a] text-white text-xs font-bold hover:opacity-90 shadow-sm cursor-pointer"
                >
                  Limpiar filtros
                </button>
              }
            />
          </div>
        ) : (
          <div
            className="grid grid-cols-4 gap-3 flex-1 min-h-0 overflow-hidden"
            style={{ gridTemplateRows: "1fr 1fr" }}
          >
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
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col overflow-hidden"
                >
                  {/* Imagen — ocupa la mayoría del espacio */}
                  <div className="relative flex-1 min-h-0 bg-slate-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={producto.imagen_url || "/assets/hamburguesa.jpg"}
                      alt={producto.nombre}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/assets/hamburguesa.jpg";
                      }}
                      className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                      style={{ maxHeight: "100%" }}
                    />

                    {/* Badge stock / carrito */}
                    <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 items-end">
                      {sinStock && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white shadow-xs">
                          Agotado
                        </span>
                      )}
                      {!sinStock && producto.stock <= 5 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white shadow-xs">
                          ¡Últimos {producto.stock}!
                        </span>
                      )}
                      {cantidadEnCarrito > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-600 text-white shadow-xs flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" />
                          {cantidadEnCarrito}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Datos compactos en la parte baja */}
                  <div className="px-2.5 pt-1.5 pb-2 shrink-0 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-800 truncate leading-tight" title={producto.nombre}>
                      {producto.nombre}
                    </h3>
                    <p className="text-[10px] text-slate-500 truncate" title={producto.descripcion || ""}>
                      {producto.descripcion || "Elaborado con ingredientes frescos"}
                    </p>

                    <div className="flex items-center justify-between mt-1.5 gap-1.5">
                      <span className="text-sm font-extrabold text-[#1e3a8a] leading-none">
                        ${producto.precio_base.toLocaleString("es-AR")}
                      </span>

                      {sinStock ? (
                        <button disabled className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-800 via-red-500 to-red-800 text-white font-bold text-[10px] cursor-not-allowed opacity-90 shrink-0">
                          Agotado
                        </button>
                      ) : limiteAlcanzado ? (
                        <button disabled className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 text-slate-500 font-bold text-[10px] cursor-not-allowed shrink-0">
                          Máx. {cantidadEnCarrito}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAgregarAlCarrito(producto)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6] to-[#1e3a8a] hover:from-[#1e40af] hover:to-[#1e40af] text-white font-bold text-[10px] shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                        >
                          <ShoppingBag className="w-2.5 h-2.5" />
                          <span>Agregar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginación Metalizada */}
        <div className="flex items-center justify-center gap-3 py-1.5 shrink-0">
          <button
            onClick={() => setPagina((p) => Math.max(p - 1, 1))}
            disabled={pagina <= 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6] to-[#1e3a8a] hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Anterior</span>
          </button>

          <span className="text-xs font-semibold text-slate-600">
            Página {pagina} de {totalPaginas || 1}
          </span>

          <button
            onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas))}
            disabled={pagina >= totalPaginas}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6] to-[#1e3a8a] hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </main>
    </div>
  );
};
