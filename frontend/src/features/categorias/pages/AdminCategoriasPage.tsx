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
  CheckCircle,
  XCircle
} from "lucide-react";
import { categoriasApi } from "../api/categoriasApi";
import { CategoriaPublic, CategoriaCreate, CategoriaUpdate } from "../types";
import { AdminNav } from "../../../shared/layout/AdminNav";
import { Modal } from "../../../shared/ui/Modal";
import { toast } from "../../../store/toastStore";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Skeleton } from "../../../shared/components/Skeleton";

export const AdminCategoriasPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [globalFilter, setGlobalFilter] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<CategoriaPublic | null>(null);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState<CategoriaPublic | null>(null);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // 1. Obtener todas las categorías (incluyendo inactivas)
  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ["admin-categorias"],
    queryFn: () => categoriasApi.obtenerTodas(false)
  });

  // 2. Mutaciones
  const crearMutation = useMutation({
    mutationFn: (dto: CategoriaCreate) => categoriasApi.crear(dto),
    onSuccess: (nueva) => {
      queryClient.invalidateQueries({ queryKey: ["admin-categorias"] });
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      setModalAbierto(false);
      toast.success(`Categoría "${nueva.nombre}" creada con éxito`);
    },
    onError: (err) => {
      const msg = handleApiError(err);
      setErrorForm(msg);
      toast.error(msg);
    }
  });

  const editarMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: CategoriaUpdate }) =>
      categoriasApi.actualizar(id, dto),
    onSuccess: (actualizada) => {
      queryClient.invalidateQueries({ queryKey: ["admin-categorias"] });
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      setModalAbierto(false);
      setCategoriaEditando(null);
      toast.success(`Categoría "${actualizada.nombre}" actualizada`);
    },
    onError: (err) => {
      const msg = handleApiError(err);
      setErrorForm(msg);
      toast.error(msg);
    }
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => categoriasApi.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categorias"] });
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      setCategoriaAEliminar(null);
      toast.success("Categoría desactivada exitosamente");
    },
    onError: (err) => {
      const msg = handleApiError(err);
      toast.error(msg);
    }
  });

  // 3. TanStack Form para Creación / Edición
  const form = useForm({
    defaultValues: {
      nombre: categoriaEditando ? categoriaEditando.nombre : "",
      descripcion: categoriaEditando?.descripcion || ""
    },
    onSubmit: async ({ value }) => {
      setErrorForm(null);
      if (categoriaEditando) {
        editarMutation.mutate({
          id: categoriaEditando.id,
          dto: {
            nombre: value.nombre.trim(),
            descripcion: value.descripcion.trim() || null
          }
        });
      } else {
        crearMutation.mutate({
          nombre: value.nombre.trim(),
          descripcion: value.descripcion.trim() || null
        });
      }
    }
  });

  const handleAbrirCrear = () => {
    setCategoriaEditando(null);
    form.reset();
    form.setFieldValue("nombre", "");
    form.setFieldValue("descripcion", "");
    setErrorForm(null);
    setModalAbierto(true);
  };

  const handleAbrirEditar = (cat: CategoriaPublic) => {
    setCategoriaEditando(cat);
    form.setFieldValue("nombre", cat.nombre);
    form.setFieldValue("descripcion", cat.descripcion || "");
    setErrorForm(null);
    setModalAbierto(true);
  };

  // 4. Definición de Columnas de TanStack Table
  const columns = useMemo<ColumnDef<CategoriaPublic>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: (info) => (
          <span className="font-mono text-xs text-stone-500 font-semibold">
            #{info.getValue<number>()}
          </span>
        )
      },
      {
        accessorKey: "nombre",
        header: "Nombre",
        cell: (info) => (
          <span className="font-bold text-stone-900 text-sm">
            {info.getValue<string>()}
          </span>
        )
      },
      {
        accessorKey: "descripcion",
        header: "Descripción",
        cell: (info) => (
          <span className="text-xs text-stone-600 line-clamp-1">
            {info.getValue<string>() || "-"}
          </span>
        )
      },
      {
        accessorKey: "activo",
        header: "Estado",
        cell: (info) => {
          const activo = info.getValue<boolean>();
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${
                activo
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-stone-100 border-stone-200 text-stone-600"
              }`}
            >
              {activo ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Activa</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-stone-500" />
                  <span>Inactiva</span>
                </>
              )}
            </span>
          );
        }
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const cat = row.original;
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAbrirEditar(cat)}
                className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-colors cursor-pointer"
                title="Editar categoría"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              {cat.activo && (
                <button
                  onClick={() => setCategoriaAEliminar(cat)}
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
    []
  );

  // 5. Configuración de la Tabla
  const table = useReactTable({
    data: categorias,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: { pageSize: 6 }
    }
  });

  return (
    <div className="space-y-6">
      <AdminNav
        titulo="Gestión de Categorías"
        subtitulo="Administración del menú y clasificación de platos"
        accion={
          <button
            onClick={handleAbrirCrear}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Categoría</span>
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
            placeholder="Filtrar categorías..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
          />
        </div>
      </div>

      {/* Tabla con TanStack Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        {isLoading ? (
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
                      No se encontraron categorías.
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

        {/* Paginador de la Tabla */}
        {!isLoading && table.getPageCount() > 1 && (
          <div className="px-5 py-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600 bg-stone-50/40">
            <span>
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
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

      {/* Modal con TanStack Form (Alta / Edición) */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={categoriaEditando ? "Editar Categoría" : "Nueva Categoría"}
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

          {/* Campo Nombre */}
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
                  Nombre de la categoría
                </label>
                <input
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="ej: Postres"
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

          {/* Campo Descripción */}
          <form.Field name="descripcion">
            {(field) => (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Descripción (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="ej: Deliciosas opciones dulces caseras"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none resize-none"
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
                    : categoriaEditando
                    ? "Guardar Cambios"
                    : "Crear Categoría"}
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmación de Baja */}
      <Modal
        abierto={categoriaAEliminar !== null}
        onCerrar={() => setCategoriaAEliminar(null)}
        titulo="¿Dar de baja esta categoría?"
      >
        <div className="space-y-4">
          <p className="text-xs text-stone-600">
            La categoría{" "}
            <strong className="text-stone-900">{categoriaAEliminar?.nombre}</strong> pasará
            al estado inactivo y no se mostrará a los clientes en el menú público.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCategoriaAEliminar(null)}
              className="px-4 py-2 border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={eliminarMutation.isPending}
              onClick={() => {
                if (categoriaAEliminar) {
                  eliminarMutation.mutate(categoriaAEliminar.id);
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
