import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, F, SPACING } from '../theme';
import PlaceCard from '../components/PlaceCard';
import Toast, { useToast } from '../components/Toast';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { LoadingState, EmptyState, ErrorState } from '../components/StateMessage';
import { useFavorites } from '../context/FavoritesContext';
import { pluralize } from '../utils/text';

// P-06 Favoritos: lugares guardados por el usuario. Se guardan en el servidor
// (/api/favoritos), por eso requieren sesión y se conservan entre dispositivos.
export default function FavoritosScreen({ navigation }) {
  const { favorites, ready, error, isAuthenticated, removeFavorite, refresh } = useFavorites();
  const toast = useToast();

  const onRemove = async (place) => {
    try {
      await removeFavorite(place.id);
      toast.show(`${place.nombre} se eliminó de Favoritos`, 'trash-2');
    } catch {
      toast.show('No se pudo quitar el favorito. Intenta de nuevo.', 'alert-circle');
    }
  };

  const showList = isAuthenticated && ready && !error;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FocusAwareStatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Favoritos</Text>
        {showList && (
          <Text style={styles.subtitle}>{pluralize(favorites.length, 'lugar en tu colección', 'lugares en tu colección')}</Text>
        )}
      </View>

      {!isAuthenticated && (
        <EmptyState
          icon="lock"
          title="Inicia sesión para ver tus favoritos"
          message="Tus lugares guardados se asocian a tu cuenta y se conservan en cualquier dispositivo."
        />
      )}
      {isAuthenticated && !ready && <LoadingState label="Cargando favoritos…" />}
      {isAuthenticated && ready && error && <ErrorState onRetry={refresh} />}
      {showList && (
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