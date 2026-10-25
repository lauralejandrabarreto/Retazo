import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, F, SPACING } from '../theme';
import PlaceCard from '../components/PlaceCard';
import NoticeBox from '../components/NoticeBox';
import Toast, { useToast } from '../components/Toast';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { LoadingState, EmptyState, ErrorState } from '../components/StateMessage';
import { useFavorites } from '../context/FavoritesContext';
import { getPlaces } from '../services/placesService';
import { pluralize } from '../utils/text';
import useAsync from '../hooks/useAsync';

// P-06 Favoritos: lugares guardados por el usuario (persisten en el dispositivo).
export default function FavoritosScreen({ navigation }) {
  const { favoriteIds, ready, storageError, removeFavorite } = useFavorites();
  const { data: places, loading, error, retry } = useAsync(() => getPlaces(), []);
  const toast = useToast();

  // Se respeta el orden de guardado (el más reciente primero).
  const favorites = useMemo(() => {
    if (!places) return [];
    return favoriteIds.map((id) => places.find((p) => p.id === id)).filter(Boolean);
  }, [favoriteIds, places]);

  const onRemove = (place) => {
    removeFavorite(place.id);
    toast.show(`${place.nombre} se eliminó de Favoritos`, 'trash-2');
  };

  const isLoading = loading || !ready;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FocusAwareStatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Favoritos</Text>
        {!isLoading && (
          <Text style={styles.subtitle}>{pluralize(favorites.length, 'lugar en tu colección', 'lugares en tu colección')}</Text>
        )}
      </View>

      {!!storageError && (
        <NoticeBox icon="alert-triangle" style={{ marginHorizontal: SPACING.xl, marginBottom: SPACING.md }}>
          No fue posible acceder al almacenamiento local. Los cambios podrían no conservarse al cerrar la app.
        </NoticeBox>
      )}

      {isLoading && <LoadingState label="Cargando favoritos…" />}
      {!isLoading && error && <ErrorState onRetry={retry} />}
      {!isLoading && !error && (
        <FlatList
          data={favorites}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxl * 2, flexGrow: 1 }}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
          renderItem={({ item }) => (
            <PlaceCard
              place={item}
              variant="favorite"
              onPress={() => navigation.navigate('LugarHistorico', { placeId: item.id })}
              onRemove={() => onRemove(item)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="heart"
              title="Aún no tienes favoritos"
              message="Toca el corazón en la ficha de un lugar histórico para guardarlo aquí."
              actionLabel="Explorar lugares"
              onAction={() => navigation.navigate('Buscar')}
            />
          }
        />
      )}

      <Toast message={toast.message} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.parchment },
  header: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.sm, paddingBottom: SPACING.lg },
  title: { fontSize: 24, color: C.ink, fontFamily: F.serif },
  subtitle: { fontSize: 12, color: C.brown, marginTop: 2, fontFamily: F.sans },
});
