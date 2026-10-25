// Capa de acceso a datos de lugares históricos.
//
// Todas las pantallas obtienen la información desde aquí. Hoy responde con los
// datos locales de data/places.js; mañana podrá consultar la API en Ktor sin que
// cambien las pantallas (ver services/apiConfig.js).

import { PLACES, SIMULATED_LOCATION } from '../data/places';
import { USE_MOCK_DATA, apiGet } from './apiConfig';
import { normalize } from '../utils/text';
import { distanceInMeters } from '../utils/geo';

// Pequeña espera para que los estados de carga se comporten como con una API real.
const MOCK_DELAY_MS = 250;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getPlaces() {
  if (!USE_MOCK_DATA) return apiGet('/places');
  await wait(MOCK_DELAY_MS);
  return PLACES;
}

export async function getPlaceById(id) {
  if (!USE_MOCK_DATA) return apiGet(`/places/${encodeURIComponent(id)}`);
  await wait(MOCK_DELAY_MS);
  return PLACES.find((place) => place.id === id) ?? null;
}

// Filtro puro: se usa en Buscar sobre la lista ya cargada para responder al
// instante mientras el usuario escribe.
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

// Lugares cercanos a la ubicación SIMULADA (no se usa GPS en esta entrega).
export async function getNearbyPlaces({ maxMeters = 3000, limit = 3 } = {}) {
  const places = await getPlaces();
  return places
    .map((place) => ({ ...place, distancia: distanceInMeters(SIMULATED_LOCATION.coords, place.coords) }))
    .filter((place) => place.distancia <= maxMeters)
    .sort((a, b) => a.distancia - b.distancia)
    .slice(0, limit);
}
