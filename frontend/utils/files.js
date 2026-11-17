// Utilidades y validación para archivos adjuntos.

export const DOCUMENT_MAX_MB = 10;
export const DOCUMENT_MAX_BYTES = DOCUMENT_MAX_MB * 1024 * 1024;
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];

// Ejemplos: 850 B, 320 KB, 4,2 MB
export function formatFileSize(bytes) {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

function hasAllowedFormat(file) {
  const extension = (file.name ?? '').split('.').pop().toLowerCase();
  return ALLOWED_DOCUMENT_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(extension);
}

// Devuelve un mensaje de error o null si el archivo es válido.
// file: { uri, name, size, type } (size puede ser null si el sistema no lo informa).
export function validateDocument(file) {
  if (!file) return 'Adjunta el documento oficial de tu organización.';
  if (!hasAllowedFormat(file)) return 'Formato no permitido. Adjunta un archivo PDF, JPG o PNG.';
  if (file.size != null && file.size > DOCUMENT_MAX_BYTES) {
    return `El archivo pesa ${formatFileSize(file.size)} y supera el máximo de ${DOCUMENT_MAX_MB} MB.`;
  }
  return null;
}