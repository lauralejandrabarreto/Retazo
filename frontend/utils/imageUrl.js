import { API_BASE_URL } from '../services/apiConfig';

// Las fotos de los lugares de prueba están guardadas en el backend y llegan como
// rutas relativas ("/imagenes/plaza-bolivar-imagen.jpg"). Aquí se les antepone la
// dirección del servidor. Las URL completas (http/https) se dejan igual.
export function resolveImageUrl(uri) {
  if (!uri) return uri;
  return uri.startsWith('/') ? `${API_BASE_URL}${uri}` : uri;
}
