import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Estado global de favoritos compartido por Lugar histórico y Favoritos.
// Se guarda la lista de ids en el almacenamiento local del dispositivo
// (AsyncStorage), de modo que persiste al cerrar y abrir la aplicación.

const STORAGE_KEY = '@retazo/favoritos';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState([]);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const parsed = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) setIds(parsed);
      })
      .catch((error) => setStorageError(error))
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback((next) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch((error) => setStorageError(error));
  }, []);

  const toggleFavorite = useCallback(
    (id) => {
      const added = !ids.includes(id);
      const next = added ? [id, ...ids] : ids.filter((x) => x !== id);
      setIds(next);
      persist(next);
      return added; // true = se agregó, false = se eliminó
    },
    [ids, persist],
  );

  const removeFavorite = useCallback(
    (id) => {
      setIds((current) => {
        const next = current.filter((x) => x !== id);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const value = useMemo(
    () => ({
      favoriteIds: ids,
      ready,
      storageError,
      isFavorite: (id) => ids.includes(id),
      toggleFavorite,
      removeFavorite,
    }),
    [ids, ready, storageError, toggleFavorite, removeFavorite],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites debe usarse dentro de <FavoritesProvider>');
  return ctx;
}
