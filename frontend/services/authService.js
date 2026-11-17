// Capa de acceso para la autenticación.
//
// La pantalla de inicio de sesión solo llama a `login`. Hoy valida contra un
// usuario de prueba local; cuando exista la API en Ktor se usará POST /auth/login
// (ver services/apiConfig.js) sin modificar la pantalla.
//
// Usuarios de prueba (contraseña Retazo123):
//   demo@retazo.com  -> usuario
//   ente@retazo.org  -> organizacion (ve la barra con "Agregar lugar histórico")

import { USE_MOCK_DATA, apiPost, apiPostForm } from './apiConfig';

const MOCK_DELAY_MS = 800;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_USERS = [
  { email: 'demo@retazo.com', password: 'Retazo123', nombre: 'Usuario demo', rol: 'usuario' },
  { email: 'ente@retazo.org', password: 'Retazo123', nombre: 'Archivo Histórico Demo', rol: 'organizacion' },
];

// Códigos de error que la pantalla sabe interpretar.
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  NETWORK: 'NETWORK',
  EMAIL_IN_USE: 'EMAIL_IN_USE',
};

export class AuthError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

export async function login({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!USE_MOCK_DATA) {
    try {
      return await apiPost('/auth/login', { email: normalizedEmail, password });
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        throw new AuthError(AUTH_ERRORS.INVALID_CREDENTIALS, 'Credenciales inválidas');
      }
      throw new AuthError(AUTH_ERRORS.NETWORK, 'No fue posible conectar con el servidor');
    }
  }

  await wait(MOCK_DELAY_MS);
  const user = MOCK_USERS.find((u) => u.email === normalizedEmail && u.password === password);
  if (!user) throw new AuthError(AUTH_ERRORS.INVALID_CREDENTIALS, 'Credenciales inválidas');
  return { email: user.email, nombre: user.nombre, rol: user.rol ?? 'usuario' };
}

// Crea una cuenta nueva. Con la API en Ktor usará POST /auth/register
// (409 si el correo ya existe). En modo local la cuenta se guarda en memoria,
// por lo que se pierde al cerrar la app.
export async function register({ nombre, email, password, perfil }) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!USE_MOCK_DATA) {
    try {
      return await apiPost('/auth/register', { nombre, email: normalizedEmail, password, perfil });
    } catch (error) {
      if (error.status === 409) {
        throw new AuthError(AUTH_ERRORS.EMAIL_IN_USE, 'El correo ya está registrado');
      }
      throw new AuthError(AUTH_ERRORS.NETWORK, 'No fue posible conectar con el servidor');
    }
  }

  await wait(MOCK_DELAY_MS);
  if (MOCK_USERS.some((u) => u.email === normalizedEmail)) {
    throw new AuthError(AUTH_ERRORS.EMAIL_IN_USE, 'El correo ya está registrado');
  }
  MOCK_USERS.push({ email: normalizedEmail, password, nombre, perfil });
  return { email: normalizedEmail, nombre, perfil };
}

// Solicitudes de entes organizacionales pendientes de validación (solo modo local).
const MOCK_PENDING_ORGS = [];

// Registra un ente organizacional con su documento oficial. La cuenta queda
// pendiente de validación, por eso no devuelve una sesión.
// documento: { uri, name, size, type }
export async function registerOrganization({ nombre, email, password, documento }) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!USE_MOCK_DATA) {
    const form = new FormData();
    form.append('nombre', nombre);
    form.append('email', normalizedEmail);
    form.append('password', password);
    form.append('documento', {
      uri: documento.uri,
      name: documento.name,
      type: documento.type ?? 'application/octet-stream',
    });
    try {
      return await apiPostForm('/auth/register-org', form);
    } catch (error) {
      if (error.status === 409) {
        throw new AuthError(AUTH_ERRORS.EMAIL_IN_USE, 'El correo ya está registrado');
      }
      throw new AuthError(AUTH_ERRORS.NETWORK, 'No fue posible conectar con el servidor');
    }
  }

  await wait(MOCK_DELAY_MS);
  const taken =
    MOCK_USERS.some((u) => u.email === normalizedEmail) ||
    MOCK_PENDING_ORGS.some((o) => o.email === normalizedEmail);
  if (taken) throw new AuthError(AUTH_ERRORS.EMAIL_IN_USE, 'El correo ya está registrado');
  MOCK_PENDING_ORGS.push({ email: normalizedEmail, nombre, documento: documento.name });
  return { email: normalizedEmail, nombre, estado: 'pendiente' };
}