// Configuración prevista para la comunicación con el backend en Ktor.
//
// En esta entrega la aplicación funciona con datos locales (USE_MOCK_DATA = true).
// Cuando exista la API, basta con cambiar la bandera y la URL: las pantallas no
// necesitan modificarse porque solo dependen de los servicios (services/).
//
// Endpoints previstos (pendientes de implementar en Ktor):
//   GET  /places?query=&period=     -> lista de lugares filtrada
//   GET  /places/{id}               -> detalle de un lugar
//   GET  /places/nearby?lat=&lng=   -> lugares cercanos a una ubicación
//   POST /auth/login                -> inicio de sesión (401 si las credenciales son inválidas)
//   POST /auth/register             -> registro de persona (409 si el correo ya existe)
//   POST /auth/register-org         -> registro de ente organizacional (multipart con el documento; 409 si el correo ya existe)

export const USE_MOCK_DATA = true;
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL; // 10.0.2.2 = localhost visto desde el emulador Android

async function request(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  if (!response.ok) {
    const error = new Error(`Error ${response.status} al consultar ${path}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export function apiGet(path) {
  return request(path);
}

// Envío multipart (formularios con archivos). No se fija Content-Type: fetch
// agrega el boundary automáticamente.
export function apiPostForm(path, formData) {
  return request(path, { method: 'POST', body: formData });
}

export function apiPost(path, body) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}