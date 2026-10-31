import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef
} from "@tanstack/react-table";
import { useForm } from "@tanstack/react-form";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Minus,
  CheckCircle,
  XCircle,
  Image as ImageIcon
} from "lucide-react";
import { productosApi } from "../api/productosApi";
import { categoriasApi } from "../../categorias/api/categoriasApi";
import { ProductoPublic, ProductoCreate, ProductoUpdate } from "../types";
import { AdminNav } from "../../../shared/layout/AdminNav";
import { Modal } from "../../../shared/ui/Modal";
import { toast } from "../../../store/toastStore";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Skeleton } from "../../../shared/components/Skeleton";

export const AdminProductosPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [globalFilter, setGlobalFilter] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<ProductoPublic | null>(null);
  const [productoAEliminar, setProductoAEliminar] = useState<ProductoPublic | null>(null);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // 1. Obtener todos los productos y categorías
  const { data: dataProductos, isLoading: loadingProductos } = useQuery({
    queryKey: ["admin-productos"],
    queryFn: () => productosApi.obtenerTodos({ limit: 100, solo_activos: false })
  });
  const productos = dataProductos?.items || [];

  const { data: categorias = [] } = useQuery({
    queryKey: ["admin-categorias"],
    queryFn: () => categoriasApi.obtenerTodas(false)
  });

  const mapaCategorias = useMemo(() => {
    const map = new Map<number, string>();
    categorias.forEach((c) => map.set(c.id, c.nombre));
    return map;
  }, [categorias]);

  // 2. Mutaciones
  const crearMutation = useMutation({
    mutationFn: (dto: ProductoCreate) => productosApi.crear(dto),
    onSuccess: (nuevo) => {
      queryClient.invalidateQueries({ queryKey: ["admin-productos"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      setModalAbierto(false);
      toast.success(`Producto "${nuevo.nombre}" creado exitosamente`);
    },
    onError: (err) => {
      const msg = handleApiError(err);
      setErrorForm(msg);
      toast.error(msg);
    }
  });

  const editarMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: ProductoUpdate }) =>
      productosApi.actualizar(id, dto),
    onSuccess: (actualizado) => {
      queryClient.invalidateQueries({ queryKey: ["admin-productos"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      setModalAbierto(false);
      setProductoEditando(null);
      toast.success(`Producto "${actualizado.nombre}" actualizado`);
    },
    onError: (err) => {
      const msg = handleApiError(err);
      setErrorForm(msg);
      toast.error(msg);
    }
  });

  const stockMutation = useMutation({
    mutationFn: ({
      id,
      stock,
      activo
    }: {
      id: number;
      stock: number;
      activo?: boolean;
    }) => productosApi.actualizarStock(id, { stock, activo }),
    onSuccess: (prod) => {
      queryClient.invalidateQueries({ queryKey: ["admin-productos"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      toast.success(`Stock de "${prod.nombre}" actualizado a ${prod.stock}`);
    },
    onError: (err) => {
      const msg = handleApiError(err);
      toast.error(msg);
    }
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => productosApi.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-productos"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      setProductoAEliminar(null);
      toast.success("Producto dado de baja exitosamente");
    },
    onError: (err) => {
      const msg = handleApiError(err);
      toast.error(msg);
    }
  });

  // 3. TanStack Form para Creación / Edición
  const form = useForm({
    defaultValues: {
      nombre: productoEditando ? productoEditando.nombre : "",
      descripcion: productoEditando?.descripcion || "",
      precio_base: productoEditando ? productoEditando.precio_base.toString() : "",
      stock: productoEditando ? productoEditando.stock.toString() : "10",
      categoria_id: productoEditando
        ? productoEditando.categoria_id.toString()
        : categorias[0]?.id.toString() || "",
      imagen_url: productoEditando?.imagen_url || ""
    },
    onSubmit: async ({ value }) => {
      setErrorForm(null);
      const precioNum = parseFloat(value.precio_base);
      const stockNum = parseInt(value.stock, 10);
      const catIdNum = parseInt(value.categoria_id, 10);

      if (isNaN(precioNum) || precioNum <= 0) {
        setErrorForm("El precio debe ser un número mayor a cero");
        return;
      }
      if (isNaN(stockNum) || stockNum < 0) {
        setErrorForm("El stock debe ser un número igual o mayor a cero");
        return;
      }
      if (isNaN(catIdNum)) {
        setErrorForm("Debe seleccionar una categoría");
        return;
      }

      if (productoEditando) {
        editarMutation.mutate({
          id: productoEditando.id,
          dto: {
            nombre: value.nombre.trim(),
            descripcion: value.descripcion.trim() || null,
            precio_base: precioNum,
            stock: stockNum,
            categoria_id: catIdNum,
            imagen_url: value.imagen_url.trim() || null
          }
        });
      } else {
        crearMutation.mutate({
          nombre: value.nombre.trim(),
          descripcion: value.descripcion.trim() || null,
          precio_base: precioNum,
          stock: stockNum,
          categoria_id: catIdNum,
          imagen_url: value.imagen_url.trim() || null
        });
      }
    }
  });

  const handleAbrirCrear = () => {
    setProductoEditando(null);
    form.reset();
    form.setFieldValue("nombre", "");
    form.setFieldValue("descripcion", "");
    form.setFieldValue("precio_base", "");
    form.setFieldValue("stock", "10");
    form.setFieldValue("categoria_id", categorias[0]?.id.toString() || "");
    form.setFieldValue("imagen_url", "");
    setErrorForm(null);
    setModalAbierto(true);
  };

  const handleAbrirEditar = (prod: ProductoPublic) => {
    setProductoEditando(prod);
    form.setFieldValue("nombre", prod.nombre);
    form.setFieldValue("descripcion", prod.descripcion || "");
    form.setFieldValue("precio_base", prod.precio_base.toString());
    form.setFieldValue("stock", prod.stock.toString());
    form.setFieldValue("categoria_id", prod.categoria_id.toString());
    form.setFieldValue("imagen_url", prod.imagen_url || "");
    setErrorForm(null);
    setModalAbierto(true);
  };

  // 4. Definición de Columnas de TanStack Table
  const columns = useMemo<ColumnDef<ProductoPublic>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: "Producto",
        cell: ({ row }) => {
          const prod = row.original;
          return (
            <div className="flex items-center gap-3">
              <img
                src={
                  prod.imagen_url ||
                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop"
                }
                alt={prod.nombre}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop";
                }}
                className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
              />
              <div className="min-w-0">
                <span className="font-bold text-stone-900 text-xs block truncate">
                  {prod.nombre}
                </span>
                <span className="text-[11px] text-stone-500 line-clamp-1">
                  {prod.descripcion || "Sin descripción"}
                </span>
              </div>
            </div>
          );
        }
      },
      {
        accessorKey: "categoria_id",
        header: "Categoría",
        cell: (info) => {
          const catId = info.getValue<number>();
          const nombreCat = mapaCategorias.get(catId) || `Cat #${catId}`;
          return (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-stone-100 text-stone-700 border border-stone-200">
              {nombreCat}
            </span>
          );
        }
      },
      {
        accessorKey: "precio_base",
        header: "Precio",
        cell: (info) => (
          <span className="font-black text-stone-900 text-xs">
            ${info.getValue<number>().toLocaleString("es-AR")}
          </span>
        )
      },
      {
        accessorKey: "stock",
        header: "Stock (Edición Rápida)",
        cell: ({ row }) => {
          const prod = row.original;
          return (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  stockMutation.mutate({
                    id: prod.id,
                    stock: Math.max(0, prod.stock - 1)
                  })
                }
                disabled={prod.stock <= 0 || stockMutation.isPending}
                className="p-1 rounded-md border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-30 transition-colors"
                title="Restar 1 unidad"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span
                className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                  prod.stock === 0
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-stone-50 text-stone-800 border border-stone-200"
                }`}
              >
                {prod.stock}
              </span>
              <button
                onClick={() =>
                  stockMutation.mutate({
                    id: prod.id,
                    stock: prod.stock + 1
                  })
                }
                disabled={stockMutation.isPending}
                className="p-1 rounded-md border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-30 transition-colors"
                title="Sumar 1 unidad"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          );
        }
      },
      {
        accessorKey: "activo",
        header: "Disponibilidad",
        cell: ({ row }) => {
          const prod = row.original;
          return (
            <button
              onClick={() =>
                stockMutation.mutate({
                  id: prod.id,
                  stock: prod.stock,
                  activo: !prod.activo
                })
              }
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full border transition-colors cursor-pointer ${
                prod.activo
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  : "bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200"
              }`}
              title="Clic para cambiar disponibilidad"
            >
              {prod.activo ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Disponible</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-stone-500" />
                  <span>Pausado</span>
                </>
              )}
            </button>
          );
        }
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const prod = row.original;
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAbrirEditar(prod)}
                className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-colors cursor-pointer"
                title="Editar producto"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              {prod.activo && (
                <button
                  onClick={() => setProductoAEliminar(prod)}
                  className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                  title="Dar de baja (baja lógica)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        }
      }
    ],
    [mapaCategorias, stockMutation]
  );

  // 5. Configuración de la Tabla
  const table = useReactTable({
    data: productos,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: { pageSize: 8 }
    }
  });

  return (
    <div className="space-y-6">
      <AdminNav
        titulo="Gestión de Productos"
        subtitulo="Administración de platos, precios, recetas y control de stock"
        accion={
          <button
            onClick={handleAbrirCrear}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        }
      />

      {/* Barra de Filtro Global */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Filtrar por nombre o descripción..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
          />
        </div>
      </div>

      {/* Tabla con TanStack Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        {loadingProductos ? (
          <div className="p-6 space-y-3">
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-stone-200 bg-stone-50/70">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="py-3 px-5 text-xs font-bold uppercase tracking-wider text-stone-600"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-stone-100">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="py-8 text-center text-xs text-stone-500">
                      No se encontraron productos.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-stone-50/60 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="py-3.5 px-5 text-xs">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginador */}
        {!loadingProductos && table.getPageCount() > 1 && (
          <div className="px-5 py-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600 bg-stone-50/40">
            <span>
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()} (Total:{" "}
              {productos.length} platos)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-1.5 border border-stone-200 rounded-lg hover:bg-stone-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-1.5 border border-stone-200 rounded-lg hover:bg-stone-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal con TanStack Form (Alta / Edición de Producto) */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={productoEditando ? "Editar Producto" : "Nuevo Producto"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {errorForm && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorForm}</span>
            </div>
          )}

          {/* Nombre */}
          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) =>
                !value || value.trim().length === 0
                  ? "El nombre es obligatorio"
                  : value.trim().length < 3
                  ? "Mínimo 3 caracteres"
                  : undefined
            }}
          >
            {(field) => (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Nombre del plato
                </label>
                <input
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="ej: Hamburguesa Bacon Doble"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
                {field.state.meta.errors && field.state.meta.errors.length > 0 && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Categoría */}
          <form.Field name="categoria_id">
            {(field) => (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Categoría
                </label>
                <select
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none bg-white"
                >
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id.toString()}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>

          {/* Fila: Precio Base y Stock */}
          <div className="grid grid-cols-2 gap-3">
            <form.Field name="precio_base">
              {(field) => (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="ej: 12000"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="stock">
              {(field) => (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Stock Inicial
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="ej: 25"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>
              )}
            </form.Field>
          </div>

          {/* Descripción */}
          <form.Field name="descripcion">
            {(field) => (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Detalles de los ingredientes y elaboración..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none resize-none"
                />
              </div>
            )}
          </form.Field>

          {/* URL de Imagen */}
          <form.Field name="imagen_url">
            {(field) => (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>URL de la Imagen</span>
                </label>
                <input
                  type="url"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>
            )}
          </form.Field>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setModalAbierto(false)}
              className="px-4 py-2 border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  disabled={
                    !canSubmit ||
                    isSubmitting ||
                    crearMutation.isPending ||
                    editarMutation.isPending
                  }
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  {isSubmitting || crearMutation.isPending || editarMutation.isPending
                    ? "Guardando..."
                    : productoEditando
                    ? "Guardar Cambios"
                    : "Crear Producto"}
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmación de Baja de Producto */}
      <Modal
        abierto={productoAEliminar !== null}
        onCerrar={() => setProductoAEliminar(null)}
        titulo="¿Dar de baja este producto?"
      >
        <div className="space-y-4">
          <p className="text-xs text-stone-600">
            El producto <strong className="text-stone-900">{productoAEliminar?.nombre}</strong>{" "}
            pasará al estado inactivo y no se mostrará a los clientes en el catálogo.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setProductoAEliminar(null)}
              className="px-4 py-2 border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={eliminarMutation.isPending}
              onClick={() => {
                if (productoAEliminar) {
                  eliminarMutation.mutate(productoAEliminar.id);
                }
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-stone-300 text-white text-xs font-bold rounded-xl transition-colors"
            >
              {eliminarMutation.isPending ? "Eliminando..." : "Sí, dar de baja"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
