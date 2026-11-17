import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C, F, SPACING, RADIUS } from '../theme';
import Divider from '../components/Divider';
import PlaceCard from '../components/PlaceCard';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { LoadingState, EmptyState, ErrorState } from '../components/StateMessage';
import { getPlaces, filterPlaces } from '../services/placesService';
import { PERIODS } from '../data/places';
import { pluralize } from '../utils/text';
import useAsync from '../hooks/useAsync';

// P-02 Buscar: búsqueda por nombre, sector o ciudad (sin distinguir tildes ni
// mayúsculas) y filtro por periodo. Ambos se combinan sobre los datos locales.
export default function BuscarScreen({ navigation, route }) {
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState('todos');
  const inputRef = useRef(null);
  const { data: places, loading, error, retry } = useAsync(() => getPlaces(), []);

  // Si se llega desde la barra de búsqueda de Inicio, se enfoca el campo.
  const focusSearch = route?.params?.focusSearch;
  useEffect(() => {
    if (focusSearch) setTimeout(() => inputRef.current?.focus(), 150);
  }, [focusSearch]);

  const results = useMemo(() => filterPlaces(places ?? [], { query, period }), [places, query, period]);
  const hasFilters = query.trim() !== '' || period !== 'todos';
  const clearFilters = () => {
    setQuery('');
    setPeriod('todos');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FocusAwareStatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Buscar</Text>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={C.brown} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar lugar histórico…"
            placeholderTextColor={C.brown}
            style={styles.input}
            returnKeyType="search"
            autoCorrect={false}
            maxLength={60}
            accessibilityLabel="Buscar por nombre, sector o ciudad"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Borrar búsqueda">
              <Feather name="x-circle" size={16} color={C.brown} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View>
        <FlatList
          horizontal
          data={PERIODS}
          keyExtractor={(p) => p.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item }) => {
            const active = item.id === period;
            return (
              <TouchableOpacity
                onPress={() => setPeriod(item.id)}
                style={[styles.filterChip, active && styles.filterChipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading && <LoadingState label="Cargando lugares…" />}
      {!loading && error && <ErrorState onRetry={retry} />}
      {!loading && !error && (
        <>
          <View style={{ paddingHorizontal: SPACING.xl }}>
            <Divider label={pluralize(results.length, 'resultado', 'resultados')} />
          </View>
          <FlatList
            data={results}
            keyExtractor={(p) => p.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl, flexGrow: 1 }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <PlaceCard
                place={item}
                variant="row"
                onPress={() => navigation.navigate('LugarHistorico', { placeId: item.id })}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                icon="search"
                title="Sin resultados"
                message={
                  query.trim()
                    ? `No encontramos lugares que coincidan con "${query.trim()}" en el periodo seleccionado.`
                    : 'Todavía no hay lugares registrados para este periodo.'
                }
                actionLabel={hasFilters ? 'Limpiar filtros' : undefined}
                onAction={clearFilters}
              />
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.parchment },
  header: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.sm, paddingBottom: SPACING.md },
  title: { fontSize: 24, color: C.ink, fontFamily: F.serif, marginBottom: 14 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.cream, borderWidth: 1.5, borderColor: C.border,
    borderRadius: RADIUS.lg, paddingHorizontal: 14,
  },
  input: { flex: 1, fontSize: 14, color: C.ink, fontFamily: F.sans, paddingVertical: 12, outlineStyle: 'none' },
  filterRow: { paddingHorizontal: SPACING.xl, gap: 8, paddingBottom: SPACING.md },
  filterChip: { borderRadius: RADIUS.pill, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: C.sepia },
  filterChipActive: { backgroundColor: C.amber },
  filterText: { fontSize: 11, color: C.brown, fontFamily: F.mono },
  filterTextActive: { color: C.white },
  separator: { height: 1, backgroundColor: C.border },
});
