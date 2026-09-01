import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function LugarHistoricoScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Foto histórica (placeholder cruzado) */}
      <View style={styles.fotoPlaceholder}>
        <Text>[ Foto histórica ]</Text>
      </View>

      <Text style={styles.nombre}>Nombre del lugar</Text>
      <Text style={styles.ubicacion}>Ubicación</Text>
      <Text style={styles.descripcion}>
        Descripción breve del lugar y su contexto histórico.
      </Text>

      {/* Botón primario */}
      <Button
        title="Comparar pasado y presente"
        onPress={() => navigation.navigate('Comparacion')}
      />

      {/* Acceso a la narrativa/historia del lugar */}
      <Button
        title="Ver historia del lugar"
        onPress={() => navigation.navigate('HistoriaLugar')}
      />

      {/* Opción guardar */}
      <Button title="Guardar en favoritos" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  fotoPlaceholder: { height: 200, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  nombre: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  ubicacion: { marginBottom: 8 },
  descripcion: { marginBottom: 16 },
});