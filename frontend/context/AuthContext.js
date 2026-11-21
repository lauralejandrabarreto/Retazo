// Sesión de la app. VERSIÓN MÍNIMA: el usuario vive solo en memoria (se pierde
// al cerrar la app). Cuando se implementen las sesiones completas se agregará
// persistencia y token aquí, sin cambiar la interfaz que usan las pantallas.
//
// user: null (sin sesión / invitado) o { email, nombre, rol }
// rol:  'usuario' | 'organizacion' (ente organizacional validado)

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export const ROLES = {
  USUARIO: 'usuario',
  ORGANIZACION: 'organizacion',
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const signIn = useCallback((session) => {
    setUser(session.usuario);
    setToken(session.token);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      role: user?.rol ?? ROLES.USUARIO,
      isOrganization: user?.rol === ROLES.ORGANIZACION,
      signIn,
      signOut,
    }),
    [user, token, signIn, signOut],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }

  return ctx;
}
