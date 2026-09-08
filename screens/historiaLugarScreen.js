import React from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { C, F, SPACING, RADIUS } from '../theme';
import Divider from '../components/Divider';

const HERO = 'https://images.unsplash.com/photo-1682451240518-a55d229f5027?w=900&h=500&fit=crop&auto=format';

const SECTIONS = [
  {
    title: 'Origen y construcción',
    text: 'La historia de este lugar está vinculada a los primeros asentamientos de la zona. La construcción original se llevó a cabo para convertirse en un importante espacio público y de encuentro.',
  },
  {
    title: 'Transformaciones del lugar',
    text: 'Su entorno y arquitectura han cambiado con el tiempo, acompañando el crecimiento de la ciudad y el desarrollo de su tejido urbano.',
  },
  {
    title: 'Significado cultural',
    text: 'Es uno de los principales símbolos históricos y culturales de la región, asociado con la memoria colectiva de sus habitantes.',
  },
];

const SOURCES = [
  { label: 'Archivo Nacional', detail: 'Fondo Histórico, Siglo XVIII–XX' },
  { label: 'Municipalidad', detail: 'Patrimonio histórico urbano, 2019' },
  { label: 'Universidad — Instituto de Historia', detail: 'Investigaciones documentadas' },
];

export default function HistoriaLugarScreen({ navigation, route }) {
  const place = route?.params?.place ?? { name: 'Basílica de Suyapa' };

  return (
    <View style={styles.container}>
      <View style={styles.heroWrap}>
        <Image source={{ uri: HERO }} style={styles.heroImg} />
        <View style={styles.heroTint} />
        <SafeAreaView edges={['top']} style={styles.heroTopBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={18} color={C.white} />
          </TouchableOpacity>
        </SafeAreaView>
        <View style={styles.heroCaption}>
          <Text style={styles.heroKicker}>HISTORIA DEL LUGAR</Text>
          <Text style={styles.heroTitle}>{place.name}</Text>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.badge}>
          <Feather name="info" size={14} color={C.amber} />
          <Text style={styles.badgeText}>
            Información basada en fuentes históricas seleccionadas y verificadas
          </Text>
        </View>

        {SECTIONS.map((sec, i) => (
          <View key={sec.title}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionBar} />
              <Text style={styles.sectionTitle}>{sec.title}</Text>
            </View>
            <Text style={styles.sectionText}>{sec.text}</Text>
            {i < SECTIONS.length - 1 && <View style={styles.sectionSeparator} />}
          </View>
        ))}

        <Divider label="Fuentes y referencias" />

        <View style={{ gap: 8 }}>
          {SOURCES.map((src) => (
            <View key={src.label} style={styles.sourceRow}>
              <Feather name="book" size={15} color={C.amber} />
              <View>
                <Text style={styles.sourceLabel}>{src.label}</Text>
                <Text style={styles.sourceDetail}>{src.detail}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.parchment },
  heroWrap: { height: 190 },
  heroImg: { ...StyleSheet.absoluteFillObject, resizeMode: 'cover' },
  heroTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(28,18,8,0.5)' },
  heroTopBar: { paddingHorizontal: SPACING.md },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 8, alignSelf: 'flex-start' },
  heroCaption: { position: 'absolute', bottom: 14, left: SPACING.xl },
  heroKicker: { fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, fontFamily: F.mono, marginBottom: 4 },
  heroTitle: { fontSize: 22, fontWeight: '700', color: C.white, fontFamily: F.serif },
  body: { flex: 1 },
  bodyContent: { padding: SPACING.xl, gap: SPACING.lg, paddingBottom: SPACING.xxl },
  badge: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: C.amberSoft, borderWidth: 1, borderColor: C.amberBorder,
    borderRadius: 10, padding: 12,
  },
  badgeText: { flex: 1, fontSize: 11, color: C.amber, lineHeight: 17, fontFamily: F.sansMed },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sectionBar: { width: 3, height: 16, backgroundColor: C.amber, borderRadius: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: C.ink, fontFamily: F.serifSemi },
  sectionText: { fontSize: 13, color: C.inkMid, lineHeight: 22, fontFamily: F.sans },
  sectionSeparator: { height: 1, backgroundColor: C.border, marginTop: 16 },
  sourceRow: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: C.cream, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, padding: 12,
  },
  sourceLabel: { fontSize: 12, fontWeight: '600', color: C.ink, fontFamily: F.sansSemi },
  sourceDetail: { fontSize: 11, color: C.brown, marginTop: 2, fontFamily: F.mono },
});
