// Acceso al selector de archivos del dispositivo (expo-document-picker).
// Las pantallas no importan la librería: usan pickDocument(), que devuelve
// { uri, name, size, type } o null si el usuario cancela.

import * as DocumentPicker from 'expo-document-picker';
import { ALLOWED_DOCUMENT_TYPES } from '../utils/files';

export async function pickDocument() {
  const result = await DocumentPicker.getDocumentAsync({
    type: ALLOWED_DOCUMENT_TYPES,
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.name,
    size: asset.size ?? null,
    type: asset.mimeType ?? null,
  };
}