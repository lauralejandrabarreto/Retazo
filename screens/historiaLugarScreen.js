import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HistoriaLugarScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Historia del lugar</Text>

      {/* Badge de fuentes verificadas (representa la capa RAG sin parecer chatbot) */}
      <View style={styles.badge}>
        <Text style={styles.badgeTexto}>✔ Fuentes verificadas</Text>
      </View>

      {/* Sección de narrativa */}
      <Text style={styles.subtitulo}>Narrativa</Text>
      <Text style={styles.narrativa}>
        Texto contextual sobre la historia del lugar irá aquí.
      </Text>

      {/* Referencias documentadas */}
      <Text style={styles.subtitulo}>Referencias</Text>
      <View style={styles.referencia}>
        <Text>Nombre de la fuente / documento</Text>
      </View>
      <View style={styles.referencia}>
        <Text>Nombre de la fuente / documento</Text>
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
  badge: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 16 },
  badgeTexto: { fontSize: 12 },
  subtitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  narrativa: { marginBottom: 16 },
  referencia: { borderWidth: 1, padding: 8, marginBottom: 8 },
});