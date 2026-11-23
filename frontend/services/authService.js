import { Platform } from 'react-native';
import { File } from 'expo-file-system';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import { apiPost, apiPostForm, apiPostMultipart, setAuthToken } from './apiConfig';

// Códigos de error que la pantalla sabe interpretar.
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  NETWORK: 'NETWORK',
  EMAIL_IN_USE: 'EMAIL_IN_USE',
  VALIDATION: 'VALIDATION',
};

export class AuthError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

// Fija el token para que placesService envíe Authorization en POST/PUT/DELETE.
function startSession(response) {
  if (response?.token) setAuthToken(response.token);
  return { token: response?.token, usuario: response?.usuario };
}

export async function login({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const response = await apiPost('/api/auth/login', {
      correo: normalizedEmail,
      contrasenia: password,
    });
    return startSession(response);
  } catch (error) {
    if (error.status === 401) {
      throw new AuthError(AUTH_ERRORS.INVALID_CREDENTIALS, 'Credenciales inválidas');
    }
    if (error.status === 400) {
      throw new AuthError(AUTH_ERRORS.VALIDATION, error.message || 'Verifica los datos ingresados');
    }
    throw new AuthError(AUTH_ERRORS.NETWORK, error.message || 'No fue posible conectar con el servidor');
  }
}

export async function register({ nombre, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const response = await apiPost('/api/auth/registro', {
      nombre: nombre.trim(),
      correo: normalizedEmail,
      contrasenia: password,
    });
    return startSession(response);
  } catch (error) {
    if (error.status === 409) {
      throw new AuthError(AUTH_ERRORS.EMAIL_IN_USE, 'Este correo ya está registrado');
    }
    if (error.status === 400) {
      throw new AuthError(AUTH_ERRORS.VALIDATION, error.message || 'Verifica los datos ingresados');
    }
    throw new AuthError(AUTH_ERRORS.NETWORK, error.message || 'No fue posible conectar con el servidor');
  }
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function readViaXhr(uri) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onerror = () => reject(new Error('XMLHttpRequest no pudo abrir el archivo.'));
    xhr.onload = () => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('FileReader no pudo leer el archivo.'));
      reader.onloadend = () => {
        const result = reader.result; // "data:<tipo>;base64,<contenido>"
        if (typeof result !== 'string') return reject(new Error('Lectura vacía.'));
        resolve(base64ToBytes(result.slice(result.indexOf(',') + 1)));
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
}

// Lee los bytes de un archivo local. En Android (sobre todo en Expo Go) el acceso a los
// archivos que deja el selector de documentos puede ser rechazado según la API que se use
// ("Missing 'READ' permission"), así que se prueban varias formas, de la más nueva a la
// más tolerante. En desarrollo se registra cuál funcionó.
async function readBytes(uri) {
  const strategies = [
    ['File.bytes', async () => {
      const file = new File(uri);
      return typeof file.bytes === 'function' ? await file.bytes() : file.bytesSync();
    }],
    ['legacy.readAsStringAsync', async () =>
      base64ToBytes(await LegacyFileSystem.readAsStringAsync(uri, { encoding: 'base64' }))],
    // Las APIs de expo-file-system aplican su propio control de permisos, que en Expo Go
    // rechaza los archivos del selector de documentos. XMLHttpRequest + FileReader usan el
    // módulo de red de React Native, que no pasa por ese control.
    ['XMLHttpRequest + FileReader', () => readViaXhr(uri)],
  ];

  let lastError;
  for (const [label, read] of strategies) {
    try {
      const bytes = await read();
      if (__DEV__) console.log(`[register-org] documento leído con: ${label} (${bytes.length} bytes)`);
      return bytes;
    } catch (e) {
      lastError = e;
      if (__DEV__) console.warn(`[register-org] falló ${label}:`, e?.message ?? e);
    }
  }
  throw lastError;
}

// Lee el documento elegido. Acepta el archivo ({ uri, name, mimeType | type }) o el resultado
// completo de expo-document-picker ({ canceled, assets: [...] }).
//   - Celular: devuelve los bytes (se envían con apiPostMultipart).
//   - Web: devuelve un Blob (se envía con FormData).
export async function readDocument(documento) {
  const asset = documento?.assets?.[0] ?? documento;

  if (!asset?.uri) {
    throw new AuthError(AUTH_ERRORS.VALIDATION, 'Selecciona un documento válido.');
  }

  const name = asset.name ?? 'documento';
  const type = asset.mimeType ?? (asset.type?.includes('/') ? asset.type : null) ?? 'application/octet-stream';

  try {
    if (Platform.OS === 'web') {
      const blob = asset.file ?? (await (await fetch(asset.uri)).blob());
      return { name, type, blob };
    }
    return { name, type, bytes: await readBytes(asset.uri) };
  } catch (e) {
    if (__DEV__) console.warn('[register-org] no se pudo leer el documento:', e);
    throw new AuthError(AUTH_ERRORS.VALIDATION, 'No se pudo leer el documento seleccionado. Elígelo de nuevo.');
  }
}

export async function registerOrganization({ nombre, email, password, documento }) {
  const normalizedEmail = email.trim().toLowerCase();

  // Mismos nombres de campo que login y registro. Si tu endpoint de Ktor espera
  // otros (email/password), cámbialos aquí.
  const fields = { nombre: nombre.trim(), correo: normalizedEmail, contrasenia: password };
  const doc = await readDocument(documento);

  try {
    let response;
    if (doc.blob) {
      const form = new FormData();
      Object.entries(fields).forEach(([key, value]) => form.append(key, value));
      form.append('documento', doc.blob, doc.name);
      response = await apiPostForm('/api/auth/register-org', form);
    } else {
      response = await apiPostMultipart('/api/auth/register-org', fields, [
        { field: 'documento', name: doc.name, type: doc.type, bytes: doc.bytes },
      ]);
    }
    // Si el backend ya devuelve token, se inicia sesión; si deja la cuenta
    // pendiente de verificación, no habrá token y solo se devuelve la respuesta.
    return response?.token ? startSession(response) : response;
  } catch (error) {
    if (error.status === 409) {
      throw new AuthError(AUTH_ERRORS.EMAIL_IN_USE, 'El correo ya está registrado');
    }
    if (error.status === 400) {
      throw new AuthError(AUTH_ERRORS.VALIDATION, error.message || 'Verifica los datos ingresados');
    }
    throw new AuthError(AUTH_ERRORS.NETWORK, error.message || 'No fue posible conectar con el servidor');
  }
}

// Cerrar sesión: el token deja de enviarse. (Si guardas el token en
// expo-secure-store, bórralo aquí también.)
export function logout() {
  setAuthToken(null);
}