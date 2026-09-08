import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, FlatList, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C, F, SPACING, RADIUS } from '../theme';
import Chip from '../components/Chip';
import Divider from '../components/Divider';

const FILTERS = ['Siglo XVI', 'Siglo XIX', 'Siglo XX', 'Prehispánico'];

const RESULTS = [
  { name: 'Plaza de Bolívar', loc: 'La Candelaria', year: 'Siglo XIX', image: 'https://images.unsplash.com/photo-1639910310293-4b03ccac91cc?w=200&h=200&fit=crop&auto=format' },
  { name: 'Parque Central', loc: 'Tegucigalpa', year: 'Siglo XIX', image: 'https://images.unsplash.com/photo-1637966201771-b0b251baa2ef?w=200&h=200&fit=crop&auto=format' },
  { name: 'Basílica de Suyapa', loc: 'Tegucigalpa', year: 'Siglo XX', image: 'https://images.unsplash.com/photo-1682451240518-a55d229f5027?w=200&h=200&fit=crop&auto=format' },
  { name: 'Estación de La Sabana', loc: 'Los Mártires', year: 'Siglo XX', image: 'https://images.unsplash.com/photo-1697919046731-6474a584cc20?w=200&h=200&fit=crop&auto=format' },
  { name: 'Museo Nacional de Colombia', loc: 'Bogotá', year: 'Siglo XIX', image: 'https://images.unsplash.com/photo-1628128594359-25d5e30661dd?w=200&h=200&fit=crop&auto=format' },
  { name: 'Catedral de Comayagua', loc: 'Comayagua', year: 'Siglo XVI', image: 'https://images.unsplash.com/photo-1699177247360-3540d424e739?w=200&h=200&fit=crop&auto=format' },
];

export default function BuscarScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('Siglo XIX');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorar</Text>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={C.brown} />
          <Text style={styles.searchPlaceholder}>Buscar lugar histórico…</Text>
        </View>
      </View>

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(f) => f}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => {
          const active = item === activeFilter;
          return (
            <TouchableOpacity
              onPress={() => setActiveFilter(item)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <View style={{ paddingHorizontal: SPACING.xl }}>
        <Divider label={`${RESULTS.length} resultados`} />
      </View>

      <FlatList
        data={RESULTS}
        keyExtractor={(r) => r.name}
        contentContainerStyle={{ paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('LugarHistorico', { place: item })}
          >
            <Image source={{ uri: item.image }} style={styles.resultThumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.resultName}>{item.name}</Text>
              <View style={styles.resultMeta}>
                <Feather name="map-pin" size={11} color={C.brown} />
                <Text style={styles.resultLoc}>{item.loc}</Text>
                <Chip label={item.year} amber />
              </View>
            </View>
            <Feather name="chevron-right" size={16} color={C.border} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.parchment },
  header: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xs, paddingBottom: SPACING.md },
  title: { fontSize: 22, fontWeight: '600', color: C.ink, fontFamily: F.serif, marginBottom: 14 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.cream, borderWidth: 1.5, borderColor: C.border,
    borderRadius: RADIUS.lg, paddingHorizontal: 14, paddingVertical: 12,
  },
  searchPlaceholder: { fontSize: 13, color: C.brown, fontFamily: F.sans },
  filterRow: { paddingHorizontal: SPACING.xl, gap: 8, paddingBottom: SPACING.md },
  filterChip: {
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: C.sepia,
  },
  filterChipActive: { backgroundColor: C.amber },
  filterText: { fontSize: 11, color: C.brown, fontFamily: F.mono },
  filterTextActive: { color: C.white },
  separator: { height: 1, backgroundColor: C.border },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  resultThumb: { width: 48, height: 48, borderRadius: 10, backgroundColor: C.sepia },
  resultName: { fontSize: 14, fontWeight: '600', color: C.ink, fontFamily: F.serifSemi, marginBottom: 5 },
  resultMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resultLoc: { fontSize: 11, color: C.brown, fontFamily: F.sans },
});
