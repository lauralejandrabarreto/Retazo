import React from 'react';
import {
  View, Text, Image, TouchableOpacity, FlatList, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { C, F, SPACING, RADIUS } from '../theme';
import Chip from '../components/Chip';

const PLACES = [
  { name: 'Catedral de San Miguel Arcángel', loc: 'Centro Histórico', year: 'ca. 1610', image: 'https://images.unsplash.com/photo-1699177247360-3540d424e739?w=200&h=200&fit=crop&auto=format' },
  { name: 'Fortaleza de San Fernando', loc: 'Omoa', year: 'Siglo XVIII', image: 'https://images.unsplash.com/photo-1721056609609-3bcbc27e08ee?w=200&h=200&fit=crop&auto=format' },
  { name: 'Teatro Colón', loc: 'Bogotá', year: 'Siglo XIX', image: 'https://images.unsplash.com/photo-1715503052107-34c1ec2ec84a?w=200&h=200&fit=crop&auto=format' },
  { name: 'Estación de La Sabana', loc: 'Los Mártires', year: 'ca. 1917', image: 'https://images.unsplash.com/photo-1697919046731-6474a584cc20?w=200&h=200&fit=crop&auto=format' },
];

export default function FavoritosScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Favoritos</Text>
        <Text style={styles.subtitle}>{PLACES.length} lugares en tu colección</Text>
      </View>

      <FlatList
        data={PLACES}
        keyExtractor={(p) => p.name}
        contentContainerStyle={{ paddingHorizontal: SPACING.xl, gap: SPACING.md, paddingBottom: SPACING.xl }}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('LugarHistorico', { place: item })}
          >
            <Image source={{ uri: item.image }} style={styles.thumb} />
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
              <View style={styles.locRow}>
                <Feather name="map-pin" size={11} color={C.brown} />
                <Text style={styles.loc}>{item.loc}</Text>
              </View>
              <Chip label={item.year} amber />
            </View>
            <View style={styles.side}>
              <Ionicons name="bookmark" size={16} color={C.amber} />
              <Feather name="chevron-right" size={14} color={C.border} />
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.parchment },
  header: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.lg },
  title: { fontSize: 22, fontWeight: '600', color: C.ink, fontFamily: F.serif },
  subtitle: { fontSize: 12, color: C.brown, marginTop: 2, fontFamily: F.sans },
  card: {
    flexDirection: 'row', borderRadius: 14, overflow: 'hidden',
    backgroundColor: C.cream, borderWidth: 1, borderColor: C.border,
    alignItems: 'center',
  },
  thumb: { width: 88, height: 88, backgroundColor: C.sepia },
  info: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, gap: 6 },
  name: { fontSize: 14, fontWeight: '600', color: C.ink, fontFamily: F.serifSemi },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  loc: { fontSize: 11, color: C.brown, fontFamily: F.sans },
  side: { alignItems: 'center', gap: 6, paddingRight: 14 },
});
