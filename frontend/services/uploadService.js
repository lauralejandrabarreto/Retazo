// Subida de fotografías de lugares al backend (POST /api/uploads/imagenes).
//
// Las imágenes se guardan en el servidor Ktor (carpeta uploads/imagenes), no en
// Firebase Storage, que exige el plan de pago. El backend devuelve la URL pública
// de la imagen, que luego se guarda en el lugar como cualquier otra URL.
// Requiere sesión de organización (el token lo agrega apiConfig).

import * as ImagePicker from 'expo-image-picker';
import { apiPostForm, apiPostMultipart } from './apiConfig';
import { readDocument } from './authService';

export const IMAGE_MAX_MB = 5;

// Abre la galería y devuelve el asset elegido o null si el usuario cancela.
export async function pickImage() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Necesitamos permiso para acceder a tus fotos.');
  }
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];
  if (asset.fileSize && asset.fileSize > IMAGE_MAX_MB * 1024 * 1024) {
    throw new Error(`La imagen supera el máximo de ${IMAGE_MAX_MB} MB.`);
  }
  return { ...asset, name: asset.fileName ?? 'foto.jpg' };
}

// Sube la imagen y devuelve su URL en el servidor.
export async function uploadImage(asset) {
  const file = await readDocument(asset);
  let response;
  if (file.blob) {
    const form = new FormData();
    form.append('imagen', file.blob, file.name);
    response = await apiPostForm('/api/uploads/imagenes', form);
  } else {
    response = await apiPostMultipart('/api/uploads/imagenes', {}, [
      { field: 'imagen', name: file.name, type: file.type, bytes: file.bytes },
    ]);
  }
  return response.url;
}
