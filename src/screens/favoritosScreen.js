import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function FavoritosScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Favoritos</Text>

      {/* Lista de lugares guardados (placeholder) */}
      <View style={styles.tarjeta}>
        <Text>[ Thumbnail ]</Text>
        <Text>Nombre del lugar</Text>
        <Text>Ubicación</Text>
        <Text>Periodo</Text>
        <Button
          title="Ver lugar"
          onPress={() => navigation.navigate('LugarHistorico')}
        />
      </View>

      <View style={styles.tarjeta}>
        <Text>[ Thumbnail ]</Text>
        <Text>Nombre del lugar</Text>
        <Text>Ubicación</Text>
        <Text>Periodo</Text>
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
  tarjeta: { borderWidth: 1, padding: 8, marginBottom: 8 },
});