import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function BuscarScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Buscar lugar</Text>

      {/* Barra de búsqueda (placeholder) */}
      <View style={styles.barraBusqueda}>
        <Text>Buscar por nombre o dirección...</Text>
      </View>

      {/* Chips de filtro por periodo (placeholder) */}
      <View style={styles.chipsContainer}>
        <View style={styles.chip}><Text>1950s</Text></View>
        <View style={styles.chip}><Text>1970s</Text></View>
        <View style={styles.chip}><Text>1990s</Text></View>
      </View>

      {/* Lista de resultados (placeholder) */}
      <Text style={styles.subtitulo}>Resultados</Text>
      <View style={styles.resultado}>
        <Text>[ Thumbnail ]</Text>
        <Text>Nombre del lugar — Ubicación — Año</Text>
        <Button
          title="Ver lugar"
          onPress={() => navigation.navigate('LugarHistorico')}
        />
      </View>
      <View style={styles.resultado}>
        <Text>[ Thumbnail ]</Text>
        <Text>Nombre del lugar — Ubicación — Año</Text>
        <Button
          title="Ver lugar"
          onPress={() => navigation.navigate('LugarHistorico')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  barraBusqueda: { borderWidth: 1, padding: 8, marginBottom: 8 },
  chipsContainer: { flexDirection: 'row', marginBottom: 8 },
  chip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4, marginRight: 8 },
  subtitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  resultado: { borderWidth: 1, padding: 8, marginBottom: 8 },
});