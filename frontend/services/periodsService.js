// Periodos históricos (filtro de Buscar). Backend: /api/periods.
//
// Modelo del backend: { id, etiqueta, orden }. El `id` debe coincidir con el campo
// `siglo` de los lugares y distingue mayúsculas ("XVI", no "xvi").
//
// Los errores NO se capturan aquí: suben hasta useAsync.

import { apiGet, apiPost, apiPut, apiDelete } from './apiConfig';

// La opción "Todos" no viene de la API (el id "todos" está reservado en el backend):
// se agrega delante de la lista.
export const ALL_PERIODS = { id: 'todos', label: 'Todos' };

// Convierte el periodo del backend a la opción del filtro: { id, label }.
const toOption = (p) => ({ id: p.id, label: p.etiqueta ?? p.label ?? p.nombre ?? String(p.id) });

// Pública. El backend ya los entrega ordenados por `orden`.
export async function getPeriods() {
  const list = await apiGet('/api/periods');
  return (list ?? []).map(toOption);
}

export function getPeriodById(id) {
  return apiGet(`/api/periods/${encodeURIComponent(id)}`);
}

// --- Administración (requieren sesión de organización; el token lo agrega apiConfig) ---
// `period` = { id, etiqueta, orden }. Errores: 400 datos inválidos, 409 id u orden repetido
// (o, al eliminar, periodo en uso por algún lugar).

export function postPeriod(period) {
  return apiPost('/api/periods', period);
}

export function putPeriod(id, period) {
  return apiPut(`/api/periods/${encodeURIComponent(id)}`, period);
}

export function deletePeriod(id) {
  return apiDelete(`/api/periods/${encodeURIComponent(id)}`); // 204 -> null
}