// Configuración prevista para la comunicación con el backend en Ktor.
//
// En esta entrega la aplicación funciona con datos locales (USE_MOCK_DATA = true).
// Cuando exista la API, basta con cambiar la bandera y la URL: las pantallas no
// necesitan modificarse porque solo dependen de services/placesService.js.
//
// Endpoints previstos (pendientes de implementar en Ktor):
//   GET /places?query=&period=      -> lista de lugares filtrada
//   GET /places/{id}                -> detalle de un lugar
//   GET /places/nearby?lat=&lng=    -> lugares cercanos a una ubicación

export const USE_MOCK_DATA = true;
export const API_BASE_URL = 'http://10.0.2.2:8080/api'; // 10.0.2.2 = localhost visto desde el emulador Android

export async function apiGet(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status} al consultar ${path}`);
  }
  return response.json();
}
