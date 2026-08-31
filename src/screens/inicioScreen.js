import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function InicioScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Logo / nombre de la app */}
      <Text style={styles.logo}>Retazo</Text>

      {/* Indicador de ubicación (placeholder) */}
      <Text style={styles.ubicacion}> Ubicación actual: Bogotá</Text>

      {/* Barra de búsqueda (placeholder, aún sin funcionalidad real) */}
      <View style={styles.barraBusqueda}>
        <Text>Buscar un lugar...</Text>
      </View>

      {/* Placeholder del mapa */}
      <View style={styles.mapaPlaceholder}>
        <Text>[ Mapa aquí ]</Text>
      </View>

      {/* Tarjetas de lugares cercanos (placeholder) */}
      <Text style={styles.subtitulo}>Lugares cercanos</Text>
      <View style={styles.tarjeta}>
        <Text>[ Thumbnail ]</Text>
        <Text>Nombre del lugar</Text>
      </View>
      <View style={styles.tarjeta}>
        <Text>[ Thumbnail ]</Text>
        <Text>Nombre del lugar</Text>
      </View>

      {/* Navegación básica */}
      <Button title="Buscar" onPress={() => navigation.navigate('Buscar')} />
      <Button title="Favoritos" onPress={() => navigation.navigate('Favoritos')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  logo: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  ubicacion: { marginBottom: 8 },
  barraBusqueda: { borderWidth: 1, padding: 8, marginBottom: 8 },
  mapaPlaceholder: { height: 150, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  subtitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  tarjeta: { borderWidth: 1, padding: 8, marginBottom: 8 },
});