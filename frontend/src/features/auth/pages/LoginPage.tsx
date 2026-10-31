import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { Lock, User, Eye, EyeOff, AlertCircle, ShieldCheck, UserCheck } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import { toast } from "../../../store/toastStore";
import { handleApiError } from "../../../shared/api/handleApiError";

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      username: "",
      password: ""
    },
    onSubmit: async ({ value }) => {
      setErrorLogin(null);
      try {
        await login(value.username, value.password);
        const usuarioActual = useAuthStore.getState().usuario;
        toast.success(`¡Bienvenido de nuevo, ${usuarioActual?.full_name || value.username}!`);

        if (usuarioActual?.role === "admin") {
          navigate("/admin/resumen");
        } else {
          navigate("/");
        }
      } catch (err) {
        const mensaje = handleApiError(err);
        setErrorLogin(mensaje);
        toast.error(mensaje);
      }
    }
  });

  // Relleno rápido con credenciales de prueba (Idea de Prog 3)
  const setDemoCredentials = (u: string, p: string) => {
    form.setFieldValue("username", u);
    form.setFieldValue("password", p);
    setErrorLogin(null);
    toast.info(`Credenciales de "${u}" cargadas`);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] py-8 px-4">
      <div className="w-full max-w-md">
        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-xl border border-stone-200/80 p-8 sm:p-10">
          {/* Encabezado */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6] to-[#1e3a8a] text-white shadow-lg shadow-blue-900/25 mb-3">
              <span className="text-2xl">🍔</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Food<span className="text-[#1e3a8a]">Store</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Ingresá tus credenciales para acceder a tu cuenta
            </p>
          </div>

          {/* Banner de Error */}
          {errorLogin && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm animate-fadeIn">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorLogin}</span>
            </div>
          )}

          {/* Formulario TanStack Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-5"
          >
            {/* Campo Username */}
            <form.Field
              name="username"
              validators={{
                onChange: ({ value }) =>
                  !value || value.trim().length === 0
                    ? "El usuario es obligatorio"
                    : value.trim().length < 3
                    ? "Mínimo 3 caracteres"
                    : undefined
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5"
                  >
                    Nombre de Usuario
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id={field.name}
                      name={field.name}
                      type="text"
                      autoComplete="username"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="ej: cliente o admin"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-colors outline-none focus:ring-2 ${
                        field.state.meta.errors && field.state.meta.errors.length > 0
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : "border-slate-300 focus:border-[#1e3a8a] focus:ring-blue-100"
                      }`}
                    />
                  </div>
                  {field.state.meta.errors && field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Campo Password */}
            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) =>
                  !value || value.length === 0
                    ? "La contraseña es obligatoria"
                    : value.length < 4
                    ? "Mínimo 4 caracteres"
                    : undefined
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5"
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm font-medium transition-colors outline-none focus:ring-2 ${
                        field.state.meta.errors && field.state.meta.errors.length > 0
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : "border-slate-300 focus:border-[#1e3a8a] focus:ring-blue-100"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                      title={showPassword ? "Ocultar" : "Mostrar"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {field.state.meta.errors && field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Botón Submit */}
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6] to-[#1e3a8a] hover:from-[#1e40af] hover:to-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-blue-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Iniciando sesión...</span>
                    </>
                  ) : (
                    <span>Iniciar Sesión</span>
                  )}
                </button>
              )}
            </form.Subscribe>
          </form>

          {/* Enlace a Registro */}
          <div className="text-center mt-6 pt-5 border-t border-stone-100">
            <span className="text-xs text-stone-500">¿Aún no tenés una cuenta? </span>
            <Link
              to="/register"
              className="text-xs font-bold text-[#1e3a8a] hover:underline"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </div>

        {/* Recuadro de Credenciales Demo (Idea reciclada de Programación III) */}
        <div className="mt-6 bg-blue-50/80 rounded-2xl border border-blue-200/70 p-4 text-xs text-slate-700 shadow-sm">
          <p className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1e3a8a] animate-ping" />
            Credenciales de prueba rápidas:
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              onClick={() => setDemoCredentials("admin", "Admin1234!")}
              className="p-2 rounded-xl bg-white border border-blue-200 hover:border-[#1e3a8a] hover:bg-blue-50 text-left transition-all group cursor-pointer"
            >
              <div className="font-bold text-slate-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1e3a8a]" />
                <span>Admin</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                admin / Admin1234!
              </div>
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials("cliente", "Cliente1234!")}
              className="p-2 rounded-xl bg-white border border-blue-200 hover:border-[#1e3a8a] hover:bg-blue-50 text-left transition-all group cursor-pointer"
            >
              <div className="font-bold text-slate-800 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-[#1e3a8a]" />
                <span>Cliente</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                cliente / Cliente1234!
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
