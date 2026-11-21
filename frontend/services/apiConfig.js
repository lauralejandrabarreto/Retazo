// Comunicación con el backend en Ktor.
//
// Endpoints:
//   GET    /api/places?query=&period=               -> lista de lugares
//   GET    /api/places/nearby?lat=&lng=&maxMeters=&limit= -> cercanos (con `distancia`)
//   GET    /api/places/{id}                         -> detalle
//   POST   /api/places                              -> crear      (organización, requiere token)
//   PUT    /api/places/{id}                         -> reemplazar (organización, requiere token)
//   DELETE /api/places/{id}                         -> eliminar   (organización, requiere token)
//   GET    /api/periods                             -> periodos del filtro
//   GET/POST/DELETE /api/favoritos                  -> favoritos del usuario (requiere token)
//   POST   /api/auth/login                          -> inicio de sesión (401 si son inválidas)
//   POST   /api/auth/registro                       -> registro de persona (409 si el correo existe)
//   POST   /api/auth/register-org                   -> registro de organización (multipart)

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// --- Dirección del servidor ----------------------------------------------------
//
// Orden de prioridad:
//   1. EXPO_PUBLIC_API_URL (archivo .env), p. ej. EXPO_PUBLIC_API_URL=http://192.168.1.50:8080
//      Obligatoria si usas `expo start --tunnel`.
//   2. Celular físico con Expo Go: la IP de tu PC, que Expo ya conoce (es la misma
//      desde la que el celular descargó la app).
//   3. Emulador Android: 10.0.2.2. Simulador iOS y web: localhost.
const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

function resolveDevHost() {
  if (Platform.OS === 'web') return 'localhost';

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    Constants.manifest2?.extra?.expoGo?.debuggerHost;
  const host = hostUri?.split(':')[0];
  if (host && IPV4.test(host)) return host; // un dominio de túnel (exp.direct) no sirve para Ktor

  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? `http://${resolveDevHost()}:8080`;

if (__DEV__) console.log('[API] Servidor:', API_BASE_URL);

// --- Sesión -----------------------------------------------------------------

// Token de sesión: lo fija authService al iniciar o cerrar sesión.
let authToken = null;
const authListeners = new Set();

export function getAuthToken() {
  return authToken;
}

// Permite que otras partes de la app (p. ej. FavoritesContext) reaccionen cuando se
// inicia o se cierra sesión. Devuelve la función para cancelar la suscripción.
export function subscribeAuthToken(listener) {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
}

export function setAuthToken(token) {
  authToken = token ?? null;
  authListeners.forEach((listener) => listener());
}

// Callback opcional para cuando el servidor responde 401 con una sesión activa
// (token vencido). El contexto de autenticación lo usa para cerrar sesión.
let unauthorizedHandler = null;
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

// --- Núcleo -----------------------------------------------------------------

// fetch no tiene tiempo límite: si el servidor es inalcanzable (IP equivocada,
// firewall) la petición queda colgada y la pantalla "nunca carga". Con este límite
// se muestra el estado de error con "Reintentar".
const DEFAULT_TIMEOUT_MS = 12000;
const UPLOAD_TIMEOUT_MS = 60000;

async function request(path, options = {}) {
  const { timeout = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;
  const hadSession = !!authToken;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...fetchOptions, signal: controller.signal });
  } catch (e) {
    const timedOut = e?.name === 'AbortError';
    // Solo estos mensajes indican que el servidor no se alcanzó. Otro error (por ejemplo,
    // un archivo mal formado en FormData) falla antes de salir a la red.
    const unreachable = /network request failed|failed to fetch|load failed/i.test(e?.message ?? '');
    if (__DEV__) {
      const kind = timedOut ? 'Tiempo agotado' : unreachable ? 'Sin conexión' : 'No se pudo enviar';
      console.warn(`[API] ${kind} → ${API_BASE_URL}${path}`, e);
    }
    const error = new Error(
      timedOut
        ? 'El servidor tardó demasiado en responder.'
        : unreachable
          ? 'No fue posible conectar con el servidor.'
          : 'No se pudo enviar la solicitud. Revisa los datos e intenta de nuevo.',
    );
    error.status = 0;
    error.network = timedOut || unreachable;
    throw error;
  } finally {
    clearTimeout(timer);
  }

  // Respuesta sin contenido (ej. DELETE).
  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.mensaje || `Error ${response.status} al consultar ${path}`);
    error.status = response.status;
    error.data = data;

    // 401 con sesión activa = token vencido o inválido.
    if (response.status === 401 && hadSession) unauthorizedHandler?.();

    throw error;
  }

  return data;
}

function getHeaders(token, additionalHeaders = {}) {
  const bearer = token ?? authToken;
  return {
    ...additionalHeaders,
    ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
  };
}

export function apiGet(path, token = null) {
  return request(path, { headers: getHeaders(token) });
}

export function apiPost(path, body, token = null) {
  return request(path, {
    method: 'POST',
    headers: getHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
}

export function apiPut(path, body, token = null) {
  return request(path, {
    method: 'PUT',
    headers: getHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
}

export function apiDelete(path, token = null) {
  return request(path, { method: 'DELETE', headers: getHeaders(token) });
}

// Arma el cuerpo multipart/form-data a mano (texto + archivos en bytes). Se usa en el
// celular porque el `fetch` de Expo no acepta archivos dentro de un FormData de React Native
// (falla con "Unsupported FormDataPart implementation"). Así no dependemos de FormData.
function buildMultipartBody(fields, files) {
  const encoder = new TextEncoder();
  const boundary = `----RetazoBoundary${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  const chunks = [];

  for (const [name, value] of Object.entries(fields)) {
    chunks.push(
      encoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`),
    );
  }
  for (const file of files) {
    chunks.push(
      encoder.encode(
        `--${boundary}\r\nContent-Disposition: form-data; name="${file.field}"; ` +
          `filename="${encodeURIComponent(file.name)}"\r\nContent-Type: ${file.type}\r\n\r\n`,
      ),
    );
    chunks.push(file.bytes);
    chunks.push(encoder.encode('\r\n'));
  }
  chunks.push(encoder.encode(`--${boundary}--\r\n`));

  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.length;
  }
  return { body, contentType: `multipart/form-data; boundary=${boundary}` };
}

// fields: { campo: 'texto' }  ·  files: [{ field, name, type, bytes: Uint8Array }]
export function apiPostMultipart(path, fields, files, token = null) {
  const { body, contentType } = buildMultipartBody(fields, files);
  return request(path, {
    method: 'POST',
    headers: getHeaders(token, { 'Content-Type': contentType }),
    body,
    timeout: UPLOAD_TIMEOUT_MS,
  });
}

// multipart/form-data con FormData (solo web): no se fija Content-Type, fetch agrega el boundary.
export function apiPostForm(path, formData, token = null) {
  return request(path, {
    method: 'POST',
    headers: getHeaders(token),
    body: formData,
    timeout: UPLOAD_TIMEOUT_MS,
  });
}