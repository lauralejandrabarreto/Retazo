import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { C, F, SPACING } from '../theme';
import Chip from '../components/Chip';
import Divider from '../components/Divider';
import PlaceImage from '../components/PlaceImage';
import NoticeBox from '../components/NoticeBox';
import Toast, { useToast } from '../components/Toast';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { LoadingState, ErrorState, EmptyState } from '../components/StateMessage';
import { useFavorites } from '../context/FavoritesContext';
import usePlace from '../hooks/usePlace';

// P-03 Lugar histórico: información general del lugar seleccionado y accesos a
// Comparación (P-04) e Historia (P-05). Permite agregar o quitar de favoritos.
export default function LugarHistoricoScreen({ navigation, route }) {
  const { data: place, loading, error, retry } = usePlace(route);
  const { isFavorite, toggleFavorite } = useFavorites();
  const toast = useToast();

  if (loading) return <Centered><LoadingState label="Cargando lugar…" /></Centered>;
  if (error) return <Centered><ErrorState onRetry={retry} /></Centered>;
  if (!place) {
    return (
      <Centered>
        <EmptyState icon="map-pin" title="Lugar no encontrado" message="El lugar solicitado no existe o fue retirado." actionLabel="Volver" onAction={() => navigation.goBack()} />
      </Centered>
    );
  }

  const saved = isFavorite(place.id);
  const historical = place.fotosHistoricas.find((f) => f.uri);
  const onToggleFavorite = () => {
    const added = toggleFavorite(place.id);
    toast.show(added ? 'Guardado en Favoritos' : 'Eliminado de Favoritos', added ? 'heart' : 'trash-2');
  };

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar style="light" />
      <View style={styles.heroWrap}>
        <PlaceImage uri={place.imagenActual} style={StyleSheet.absoluteFill} label="" failedLabel="" />
        <LinearGradient
          colors={['rgba(28,18,8,0.45)', 'rgba(28,18,8,0.1)', 'rgba(28,18,8,0.8)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView edges={['top']} style={styles.heroTopBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Volver">
            <Feather name="arrow-left" size={18} color={C.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onToggleFavorite}
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            accessibilityState={{ selected: saved }}
          >
            <Ionicons name={saved ? 'heart' : 'heart-outline'} size={18} color={saved ? C.amberLt : C.white} />
          </TouchableOpacity>
        </SafeAreaView>

        <View style={styles.heroCaption}>
          <Chip label={place.epoca} amber style={styles.heroChip} />
          <Text style={styles.placeName}>{place.nombre}</Text>
          <View style={styles.placeLocRow}>
            <Feather name="map-pin" size={12} color="rgba(255,255,255,0.85)" />
            <Text style={styles.placeLoc}>{place.sector}, {place.ciudad}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View>
          <Text style={styles.sectionLabel}>FOTOGRAFÍA HISTÓRICA</Text>
          <PlaceImage uri={historical?.uri} style={styles.historicalImg} label="Fotografía histórica pendiente de carga">
            {!!historical && (
              <>
                <View style={styles.historicalTint} />
                <Chip label={historical.anio} amber style={styles.historicalChip} />
                <Text style={styles.historicalCredit}>Imagen ilustrativa</Text>
              </>
            )}
          </PlaceImage>
        </View>

        <Divider />

        <View>
          <Text style={styles.sectionLabel}>DESCRIPCIÓN</Text>
          <Text style={styles.description}>{place.descripcion}</Text>
        </View>

        {!place.contenidoVerificado && (
          <NoticeBox icon="alert-circle" tone="neutral">
            Contenido preliminar: las imágenes son ilustrativas y la información está pendiente de verificación con fuentes documentales.
          </NoticeBox>
        )}

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Comparacion', { placeId: place.id })}
          accessibilityRole="button"
        >
          <Text style={styles.primaryBtnText}>Comparar pasado y presente</Text>
          <Feather name="chevron-right" size={16} color={C.cream} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('HistoriaLugar', { placeId: place.id })}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryBtnText}>Ver historia del lugar</Text>
        </TouchableOpacity>
      </ScrollView>

      <Toast message={toast.message} />
    </View>
  );
}

function Centered({ children }) {
  return <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.parchment },
  heroWrap: { height: 270 },
  heroTopBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingTop: SPACING.sm },
  iconBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 9 },
  heroCaption: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SPACING.xl, paddingBottom: SPACING.lg, gap: 4 },
  heroChip: { backgroundColor: 'rgba(253,250,243,0.9)' },
  placeName: { fontSize: 26, color: C.white, fontFamily: F.serif, marginTop: 4 },
  placeLocRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  placeLoc: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontFamily: F.sans },
  body: { flex: 1 },
  bodyContent: { padding: SPACING.xl, gap: SPACING.lg, paddingBottom: SPACING.xxl * 2 },
  sectionLabel: { fontSize: 10, color: C.brown, letterSpacing: 1.2, fontFamily: F.mono, marginBottom: 8 },
  historicalImg: { borderRadius: 10, height: 150 },
  historicalTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(120,90,50,0.25)' },
  historicalChip: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(253,250,243,0.9)' },
  historicalCredit: { position: 'absolute', bottom: 10, right: 10, fontSize: 10, color: 'rgba(255,255,255,0.85)', fontFamily: F.mono },
  description: { fontSize: 13.5, color: C.inkMid, lineHeight: 22, fontFamily: F.sans },
  primaryBtn: {
    backgroundColor: C.ink, borderRadius: 12, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  primaryBtnText: { fontSize: 14, color: C.cream, fontFamily: F.sansSemi },
  secondaryBtn: { borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  secondaryBtnText: { fontSize: 13, color: C.amber, fontFamily: F.sansMed },
});
