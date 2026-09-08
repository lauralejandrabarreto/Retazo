import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, F } from '../theme';
import Chip from './Chip';

export default function PlaceCard({ name, year, dist, image, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: image }} style={styles.thumb} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <View style={styles.chipsRow}>
          <Chip label={year} amber />
          {!!dist && <Chip label={dist} />}
        </View>
      </View>
      <Feather name="chevron-right" size={16} color={C.brown} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: C.cream,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  thumb: { width: 72, height: 72, backgroundColor: C.sepia },
  info: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 5 },
  name: { fontSize: 13, fontWeight: '600', color: C.ink, fontFamily: F.serifSemi },
  chipsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chevron: { marginRight: 12 },
});
