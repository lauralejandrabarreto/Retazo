import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export default function LocationPickerMap({ region, coordinate, onSelect, style }) {
  const center = coordinate ?? region;
  const [lat, setLat] = useState(center ? String(center.latitude) : '');
  const [lng, setLng] = useState(center ? String(center.longitude) : '');

  useEffect(() => {
    if (coordinate) {
      setLat(String(coordinate.latitude));
      setLng(String(coordinate.longitude));
    }
  }, [coordinate?.latitude, coordinate?.longitude]); // eslint-disable-line react-hooks/exhaustive-deps

  const apply = (nextLat, nextLng) => {
    const latitude = parseFloat(nextLat.replace(',', '.'));
    const longitude = parseFloat(nextLng.replace(',', '.'));
    if (
      Number.isFinite(latitude) && Number.isFinite(longitude) &&
      Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180
    ) {
      onSelect?.({ latitude, longitude });
    }
  };

  const d = 0.005;
  const src = center
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${center.longitude - d},${center.latitude - d},${center.longitude + d},${center.latitude + d}&layer=mapnik&marker=${center.latitude},${center.longitude}`
    : null;

  return (
    <View style={[styles.wrap, style]}>
      {src && <iframe title="Mapa" src={src} style={{ border: 0, width: '100%', flex: 1 }} />}
      <View style={styles.row}>
        <TextInput
          value={lat}
          onChangeText={(v) => { setLat(v); apply(v, lng); }}
          placeholder="Latitud"
          style={styles.input}
          accessibilityLabel="Latitud"
        />
        <TextInput
          value={lng}
          onChangeText={(v) => { setLng(v); apply(lat, v); }}
          placeholder="Longitud"
          style={styles.input}
          accessibilityLabel="Longitud"
        />
      </View>
      <Text style={styles.note}>Versión web: escribe las coordenadas. En el celular tocas el mapa.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#E6DAC1' },
  row: { flexDirection: 'row', gap: 6, padding: 6 },
  input: {
    flex: 1, backgroundColor: '#FFFCF6', borderRadius: 8, borderWidth: 1,
    borderColor: '#E8DCC7', paddingHorizontal: 8, paddingVertical: 5, fontSize: 11,
  },
  note: { fontSize: 9, color: '#988873', paddingHorizontal: 8, paddingBottom: 4 },
});