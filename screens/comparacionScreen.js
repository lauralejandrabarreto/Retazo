import React, { useRef, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, PanResponder, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C, F, SPACING, RADIUS } from '../theme';
import Divider from '../components/Divider';

const AFTER_IMG = 'https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?w=900&h=700&fit=crop&auto=format';
const BEFORE_IMG = 'https://images.unsplash.com/photo-1645537762185-acecf1e9b5ec?w=900&h=700&fit=crop&auto=format';

const YEARS = ['~ 1870', '~ 1910', '1950', '1985'];
const COMPARE_HEIGHT = 300;

export default function ComparacionScreen({ navigation, route }) {
  const place = route?.params?.place ?? { name: 'Plaza de Bolívar', loc: 'La Candelaria · Bogotá' };
  const [sliderPct, setSliderPct] = useState(50);
  const [selectedYear, setSelectedYear] = useState('~ 1910');
  const containerWidth = useRef(Dimensions.get('window').width);

  const updateFromX = (x) => {
    const pct = Math.min(Math.max((x / containerWidth.current) * 100, 5), 95);
    setSliderPct(pct);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => updateFromX(evt.nativeEvent.locationX),
      onPanResponderMove: (evt) => updateFromX(evt.nativeEvent.locationX),
    })
  ).current;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={18} color={C.cream} />
        </TouchableOpacity>
        <View>
          <Text style={styles.placeName}>{place.name}</Text>
          <Text style={styles.placeLoc}>{(place.loc ?? '').toUpperCase()}</Text>
        </View>
      </SafeAreaView>

      {/* Comparison slider */}
      <View
        style={styles.compareArea}
        onLayout={(e) => { containerWidth.current = e.nativeEvent.layout.width; }}
        {...panResponder.panHandlers}
      >
        <Image source={{ uri: AFTER_IMG }} style={styles.compareImg} />
        <View style={[styles.beforeClip, { width: `${sliderPct}%` }]}>
          <Image source={{ uri: BEFORE_IMG }} style={[styles.compareImg, { width: containerWidth.current }]} />
          <View style={styles.beforeTint} />
        </View>

        <View style={[styles.label, styles.labelLeft]}>
          <Text style={styles.labelTextLight}>ANTES · {selectedYear}</Text>
        </View>
        <View style={[styles.label, styles.labelRight]}>
          <Text style={styles.labelTextDark}>HOY · 2024</Text>
        </View>

        <View style={[styles.sliderLine, { left: `${sliderPct}%` }]}>
          <View style={styles.sliderHandle}>
            <View style={styles.handleBar} />
            <View style={styles.handleBar} />
          </View>
        </View>
      </View>

      {/* Bottom panel */}
      <View style={styles.panel}>
        <Text style={styles.sectionLabel}>FOTOGRAFÍAS HISTÓRICAS</Text>
        <View style={styles.yearsRow}>
          {YEARS.map((y) => {
            const active = y === selectedYear;
            return (
              <TouchableOpacity
                key={y}
                onPress={() => setSelectedYear(y)}
                style={[styles.yearChip, active && styles.yearChipActive]}
              >
                <Text style={[styles.yearText, active && styles.yearTextActive]}>{y}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Divider />

        <View style={styles.infoRow}>
          <Feather name="info" size={14} color={C.amber} />
          <Text style={styles.infoText}>
            Desliza el divisor para comparar el mismo lugar en distintos momentos de la historia.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => navigation.navigate('HistoriaLugar', { place })}
        >
          <Text style={styles.historyBtnText}>Ver historia del lugar →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.ink },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.md },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 8 },
  placeName: { fontSize: 17, fontWeight: '600', color: C.cream, fontFamily: F.serifSemi },
  placeLoc: { fontSize: 11, color: 'rgba(253,250,243,0.6)', fontFamily: F.mono },
  compareArea: { height: COMPARE_HEIGHT, position: 'relative', overflow: 'hidden' },
  compareImg: { width: '100%', height: COMPARE_HEIGHT, resizeMode: 'cover' },
  beforeClip: { position: 'absolute', top: 0, bottom: 0, left: 0, overflow: 'hidden' },
  beforeTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(90,70,40,0.3)' },
  label: { position: 'absolute', top: 12, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 4 },
  labelLeft: { left: 14, backgroundColor: C.ink },
  labelRight: { right: 14, backgroundColor: 'rgba(253,250,243,0.9)' },
  labelTextLight: { fontSize: 10, fontWeight: '700', color: C.cream, letterSpacing: 1, fontFamily: F.mono },
  labelTextDark: { fontSize: 10, fontWeight: '700', color: C.ink, letterSpacing: 1, fontFamily: F.mono },
  sliderLine: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: C.white, marginLeft: -1 },
  sliderHandle: {
    position: 'absolute', top: '50%', left: '50%', marginTop: -16, marginLeft: -16,
    width: 32, height: 32, borderRadius: 16, backgroundColor: C.white,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2,
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 4,
  },
  handleBar: { width: 2, height: 12, backgroundColor: C.brown, borderRadius: 1 },
  panel: {
    flex: 1, backgroundColor: C.parchment, borderTopLeftRadius: 16, borderTopRightRadius: 16,
    marginTop: -14, padding: SPACING.xl, gap: SPACING.md,
  },
  sectionLabel: { fontSize: 10, color: C.brown, letterSpacing: 1.2, fontFamily: F.mono },
  yearsRow: { flexDirection: 'row', gap: 8 },
  yearChip: { borderWidth: 1.5, borderColor: C.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  yearChipActive: { borderColor: C.amber, backgroundColor: C.amberSoft },
  yearText: { fontSize: 11, fontWeight: '600', color: C.brown, fontFamily: F.mono },
  yearTextActive: { color: C.amber },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  infoText: { flex: 1, fontSize: 12, color: C.brown, lineHeight: 19, fontFamily: F.sans },
  historyBtn: {
    marginTop: 'auto', borderWidth: 1.5, borderColor: C.border, borderRadius: 12,
    paddingVertical: 13, alignItems: 'center', marginBottom: SPACING.lg,
  },
  historyBtnText: { fontSize: 13, color: C.amber, fontFamily: F.sansMed },
});
