import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore,
} from 'react';
import { getAuthToken, subscribeAuthToken } from '../services/apiConfig';
import { getFavorites, saveFavorite, deleteFavorite } from '../services/favoritesService';

// Estado global de favoritos, respaldado por el backend (/api/favoritos).
//
// - La fuente de verdad es el servidor: cada usuario ve solo sus favoritos.
// - Hay sesión cuando apiConfig tiene un token (lo fija authService al iniciar sesión).
//   El proveedor se suscribe a ese token: al iniciar o cerrar sesión la lista se recarga
//   o se vacía sola, sin pasarle nada desde App.js.
// - Los cambios son optimistas: el corazón cambia al instante y, si el servidor falla,
//   se revierte y la función lanza el error para que la pantalla lo informe.

export class FavoritesError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'FavoritesError';
    this.code = code; // 'AUTH_REQUIRED'
  }
}

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const token = useSyncExternalStore(subscribeAuthToken, getAuthToken);
  const isAuthenticated = !!token;

  const [favorites, setFavorites] = useState([]); // resúmenes de lugares, el más reciente primero
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  // Copia síncrona de la lista para decidir sin depender de renders pendientes.
  const listRef = useRef([]);
  const pendingRef = useRef(new Set());
  const loadCounter = useRef(0);

  const commit = useCallback((next) => {
    listRef.current = next;
    setFavorites(next);
  }, []);

  const refresh = useCallback(async () => {
    const loadId = ++loadCounter.current; // descarta respuestas de cargas anteriores
    pendingRef.current.clear();

    if (!token) {
      commit([]);
      setError(null);
      setReady(true);
      return;
    }

    setReady(false);
    setError(null);
    try {
      const list = await getFavorites();
      if (loadId === loadCounter.current) commit(list ?? []);
    } catch (e) {
      if (__DEV__) console.warn('[favoritos] no se pudo cargar la lista:', e?.status, e?.message);
      if (loadId === loadCounter.current) {
        commit([]);
        setError(e);
      }
    } finally {
      if (loadId === loadCounter.current) setReady(true);
    }
  }, [token, commit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isFavorite = useCallback((id) => favorites.some((f) => f.id === id), [favorites]);

  // Guarda o quita un lugar. Recibe el lugar (necesita nombre, sector, ciudad, epoca e
  // imagen para pintarlo en la lista). Devuelve true si se agregó, false si se quitó y
  // null si se ignoró por haber otra petición del mismo lugar en curso.
  const toggleFavorite = useCallback(
    async (place) => {
      if (!token) throw new FavoritesError('AUTH_REQUIRED', 'Inicia sesión para guardar favoritos.');
      if (pendingRef.current.has(place.id)) return null;

      const wasFavorite = listRef.current.some((f) => f.id === place.id);
      commit(wasFavorite ? listRef.current.filter((f) => f.id !== place.id) : [place, ...listRef.current]);

      pendingRef.current.add(place.id);
      try {
        if (wasFavorite) await deleteFavorite(place.id);
        else await saveFavorite(place.id);
        return !wasFavorite;
      } catch (e) {
        // Revierte solo este lugar, sin pisar otros cambios hechos mientras tanto.
        commit(
          wasFavorite
            ? [place, ...listRef.current.filter((f) => f.id !== place.id)]
            : listRef.current.filter((f) => f.id !== place.id),
        );
        throw e;
      } finally {
        pendingRef.current.delete(place.id);
      }
    },
    [token, commit],
  );

  // Quita un lugar por id (botón del corazón en la lista de Favoritos).
  const removeFavorite = useCallback(
    async (id) => {
      if (!token) throw new FavoritesError('AUTH_REQUIRED', 'Inicia sesión para gestionar favoritos.');
      if (pendingRef.current.has(id)) return;

      const removed = listRef.current.find((f) => f.id === id);
      if (!removed) return;
      const index = listRef.current.indexOf(removed);
      commit(listRef.current.filter((f) => f.id !== id));

      pendingRef.current.add(id);
      try {
        await deleteFavorite(id);
      } catch (e) {
        // Lo devuelve a su posición original.
        const copy = listRef.current.filter((f) => f.id !== id);
        copy.splice(Math.min(index, copy.length), 0, removed);
        commit(copy);
        throw e;
      } finally {
        pendingRef.current.delete(id);
      }
    },
    [token, commit],
  );

  const value = useMemo(
    () => ({
      favorites,
      ready,
      error,
      isAuthenticated,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      refresh,
    }),
    [favorites, ready, error, isAuthenticated, isFavorite, toggleFavorite, removeFavorite, refresh],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites debe usarse dentro de <FavoritesProvider>');
  return ctx;
}