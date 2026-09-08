import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, F } from '../theme';

export default function Divider({ label }) {
  if (!label) return <View style={styles.plain} />;
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  plain: { height: 1, backgroundColor: C.border, marginVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  line: { flex: 1, height: 1, backgroundColor: C.border },
  label: { fontSize: 9, color: C.brown, letterSpacing: 1.2, fontFamily: F.mono, marginHorizontal: 10 },
});
