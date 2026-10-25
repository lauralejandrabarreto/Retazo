import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { C, F, SPACING, RADIUS } from '../theme';
import PlaceCard from '../components/PlaceCard';
import PlaceImage from '../components/PlaceImage';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { LoadingState, EmptyState, ErrorState } from '../components/StateMessage';
import { getNearbyPlaces } from '../services/placesService';
import { MAP_BACKGROUND, SIMULATED_LOCATION } from '../data/places';
import { formatDistance } from '../utils/geo';
import useAsync from '../hooks/useAsync';

// P-01 Inicio. El "mapa" es una vista esquemática: los pines se ubican según las
// coordenadas reales de cada lugar respecto a una ubicación SIMULADA del usuario.
// No hay mapa real ni GPS en esta entrega.

const HERO_HEIGHT = 240;

function projectPins(places) {
  if (!places?.length) return [];
  const { lat, lng } = SIMULATED_LOCATION.coords;
  const toXY = (p) => ({
    x: (p.coords.lng - lng) * Math.cos((lat * Math.PI) / 180) * 111320,
    y: (p.coords.lat - lat) * 110540,
  });
  const points = places.map((p) => ({ place: p, ...toXY(p) }));
  const maxAbs = Math.max(...points.map((p) => Math.max(Math.abs(p.x), Math.abs(p.y))), 1);
  return points.map(({ place, x, y }) => ({
    place,
    left: `${50 + (x / maxAbs) * 32}%`,
    top: `${64 - (y / maxAbs) * 22}%`,
  }));
}

export default function InicioScreen({ navigation }) {
  const { data: nearby, loading, error, retry } = useAsync(() => getNearbyPlaces(), []);
  const openPlace = (place) => navigation.navigate('LugarHistorico', { placeId: place.id });
  const pins = projectPins(nearby);

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar style="light" />
      <View style={styles.heroWrap}>
        <PlaceImage uri={MAP_BACKGROUND} style={StyleSheet.absoluteFill} label="" failedLabel="" />
        <LinearGradient
          colors={['rgba(28,18,8,0.65)', 'rgba(28,18,8,0.25)', 'rgba(243,237,224,0.95)']}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView edges={['top']} style={styles.heroHeader}>
          <Text style={styles.logo}>Retazo</Text>
          <View style={styles.locationPill}>
            <Feather name="map-pin" size={12} color={C.white} />
            <Text style={styles.locationText}>{SIMULATED_LOCATION.label}</Text>
          </View>
        </SafeAreaView>

        {/* Ubicación simulada del usuario */}
        <View style={[styles.userDot, { left: '50%', top: '64%' }]} accessibilityLabel="Ubicación simulada" />

        {pins.map(({ place, left, top }) => (
          <TouchableOpacity
            key={place.id}
            style={[styles.pinHit, { left, top }]}
            onPress={() => openPlace(place)}
            accessibilityRole="button"
            accessibilityLabel={`Pin de ${place.nombre}`}
          >
            <View style={styles.pin} />
          </TouchableOpacity>
        ))}

        <Text style={styles.mapCaption}>Vista esquemática · ubicación simulada</Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Buscar', { focusSearch: Date.now() })}
          accessibilityRole="search"
          accessibilityLabel="Buscar lugar histórico"
        >
          <Feather name="search" size={16} color={C.brown} />
          <Text style={styles.searchPlaceholder}>Buscar lugar histórico…</Text>
          <View style={styles.searchDivider} />
          <Feather name="sliders" size={15} color={C.amber} />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>LUGARES CERCANOS</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Buscar')} accessibilityRole="button">
            <Text style={styles.sectionLink}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {loading && <LoadingState label="Buscando lugares cercanos…" />}
        {!loading && error && <ErrorState onRetry={retry} />}
        {!loading && !error && nearby?.length === 0 && (
          <EmptyState
            icon="map"
            title="No hay lugares cercanos"
            message="No encontramos lugares históricos a menos de 3 km."
            actionLabel="Explorar todos"
            onAction={() => navigation.navigate('Buscar')}
          />
        )}
        {!loading && !error && (
          <View style={{ gap: SPACING.sm }}>
            {nearby?.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                distanceLabel={formatDistance(place.distancia)}
                onPress={() => openPlace(place)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.parchment },
  heroWrap: { height: HERO_HEIGHT, width: '100%' },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
  },
  logo: { fontSize: 26, color: C.white, fontFamily: F.serifItalic },
  locationPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: RADIUS.pill,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  locationText: { fontSize: 11, color: C.white, fontFamily: F.sansMed },
  userDot: {
    position: 'absolute', width: 14, height: 14, marginLeft: -7, marginTop: -7, borderRadius: 7,
    backgroundColor: C.ink, borderWidth: 3, borderColor: C.white,
  },
  pinHit: { position: 'absolute', width: 28, height: 28, marginLeft: -14, marginTop: -14, alignItems: 'center', justifyContent: 'center' },
  pin: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: C.amberLt, borderWidth: 2, borderColor: C.white,
  },
  mapCaption: {
    position: 'absolute', right: SPACING.xl, bottom: 8,
    fontSize: 9, color: C.brown, fontFamily: F.mono, letterSpacing: 0.5,
  },
  body: { flex: 1 },
  bodyContent: { padding: SPACING.xl, paddingTop: SPACING.md, gap: SPACING.md },
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
