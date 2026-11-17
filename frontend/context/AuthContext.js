import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Sesión de la app. VERSIÓN MÍNIMA: el usuario vive solo en memoria (se pierde
// al cerrar la app). Cuando se implementen las sesiones completas se agregará
// persistencia y token aquí, sin cambiar la interfaz que usan las pantallas.
//
// user: null (sin sesión / invitado) o { email, nombre, rol }
// rol:  'usuario' | 'organizacion' (ente organizacional validado)

export const ROLES = {
  USUARIO: 'usuario',
  ORGANIZACION: 'organizacion',
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const signIn = useCallback((nextUser) => setUser(nextUser), []);
  const signOut = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({
      user,
      role: user?.rol ?? ROLES.USUARIO,
      isOrganization: user?.rol === ROLES.ORGANIZACION,
      signIn,
      signOut,
    }),
    [user, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}