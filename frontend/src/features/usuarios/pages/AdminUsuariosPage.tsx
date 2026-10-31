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
import {
  Search,
  CheckCircle,
  XCircle,
  ShieldCheck,
  User,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { usuariosApi } from "../api/usuariosApi";
import { UserPublic } from "../../auth/types";
import { useAuthStore } from "../../../store/authStore";
import { AdminNav } from "../../../shared/layout/AdminNav";
import { toast } from "../../../store/toastStore";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Skeleton } from "../../../shared/components/Skeleton";

export const AdminUsuariosPage: React.FC = () => {
  const queryClient = useQueryClient();
  const usuarioActual = useAuthStore((state) => state.usuario);
  const [globalFilter, setGlobalFilter] = useState("");

  // 1. Obtener lista de usuarios
  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ["admin-usuarios"],
    queryFn: () => usuariosApi.obtenerTodos()
  });

  // 2. Mutaciones de Activar / Desactivar
  const activarMutation = useMutation({
    mutationFn: (id: number) => usuariosApi.activar(id),
    onSuccess: (u) => {
      queryClient.invalidateQueries({ queryKey: ["admin-usuarios"] });
      toast.success(`Usuario "${u.username}" activado con éxito`);
    },
    onError: (err) => {
      const msg = handleApiError(err);
      toast.error(msg);
    }
  });

  const desactivarMutation = useMutation({
    mutationFn: (id: number) => usuariosApi.desactivar(id),
    onSuccess: (u) => {
      queryClient.invalidateQueries({ queryKey: ["admin-usuarios"] });
      toast.info(`Usuario "${u.username}" desactivado`);
    },
    onError: (err) => {
      const msg = handleApiError(err);
      toast.error(msg);
    }
  });

  // 3. Columnas de TanStack Table
  const columns = useMemo<ColumnDef<UserPublic>[]>(
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
        accessorKey: "username",
        header: "Usuario",
        cell: ({ row }) => {
          const u = row.original;
          const esElMismo = u.id === usuarioActual?.id;
          return (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 shrink-0 font-bold text-xs uppercase">
                {u.username.substring(0, 2)}
              </div>
              <div>
                <span className="font-bold text-stone-900 text-xs block">
                  {u.username}
                </span>
                {esElMismo && (
                  <span className="text-[10px] font-extrabold text-amber-600 block">
                    (Tu cuenta actual)
                  </span>
                )}
              </div>
            </div>
          );
        }
      },
      {
        accessorKey: "full_name",
        header: "Nombre Completo",
        cell: (info) => (
          <span className="text-xs font-semibold text-stone-800">
            {info.getValue<string>()}
          </span>
        )
      },
      {
        accessorKey: "email",
        header: "Correo",
        cell: (info) => (
          <span className="text-xs text-stone-600">{info.getValue<string>()}</span>
        )
      },
      {
        accessorKey: "role",
        header: "Rol",
        cell: (info) => {
          const rol = info.getValue<string>();
          return (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg border ${
                rol === "admin"
                  ? "bg-purple-50 border-purple-200 text-purple-700"
                  : "bg-stone-50 border-stone-200 text-stone-700"
              }`}
            >
              {rol === "admin" ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Admin</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-stone-500" />
                  <span>Cliente</span>
                </>
              )}
            </span>
          );
        }
      },
      {
        accessorKey: "disabled",
        header: "Estado",
        cell: (info) => {
          const disabled = info.getValue<boolean>();
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${
                !disabled
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {!disabled ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Activo</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>Desactivado</span>
                </>
              )}
            </span>
          );
        }
      },
      {
        id: "acciones",
        header: "Gestión de Acceso",
        cell: ({ row }) => {
          const u = row.original;
          const esElMismo = u.id === usuarioActual?.id;

          if (u.disabled) {
            return (
              <button
                onClick={() => activarMutation.mutate(u.id)}
                disabled={activarMutation.isPending}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Activar Cuenta
              </button>
            );
          }

          return (
            <button
              onClick={() => desactivarMutation.mutate(u.id)}
              disabled={esElMismo || desactivarMutation.isPending}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                esElMismo
                  ? "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                  : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 cursor-pointer"
              }`}
              title={
                esElMismo
                  ? "No podés auto-desactivar tu propia cuenta"
                  : "Desactivar acceso de este usuario"
              }
            >
              {esElMismo ? "Protegido" : "Desactivar"}
            </button>
          );
        }
      }
    ],
    [usuarioActual, activarMutation, desactivarMutation]
  );

  // 4. Configuración de TanStack Table
  const table = useReactTable({
    data: usuarios,
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
        titulo="Gestión de Usuarios"
        subtitulo="Administración de cuentas registradas, roles y permisos de acceso"
      />

      {/* Nota de Seguridad */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-800 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
        <span>
          <strong>Regla de seguridad:</strong> El sistema impide que desactives tu propio
          usuario actual para asegurar que siempre haya al menos un administrador con acceso al
          panel.
        </span>
      </div>

      {/* Barra de Filtro */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar por usuario, nombre o email..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
          />
        </div>
      </div>

      {/* Tabla */}
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
                      No se encontraron usuarios.
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
        {!isLoading && table.getPageCount() > 1 && (
          <div className="px-5 py-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600 bg-stone-50/40">
            <span>
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()} (Total:{" "}
              {usuarios.length} registrados)
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
    </div>
  );
};
