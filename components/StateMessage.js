import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, F, RADIUS, SPACING } from '../theme';

// Mensajes de estado reutilizables: carga, vacío y error.
export function LoadingState({ label = 'Cargando…' }) {
  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <ActivityIndicator color={C.amber} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

export function EmptyState({ icon = 'inbox', title, message, actionLabel, onAction }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Feather name={icon} size={22} color={C.amber} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {!!message && <Text style={styles.text}>{message}</Text>}
      {!!actionLabel && (
        <TouchableOpacity style={styles.button} onPress={onAction} accessibilityRole="button">
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function ErrorState({ message = 'No fue posible cargar la información.', onRetry }) {
  return (
    <EmptyState icon="alert-triangle" title="Algo salió mal" message={message} actionLabel={onRetry ? 'Reintentar' : undefined} onAction={onRetry} />
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.xxl * 1.5, paddingHorizontal: SPACING.xl, gap: SPACING.sm },
  iconCircle: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: C.amberSoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xs,
  },
  title: { fontSize: 17, color: C.ink, fontFamily: F.serifSemi, textAlign: 'center' },
  text: { fontSize: 13, color: C.brown, fontFamily: F.sans, textAlign: 'center', lineHeight: 20 },
  button: {
    marginTop: SPACING.sm, backgroundColor: C.ink, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
  },
  buttonText: { color: C.cream, fontFamily: F.sansSemi, fontSize: 13 },
});
