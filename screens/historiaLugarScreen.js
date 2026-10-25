import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C, F, SPACING } from '../theme';
import Divider from '../components/Divider';
import NoticeBox from '../components/NoticeBox';
import PlaceImage from '../components/PlaceImage';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { LoadingState, ErrorState, EmptyState } from '../components/StateMessage';
import usePlace from '../hooks/usePlace';

// P-05 Historia del lugar: narrativa por secciones y fuentes.
// El aviso superior depende de `contenidoVerificado`: la app solo afirma que la
// información está verificada cuando el dato lo indica.
export default function HistoriaLugarScreen({ navigation, route }) {
  const { data: place, loading, error, retry } = usePlace(route);

  if (loading) return <Centered><LoadingState label="Cargando historia…" /></Centered>;
  if (error) return <Centered><ErrorState onRetry={retry} /></Centered>;
  if (!place) {
    return <Centered><EmptyState icon="map-pin" title="Lugar no encontrado" actionLabel="Volver" onAction={() => navigation.goBack()} /></Centered>;
  }

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar style="light" />
      <View style={styles.heroWrap}>
        <PlaceImage uri={place.imagenActual} style={StyleSheet.absoluteFill} label="" failedLabel="" />
        <View style={styles.heroTint} />
        <SafeAreaView edges={['top']} style={styles.heroTopBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Volver">
            <Feather name="arrow-left" size={18} color={C.white} />
          </TouchableOpacity>
        </SafeAreaView>
        <View style={styles.heroCaption}>
          <Text style={styles.heroKicker}>HISTORIA DEL LUGAR</Text>
          <Text style={styles.heroTitle}>{place.nombre}</Text>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {place.contenidoVerificado ? (
          <NoticeBox icon="check-circle">Información basada en fuentes históricas seleccionadas y verificadas.</NoticeBox>
        ) : (
          <NoticeBox icon="alert-circle" tone="neutral">
            Contenido preliminar de prueba. Este texto aún no ha sido contrastado con fuentes documentales.
          </NoticeBox>
        )}

        {place.historia.map((sec, i) => (
          <View key={sec.titulo}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionBar} />
              <Text style={styles.sectionTitle}>{sec.titulo}</Text>
            </View>
            <Text style={styles.sectionText}>{sec.texto}</Text>
            {i < place.historia.length - 1 && <View style={styles.sectionSeparator} />}
          </View>
        ))}

        <Divider label="Fuentes y referencias" />

        {place.fuentes.length > 0 ? (
          <View style={{ gap: 8 }}>
            {place.fuentes.map((src) => (
              <View key={src.titulo} style={styles.sourceRow}>
                <Feather name="book" size={15} color={C.amber} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sourceLabel}>{src.titulo}</Text>
                  <Text style={styles.sourceDetail}>{src.detalle}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.sourcesEmpty}>
            <Feather name="book-open" size={18} color={C.brown} />
            <Text style={styles.sourcesEmptyText}>
              Fuentes pendientes. Se incorporarán cuando el contenido se valide con archivos, entidades patrimoniales y publicaciones académicas.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Centered({ children }) {
  return <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.parchment },
  heroWrap: { height: 200 },
  heroTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(28,18,8,0.55)' },
  heroTopBar: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 9, alignSelf: 'flex-start' },
  heroCaption: { position: 'absolute', bottom: 16, left: SPACING.xl, right: SPACING.xl },
  heroKicker: { fontSize: 10, color: 'rgba(255,255,255,0.75)', letterSpacing: 1.2, fontFamily: F.mono, marginBottom: 4 },
  heroTitle: { fontSize: 24, color: C.white, fontFamily: F.serif },
  body: { flex: 1 },
  bodyContent: { padding: SPACING.xl, gap: SPACING.lg, paddingBottom: SPACING.xxl },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sectionBar: { width: 3, height: 16, backgroundColor: C.amber, borderRadius: 2 },
  sectionTitle: { fontSize: 15, color: C.ink, fontFamily: F.serifSemi },
  sectionText: { fontSize: 13.5, color: C.inkMid, lineHeight: 22, fontFamily: F.sans },
  sectionSeparator: { height: 1, backgroundColor: C.border, marginTop: 16 },
  sourceRow: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: C.cream, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 12,
  },
  sourceLabel: { fontSize: 12, color: C.ink, fontFamily: F.sansSemi },
  sourceDetail: { fontSize: 11, color: C.brown, marginTop: 2, fontFamily: F.mono },
  sourcesEmpty: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    borderWidth: 1, borderStyle: 'dashed', borderColor: C.border, borderRadius: 10, padding: 14,
  },
  sourcesEmptyText: { flex: 1, fontSize: 12, color: C.brown, lineHeight: 18, fontFamily: F.sans },
});
