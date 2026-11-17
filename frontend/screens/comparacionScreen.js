import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C, F, SPACING } from '../theme';
import Divider from '../components/Divider';
import NoticeBox from '../components/NoticeBox';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { LoadingState, ErrorState, EmptyState } from '../components/StateMessage';
import usePlace from '../hooks/usePlace';

// P-04 Comparación antes/después del lugar seleccionado.
export default function ComparacionScreen({ navigation, route }) {
  const { data: place, loading, error, retry } = usePlace(route);
  const [selected, setSelected] = useState(0);

  // Por defecto se selecciona la primera fotografía que sí tiene imagen.
  useEffect(() => {
    if (!place) return;
    const firstWithImage = place.fotosHistoricas.findIndex((f) => f.uri);
    setSelected(firstWithImage >= 0 ? firstWithImage : 0);
  }, [place]);

  if (loading) return <Centered><LoadingState label="Cargando comparación…" /></Centered>;
  if (error) return <Centered><ErrorState onRetry={retry} /></Centered>;
  if (!place) {
    return <Centered><EmptyState icon="map-pin" title="Lugar no encontrado" actionLabel="Volver" onAction={() => navigation.goBack()} /></Centered>;
  }

  const photos = place.fotosHistoricas;
  const current = photos[selected];

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar style="light" />
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Volver">
          <Feather name="arrow-left" size={18} color={C.cream} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.placeName} numberOfLines={1}>{place.nombre}</Text>
          <Text style={styles.placeLoc}>{`${place.sector} · ${place.ciudad}`.toUpperCase()}</Text>
        </View>
      </SafeAreaView>

      {photos.length > 0 ? (
        <BeforeAfterSlider
          beforeUri={current?.uri}
          afterUri={place.imagenActual}
          beforeLabel={`ANTES · ${current?.anio ?? ''}`}
          afterLabel="HOY"
        />
      ) : (
        <View style={styles.noPhotos}>
          <EmptyState
            icon="image"
            title="Sin fotografías históricas"
            message="Este lugar todavía no tiene fotografías de archivo para comparar."
          />
        </View>
      )}

      <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
        {photos.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>FOTOGRAFÍAS HISTÓRICAS</Text>
            <View style={styles.yearsRow}>
              {photos.map((photo, index) => {
                const active = index === selected;
                return (
                  <TouchableOpacity
                    key={photo.anio}
                    onPress={() => setSelected(index)}
                    style={[styles.yearChip, active && styles.yearChipActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.yearText, active && styles.yearTextActive]}>{photo.anio}</Text>
                    {!photo.uri && <Text style={styles.yearPending}>pendiente</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
            <Divider />
            <NoticeBox icon="info">
              Desliza el divisor para comparar el mismo lugar en distintos momentos de la historia.
            </NoticeBox>
            <NoticeBox icon="alert-circle" tone="neutral">
              Las fotografías actuales son ilustrativas. Las fechas marcadas como "pendiente" aún no tienen imagen de archivo.
            </NoticeBox>
          </>
        )}

        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => navigation.navigate('HistoriaLugar', { placeId: place.id })}
          accessibilityRole="button"
        >
          <Text style={styles.historyBtnText}>Ver historia del lugar →</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Centered({ children }) {
  return <SafeAreaView style={[styles.container, { backgroundColor: C.parchment, justifyContent: 'center' }]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.ink },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: SPACING.xl, paddingTop: SPACING.sm, paddingBottom: SPACING.md },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 8 },
  placeName: { fontSize: 17, color: C.cream, fontFamily: F.serifSemi },
  placeLoc: { fontSize: 11, color: 'rgba(253,250,243,0.6)', fontFamily: F.mono },
  noPhotos: { height: 300, backgroundColor: C.parchment, justifyContent: 'center' },
  panel: {
    flex: 1, backgroundColor: C.parchment, borderTopLeftRadius: 16, borderTopRightRadius: 16, marginTop: -14,
  },
  panelContent: { padding: SPACING.xl, gap: SPACING.md, flexGrow: 1 },
  sectionLabel: { fontSize: 10, color: C.brown, letterSpacing: 1.2, fontFamily: F.mono },
  yearsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  yearChip: { borderWidth: 1.5, borderColor: C.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, alignItems: 'center' },
  yearChipActive: { borderColor: C.amber, backgroundColor: C.amberSoft },
  yearText: { fontSize: 11, color: C.brown, fontFamily: F.mono },
  yearTextActive: { color: C.amber },
  yearPending: { fontSize: 8, color: C.brown, fontFamily: F.mono, marginTop: 2, opacity: 0.8 },
  historyBtn: {
    marginTop: 'auto', borderWidth: 1.5, borderColor: C.border, borderRadius: 12,
    paddingVertical: 13, alignItems: 'center',
  },
  historyBtnText: { fontSize: 13, color: C.amber, fontFamily: F.sansMed },
});
