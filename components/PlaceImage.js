import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, F } from '../theme';

// Imagen con estado de respaldo:
// - sin URL (la foto aún no existe en los datos) -> muestra `label`
// - la imagen no carga (sin conexión, enlace roto) -> muestra `failedLabel`
// Los elementos superpuestos (`children`) solo se dibujan si la imagen cargó.
export default function PlaceImage({
  uri,
  style,
  label = 'Imagen no disponible',
  failedLabel = 'No se pudo cargar la imagen',
  compact = false,
  children,
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [uri]);

  if (!uri || failed) {
    const text = !uri ? label : failedLabel;
    return (
      <View style={[styles.fallback, style]} accessibilityLabel={text || 'Imagen no disponible'}>
        <Feather name="image" size={compact ? 16 : 26} color={C.brown} />
        {!compact && !!text && <Text style={styles.fallbackText}>{text}</Text>}
      </View>
    );
  }

  return (
    <View style={[styles.wrap, style]}>
      <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" onError={() => setFailed(true)} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: C.sepia },
  fallback: {
    overflow: 'hidden',
    backgroundColor: C.sepia,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  fallbackText: { fontSize: 10, color: C.brown, fontFamily: F.mono, textAlign: 'center', paddingHorizontal: 8 },
});
