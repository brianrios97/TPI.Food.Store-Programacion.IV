import React, { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { AppRouter } from "./routes/AppRouter";

export const App: React.FC = () => {
  const checkSession = useAuthStore((state) => state.checkSession);

  useEffect(() => {
    // Al montar la app en el navegador, valida con el backend si hay una sesión activa mediante la cookie HttpOnly
    checkSession();
  }, [checkSession]);

  return <AppRouter />;
};
