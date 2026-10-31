import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { Utensils, Lock, User, Mail, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import { axiosInstance } from "../../../shared/api/axiosInstance";
import { toast } from "../../../store/toastStore";
import { handleApiError } from "../../../shared/api/handleApiError";

export const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorRegistro, setErrorRegistro] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      username: "",
      full_name: "",
      email: "",
      password: "",
      confirmPassword: ""
    },
    onSubmit: async ({ value }) => {
      setErrorRegistro(null);

      if (value.password !== value.confirmPassword) {
        setErrorRegistro("Las contraseñas no coinciden");
        return;
      }

      try {
        await axiosInstance.post("/auth/register", {
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password
        });

        toast.success("¡Cuenta creada exitosamente! Ahora podés iniciar sesión.");
        navigate("/login");
      } catch (err) {
        const mensaje = handleApiError(err);
        setErrorRegistro(mensaje);
        toast.error(mensaje);
      }
    }
  });

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] py-8 px-4">
      <div className="w-full max-w-lg">
        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-xl border border-stone-200/80 p-8 sm:p-10">
          {/* Encabezado */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/25 mb-3">
              <Utensils className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              Crear Cuenta en Food<span className="text-amber-600">Store</span>
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              Completá tus datos para realizar pedidos rápidamente
            </p>
          </div>

          {/* Banner de Error */}
          {errorRegistro && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm animate-fadeIn">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorRegistro}</span>
            </div>
          )}

          {/* Formulario TanStack Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
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
                    className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1"
                  >
                    Usuario
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
                      placeholder="ej: juanperez"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-colors outline-none focus:ring-2 ${
                        field.state.meta.errors && field.state.meta.errors.length > 0
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : "border-stone-300 focus:border-amber-500 focus:ring-amber-100"
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

            {/* Campo Full Name */}
            <form.Field
              name="full_name"
              validators={{
                onChange: ({ value }) =>
                  !value || value.trim().length === 0
                    ? "El nombre completo es obligatorio"
                    : value.trim().length < 3
                    ? "Mínimo 3 caracteres"
                    : undefined
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1"
                  >
                    Nombre y Apellido
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="text"
                    autoComplete="name"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="ej: Juan Pérez"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors outline-none focus:ring-2 ${
                      field.state.meta.errors && field.state.meta.errors.length > 0
                        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                        : "border-stone-300 focus:border-amber-500 focus:ring-amber-100"
                    }`}
                  />
                  {field.state.meta.errors && field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Campo Email */}
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) =>
                  !value || value.trim().length === 0
                    ? "El correo es obligatorio"
                    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
                    ? "Formato de correo no válido"
                    : undefined
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1"
                  >
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id={field.name}
                      name={field.name}
                      type="email"
                      autoComplete="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-colors outline-none focus:ring-2 ${
                        field.state.meta.errors && field.state.meta.errors.length > 0
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : "border-stone-300 focus:border-amber-500 focus:ring-amber-100"
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

            {/* Fila Contraseñas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Contraseña */}
              <form.Field
                name="password"
                validators={{
                  onChange: ({ value }) =>
                    !value || value.length === 0
                      ? "Obligatoria"
                      : value.length < 6
                      ? "Mínimo 6 caracteres"
                      : undefined
                }}
              >
                {(field) => (
                  <div>
                    <label
                      htmlFor={field.name}
                      className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1"
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
                        autoComplete="new-password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm font-medium transition-colors outline-none focus:ring-2 ${
                          field.state.meta.errors && field.state.meta.errors.length > 0
                            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                            : "border-stone-300 focus:border-amber-500 focus:ring-amber-100"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
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

              {/* Confirmar Contraseña */}
              <form.Field
                name="confirmPassword"
                validators={{
                  onChange: ({ value }) =>
                    !value || value.length === 0
                      ? "Obligatoria"
                      : undefined
                }}
              >
                {(field) => (
                  <div>
                    <label
                      htmlFor={field.name}
                      className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1"
                    >
                      Repetir Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id={field.name}
                        name={field.name}
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-colors outline-none focus:ring-2 ${
                          field.state.meta.errors && field.state.meta.errors.length > 0
                            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                            : "border-stone-300 focus:border-amber-500 focus:ring-amber-100"
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
            </div>

            {/* Botón Submit */}
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="w-full mt-4 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creando cuenta...</span>
                    </>
                  ) : (
                    <span>Registrarse</span>
                  )}
                </button>
              )}
            </form.Subscribe>
          </form>

          {/* Enlace a Login */}
          <div className="text-center mt-6 pt-5 border-t border-stone-100 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la tienda</span>
            </Link>

            <div>
              <span className="text-xs text-stone-500">¿Ya tenés cuenta? </span>
              <Link
                to="/login"
                className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline"
              >
                Iniciá sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
