import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function ComparacionScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Comparación Antes/Después</Text>

      {/* Área grande dividida (placeholder del slider visual) */}
      <View style={styles.comparacionArea}>
        <View style={styles.mitad}>
          <Text>ANTES</Text>
        </View>
        <View style={styles.mitad}>
          <Text>DESPUÉS</Text>
        </View>
      </View>

      <Text style={styles.anio}>Año: 1975</Text>

      {/* Selector de otras fotografías históricas (placeholder) */}
      <Text style={styles.subtitulo}>Otras fotografías</Text>
      <View style={styles.selectorContainer}>
        <View style={styles.miniatura}><Text>[ Foto ]</Text></View>
        <View style={styles.miniatura}><Text>[ Foto ]</Text></View>
        <View style={styles.miniatura}><Text>[ Foto ]</Text></View>
      </View>

      <Button
        title="Volver al lugar"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  comparacionArea: { flexDirection: 'row', height: 200, borderWidth: 1, marginBottom: 8 },
  mitad: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1 },
  anio: { marginBottom: 16 },
  subtitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  selectorContainer: { flexDirection: 'row', marginBottom: 16 },
  miniatura: { width: 60, height: 60, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
});