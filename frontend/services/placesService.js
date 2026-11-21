// Capa de acceso a datos de lugares históricos (backend Ktor).
//
// Los errores NO se capturan aquí: suben hasta useAsync, que muestra "Reintentar".

import { SIMULATED_LOCATION } from '../data/constants';
import { apiGet, apiPost, apiPut, apiDelete } from './apiConfig';
import { normalize } from '../utils/text';

// --- Lectura (públicas) ---

export function getPlaces() {
  return apiGet('/api/places');
}

export function getPlaceById(id) {
  return apiGet(`/api/places/${encodeURIComponent(id)}`);
}

// Filtro puro en memoria: se usa en Buscar sobre la lista ya cargada para
// responder al instante mientras el usuario escribe.
export function filterPlaces(places, { query = '', period = 'todos' } = {}) {
  const q = normalize(query);
  return places.filter((place) => {
    const matchesPeriod =
      period === 'todos' ||
      (period === 'prehispanico' ? place.siglo === 'prehispanico' : place.siglo === period);
    if (!matchesPeriod) return false;
    if (!q) return true;
    return [place.nombre, place.sector, place.ciudad].some((field) => normalize(field).includes(q));
  });
}

// Lugares cercanos. Hoy usa la ubicación SIMULADA; cuando haya GPS se pasa la real en `coords`.
export function getNearbyPlaces({
  coords = SIMULATED_LOCATION.coords,
  maxMeters = 3000,
  limit = 3,
} = {}) {
  const params = new URLSearchParams({
    lat: String(coords.lat),
    lng: String(coords.lng),
    maxMeters: String(maxMeters),
    limit: String(limit),
  });
  return apiGet(`/api/places/nearby?${params.toString()}`);
}

// --- Administración (requieren sesión de organización; el token lo agrega apiConfig) ---

export async function createPlace(place) {
  return apiPost('/api/places', place);
}

export function putPlace(id, place) {
  return apiPut(`/api/places/${encodeURIComponent(id)}`, place);
}

export function deletePlace(id) {
  return apiDelete(`/api/places/${encodeURIComponent(id)}`); // 204 -> null
}