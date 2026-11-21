import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { SIMULATED_LOCATION } from '../data/constants';

// Ubicación real del usuario (expo-location).
//
// status:
//   'loading'  -> pidiendo permiso / obteniendo posición
//   'granted'  -> `coords` es la ubicación real
//   'denied'   -> el usuario negó el permiso
//   'error'    -> servicios de ubicación apagados, sin señal o falla inesperada
// En 'denied' y 'error' se usa la ubicación de ejemplo (SIMULATED_LOCATION) para que
// la app siga funcionando; `isFallback` lo indica y la pantalla avisa al usuario.
//
// Cada paso se registra en consola con el prefijo [ubicación] para diagnosticar.

const LOCATION_TIMEOUT_MS = 10000;

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Tiempo de espera agotado')), ms)),
  ]);

const fallback = (status) => ({
  status,
  coords: SIMULATED_LOCATION.coords,
  label: SIMULATED_LOCATION.label,
  isFallback: true,
});

// Nombre legible ("Tegucigalpa, Honduras"). Si falla (web, sin red) se usa un texto genérico.
async function describePlace(coords) {
  try {
    const [first] = await Location.reverseGeocodeAsync({ latitude: coords.lat, longitude: coords.lng });
    const city = first?.city || first?.subregion || first?.region;
    const parts = [city, first?.country].filter(Boolean);
    return parts.length ? parts.join(', ') : 'Tu ubicación';
  } catch {
    return 'Tu ubicación';
  }
}

export default function useUserLocation() {
  const [state, setState] = useState({ status: 'loading', coords: null, label: null, isFallback: false });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const update = (next) => active && setState(next);

    (async () => {
      setState((prev) => ({ ...prev, status: 'loading' }));
      try {
        const servicesOn = await Location.hasServicesEnabledAsync();
        console.log('[ubicación] servicios de ubicación activos:', servicesOn);
        if (!servicesOn) return update(fallback('error'));

        const { status } = await withTimeout(Location.requestForegroundPermissionsAsync(), LOCATION_TIMEOUT_MS);
        console.log('[ubicación] permiso:', status);
        if (status !== 'granted') return update(fallback('denied'));

        let position;
        try {
          position = await withTimeout(
            Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
            LOCATION_TIMEOUT_MS,
          );
        } catch (e) {
          console.warn('[ubicación] no se obtuvo la posición actual:', e?.message ?? e);
          // Si no hay posición actual a tiempo, se intenta la última conocida.
          position = await Location.getLastKnownPositionAsync().catch(() => null);
        }
        if (!position) {
          console.warn('[ubicación] sin posición disponible');
          return update(fallback('error'));
        }

        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        console.log('[ubicación] coordenadas:', coords);
        // Se muestra la ubicación enseguida y el nombre se completa después.
        update({ status: 'granted', coords, label: 'Tu ubicación', isFallback: false });
        const label = await describePlace(coords);
        if (active) setState((prev) => (prev.status === 'granted' ? { ...prev, label } : prev));
      } catch (e) {
        console.warn('[ubicación] error:', e?.message ?? e);
        update(fallback('error'));
      }
    })();

    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
}