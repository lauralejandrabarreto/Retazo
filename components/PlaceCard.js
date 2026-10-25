import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { C, F, RADIUS } from '../theme';
import Chip from './Chip';
import PlaceImage from './PlaceImage';

// Tarjeta reutilizable de lugar histórico.
// variant: 'card'     -> Inicio (miniatura, época y distancia)
//          'row'      -> Buscar (fila con ubicación y época)
//          'favorite' -> Favoritos (tarjeta con botón para quitar de favoritos)
export default function PlaceCard({ place, variant = 'card', distanceLabel, onPress, onRemove }) {
  const location = place.sector === place.ciudad ? place.ciudad : `${place.sector}, ${place.ciudad}`;

  if (variant === 'row') {
    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${place.nombre}`}
      >
        <PlaceImage uri={place.imagen} style={styles.rowThumb} compact />
        <View style={styles.flex}>
          <Text style={styles.rowName} numberOfLines={1}>{place.nombre}</Text>
          <View style={styles.meta}>
            <Feather name="map-pin" size={11} color={C.brown} />
            <Text style={styles.metaText} numberOfLines={1}>{location}</Text>
            <Chip label={place.epoca} amber />
          </View>
        </View>
        <Feather name="chevron-right" size={16} color={C.brown} />
      </TouchableOpacity>
    );
  }

  if (variant === 'favorite') {
    return (
      <TouchableOpacity
        style={styles.favCard}
        activeOpacity={0.7}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${place.nombre}`}
      >
        <PlaceImage uri={place.imagen} style={styles.favThumb} compact />
        <View style={styles.favInfo}>
          <Text style={styles.favName} numberOfLines={2}>{place.nombre}</Text>
          <View style={styles.meta}>
            <Feather name="map-pin" size={11} color={C.brown} />
            <Text style={styles.metaText} numberOfLines={1}>{location}</Text>
          </View>
          <Chip label={place.epoca} amber />
        </View>
        <View style={styles.favSide}>
          <TouchableOpacity
            onPress={onRemove}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Quitar ${place.nombre} de favoritos`}
          >
            <Ionicons name="heart" size={20} color={C.amber} />
          </TouchableOpacity>
          <Feather name="chevron-right" size={14} color={C.brown} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${place.nombre}`}
    >
      <PlaceImage uri={place.imagen} style={styles.thumb} compact />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{place.nombre}</Text>
        <View style={styles.chipsRow}>
          <Chip label={place.epoca} amber />
          {!!distanceLabel && <Chip label={distanceLabel} />}
        </View>
      </View>
      <Feather name="chevron-right" size={16} color={C.brown} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // card (Inicio)
  card: {
    flexDirection: 'row',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: C.cream,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  thumb: { width: 72, height: 72 },
  info: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 5 },
  name: { fontSize: 14, color: C.ink, fontFamily: F.serifSemi },
  chipsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chevron: { marginRight: 12 },
  // row (Buscar)
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  rowThumb: { width: 48, height: 48, borderRadius: RADIUS.md },
  rowName: { fontSize: 14, color: C.ink, fontFamily: F.serifSemi, marginBottom: 5 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  metaText: { fontSize: 11, color: C.brown, fontFamily: F.sans, flexShrink: 1 },
  // favorite (Favoritos)
  favCard: {
    flexDirection: 'row',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: C.cream,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  favThumb: { width: 88, alignSelf: 'stretch', minHeight: 92 },
  favInfo: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, gap: 6 },
  favName: { fontSize: 14, color: C.ink, fontFamily: F.serifSemi },
  favSide: { alignItems: 'center', gap: 14, paddingRight: 14 },
});
