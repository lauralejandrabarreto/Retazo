import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, F, RADIUS, SPACING } from '../theme';

// Tarjeta de selección única (tipo radio) con ícono, título y marca de selección.
// Se usa dentro de un contenedor con accessibilityRole="radiogroup".
export default function OptionCard({ icon, title, selected = false, onPress, style }) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected, style]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, selected }}
      accessibilityLabel={title}
    >
      <View style={[styles.iconCircle, selected && styles.iconCircleSelected]}>
        <Feather name={icon} size={18} color={C.amber} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.lg,
    backgroundColor: C.cream, borderWidth: 1.5, borderColor: C.border, borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xl, minHeight: 76,
  },
  cardSelected: { backgroundColor: C.sepia, borderColor: C.amber },
  iconCircle: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: C.sepia,
    alignItems: 'center', justifyContent: 'center',
  },
  iconCircleSelected: { backgroundColor: C.border },
  title: { flex: 1, fontSize: 15, color: C.ink, fontFamily: F.sansSemi },
  radio: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: C.border,
    backgroundColor: C.cream, alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: C.amber },
  radioDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: C.amber },
});