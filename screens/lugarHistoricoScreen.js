import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { C, F, SPACING, RADIUS } from '../theme';
import Chip from '../components/Chip';
import Divider from '../components/Divider';

const HERO = 'https://images.unsplash.com/photo-1639910310293-4b03ccac91cc?w=900&h=700&fit=crop&auto=format';
const HISTORICAL = 'https://images.unsplash.com/photo-1645537762185-acecf1e9b5ec?w=900&h=500&fit=crop&auto=format';

export default function LugarHistoricoScreen({ navigation, route }) {
  const [saved, setSaved] = useState(false);
  const place = route?.params?.place ?? { name: 'Plaza de Bolívar', loc: 'La Candelaria, Bogotá' };

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={styles.heroWrap}>
        <Image source={{ uri: HERO }} style={styles.heroImg} />
        <LinearGradient
          colors={['rgba(28,18,8,0.4)', 'rgba(28,18,8,0.1)', 'rgba(28,18,8,0.75)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView edges={['top']} style={styles.heroTopBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={18} color={C.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setSaved((s) => !s)}>
            <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={C.white} />
          </TouchableOpacity>
        </SafeAreaView>

        <View style={styles.heroCaption}>
          <Chip label="ca. 1850 – presente" amber />
          <Text style={styles.placeName}>{place.name}</Text>
          <View style={styles.placeLocRow}>
            <Feather name="map-pin" size={12} color="rgba(255,255,255,0.85)" />
            <Text style={styles.placeLoc}>{place.loc}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View>
          <Text style={styles.sectionLabel}>FOTOGRAFÍA HISTÓRICA</Text>
          <View style={styles.historicalWrap}>
            <Image source={{ uri: HISTORICAL }} style={styles.historicalImg} />
            <View style={styles.historicalTintOverlay} />
            <Chip label="~ 1910" amber style={styles.historicalChip} />
            <Text style={styles.historicalCredit}>Archivo Histórico</Text>
          </View>
        </View>

        <Divider />

        <View>
          <Text style={styles.sectionLabel}>DESCRIPCIÓN</Text>
          <Text style={styles.description}>
            {place.name} ha sido uno de los principales espacios públicos del centro de la
            ciudad. Su entorno ha cambiado a lo largo del tiempo junto con el crecimiento y
            las transformaciones urbanas.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Comparacion', { place })}
        >
          <Text style={styles.primaryBtnText}>Comparar pasado y presente</Text>
          <Feather name="chevron-right" size={16} color={C.cream} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('HistoriaLugar', { place })}
        >
          <Text style={styles.secondaryBtnText}>Ver historia del lugar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.parchment },
  heroWrap: { height: 260 },
  heroImg: { ...StyleSheet.absoluteFillObject, resizeMode: 'cover' },
  heroTopBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.md },
  iconBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 8,
  },
  heroCaption: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SPACING.xl, paddingBottom: SPACING.lg, gap: 4 },
  placeName: { fontSize: 26, fontWeight: '700', color: C.white, fontFamily: F.serif, marginTop: 4 },
  placeLocRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  placeLoc: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontFamily: F.sans },
  body: { flex: 1 },
  bodyContent: { padding: SPACING.xl, gap: SPACING.lg },
  sectionLabel: { fontSize: 10, color: C.brown, letterSpacing: 1.2, fontFamily: F.mono, marginBottom: 8 },
  historicalWrap: { borderRadius: 10, overflow: 'hidden', height: 140 },
  historicalImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  historicalTintOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(120,90,50,0.25)' },
  historicalChip: { position: 'absolute', bottom: 8, left: 8 },
  historicalCredit: { position: 'absolute', bottom: 10, right: 8, fontSize: 10, color: 'rgba(255,255,255,0.7)', fontFamily: F.mono },
  description: { fontSize: 13, color: C.inkMid, lineHeight: 21, fontFamily: F.sans },
  primaryBtn: {
    backgroundColor: C.ink, borderRadius: 12, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  primaryBtnText: { fontSize: 14, fontWeight: '600', color: C.cream, fontFamily: F.sansSemi },
  secondaryBtn: {
    borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingVertical: 13, alignItems: 'center',
  },
  secondaryBtnText: { fontSize: 13, color: C.amber, fontFamily: F.sansMed },
});
