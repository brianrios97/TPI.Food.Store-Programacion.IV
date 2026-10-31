import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-stone-900 mb-2">Acceso No Autorizado</h1>
      <p className="text-stone-600 max-w-md mb-6">
        No tienes los permisos necesarios para acceder a este panel. Si crees que se trata de un error, contacta al administrador.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white font-medium rounded-lg hover:bg-stone-800 transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al Catálogo
      </Link>
    </div>
  );
};

