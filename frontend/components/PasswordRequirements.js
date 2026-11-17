import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, F, RADIUS, SPACING } from '../theme';
import { getPasswordChecks } from '../utils/validation';

// Lista de requisitos de contraseña que se actualiza mientras el usuario escribe.
// `showErrors` marca en rojo los requisitos pendientes (después de salir del campo).
export default function PasswordRequirements({ password, showErrors = false, style }) {
  const checks = getPasswordChecks(password);
  const allMet = checks.every((c) => c.met);

  return (
    <View
      style={[styles.box, style]}
      accessible
      accessibilityLiveRegion="polite"
      accessibilityLabel={
        allMet
          ? 'La contraseña cumple todos los requisitos'
          : `Requisitos pendientes: ${checks.filter((c) => !c.met).map((c) => c.label).join(', ')}`
      }
    >
      <Text style={styles.heading}>LA CONTRASEÑA DEBE TENER</Text>
      {checks.map(({ id, label, met }) => {
        const pending = !met && showErrors;
        const color = met ? C.amber : pending ? C.error : C.brown;
        return (
          <View key={id} style={styles.row}>
            <Feather name={met ? 'check-circle' : 'circle'} size={14} color={color} />
            <Text style={[styles.text, { color }, met && styles.textMet]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: C.cream, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, gap: 6, marginTop: SPACING.sm,
  },
  heading: { fontSize: 10, color: C.brown, letterSpacing: 1.2, fontFamily: F.mono, marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  text: { flex: 1, fontSize: 12.5, fontFamily: F.sans },
  textMet: { fontFamily: F.sansMed },
});