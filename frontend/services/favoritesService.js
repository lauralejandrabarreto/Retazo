// Favoritos del usuario. Backend: /api/favoritos (todas las rutas exigen sesión).
//
// El usuario lo identifica el token que apiConfig agrega solo; nunca se envía en la URL.
// Los errores NO se capturan aquí: 401 = sesión vencida, 404 = el lugar ya no existe.

import { apiGet, apiPost, apiDelete } from './apiConfig';

// Lugares favoritos (resúmenes, el más reciente primero).
export function getFavorites() {
  return apiGet('/api/favoritos');
}

// { lugarId, favorito } — útil si necesitas consultar un solo lugar sin cargar la lista.
export function getFavoriteState(lugarId) {
  return apiGet(`/api/favoritos/${encodeURIComponent(lugarId)}`);
}

// Idempotente: guardar dos veces el mismo lugar responde 200 igual.
export function saveFavorite(lugarId) {
  return apiPost('/api/favoritos', { lugarId });
}

export function deleteFavorite(lugarId) {
  return apiDelete(`/api/favoritos/${encodeURIComponent(lugarId)}`); // 204 -> null
}