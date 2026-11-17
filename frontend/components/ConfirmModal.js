import React from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { C, F, RADIUS, SPACING } from '../theme';

// Modal de confirmación con dos opciones (por defecto "Sí" y "No").
// Tocar fuera del cuadro o el botón de regreso del sistema equivale a cancelar.
export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Sí',
  cancelLabel = 'No',
  onConfirm,
  onCancel,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <Pressable style={styles.overlay} onPress={onCancel} accessibilityLabel="Cerrar">
        <Pressable style={styles.card} accessibilityViewIsModal accessibilityRole="alert" onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={onCancel}
              accessibilityRole="button"
            >
              <Text style={styles.btnSecondaryText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={onConfirm}
              accessibilityRole="button"
            >
              <Text style={styles.btnPrimaryText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: C.overlay, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  card: {
    width: '100%', maxWidth: 380, backgroundColor: C.cream, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: C.border, padding: SPACING.xl, gap: SPACING.md,
  },
  title: { fontSize: 19, lineHeight: 26, color: C.ink, fontFamily: F.serifSemi, textAlign: 'center' },
  message: { fontSize: 13, lineHeight: 20, color: C.brown, fontFamily: F.sans, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
  btn: { flex: 1, minHeight: 50, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: C.ink },
  btnPrimaryText: { fontSize: 15, color: C.cream, fontFamily: F.sansSemi },
  btnSecondary: { borderWidth: 1.5, borderColor: C.border, backgroundColor: C.parchment },
  btnSecondaryText: { fontSize: 15, color: C.ink, fontFamily: F.sansMed },
});