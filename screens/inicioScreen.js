import React from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { C, F, SPACING, RADIUS } from '../theme';
import PlaceCard from '../components/PlaceCard';

const MAP_IMG = 'https://images.unsplash.com/photo-1568632234165-47bb34c35708?w=900&h=500&fit=crop&auto=format';

const NEARBY = [
  { name: 'Plaza de Bolívar', year: 'ca. 1850', dist: '320 m', image: 'https://images.unsplash.com/photo-1639910310293-4b03ccac91cc?w=300&h=300&fit=crop&auto=format' },
  { name: 'Museo del Oro', year: 'Siglo XX', dist: '450 m', image: 'https://images.unsplash.com/photo-1628128594359-25d5e30661dd?w=300&h=300&fit=crop&auto=format' },
  { name: 'Parque Central', year: 'Siglo XIX', dist: '600 m', image: 'https://images.unsplash.com/photo-1637966201771-b0b251baa2ef?w=300&h=300&fit=crop&auto=format' },
];

export default function InicioScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Hero map */}
      <View style={styles.heroWrap}>
        <Image source={{ uri: MAP_IMG }} style={styles.heroImg} />
        <LinearGradient
          colors={['rgba(28,18,8,0.6)', 'rgba(28,18,8,0.2)', 'rgba(243,237,224,0.95)']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView edges={['top']} style={styles.heroHeader}>
          <Text style={styles.logo}>Retazo</Text>
          <View style={styles.locationPill}>
            <Feather name="map-pin" size={12} color={C.white} />
            <Text style={styles.locationText}>Bogotá, Colombia</Text>
          </View>
        </SafeAreaView>

        {/* pin markers, purely decorative */}
        {[{ left: '38%', top: '58%' }, { left: '62%', top: '44%' }, { left: '52%', top: '72%' }].map((pos, i) => (
          <View key={i} style={[styles.pin, pos]} />
        ))}
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {/* Search bar */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Buscar')}
        >
          <Feather name="search" size={16} color={C.brown} />
          <Text style={styles.searchPlaceholder}>Buscar lugar histórico…</Text>
          <View style={styles.searchDivider} />
          <Feather name="sliders" size={15} color={C.amber} />
        </TouchableOpacity>

        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>LUGARES CERCANOS</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Buscar')}>
            <Text style={styles.sectionLink}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: SPACING.sm }}>
          {NEARBY.map((place) => (
            <PlaceCard
              key={place.name}
              {...place}
              onPress={() => navigation.navigate('LugarHistorico', { place })}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.parchment },
  heroWrap: { height: 230, width: '100%' },
  heroImg: { ...StyleSheet.absoluteFillObject, resizeMode: 'cover' },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
  },
  logo: { fontSize: 26, fontWeight: '700', color: C.white, fontFamily: F.serifItalic },
  locationPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: RADIUS.pill,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  locationText: { fontSize: 11, color: C.white, fontFamily: F.sansMed },
  pin: {
    position: 'absolute', width: 10, height: 10, borderRadius: 5,
    backgroundColor: C.amberLt, borderWidth: 2, borderColor: C.white,
  },
  body: { flex: 1 },
  bodyContent: { padding: SPACING.xl, paddingTop: SPACING.lg, gap: SPACING.md },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.cream, borderWidth: 1.5, borderColor: C.border,
    borderRadius: RADIUS.lg, paddingHorizontal: 14, paddingVertical: 12,
  },
  searchPlaceholder: { flex: 1, fontSize: 13, color: C.brown, fontFamily: F.sans },
  searchDivider: { width: 1, height: 16, backgroundColor: C.border },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  sectionLabel: { fontSize: 10, color: C.brown, letterSpacing: 1.2, fontFamily: F.mono },
  sectionLink: { fontSize: 11, color: C.amber, fontFamily: F.sansMed },
});
