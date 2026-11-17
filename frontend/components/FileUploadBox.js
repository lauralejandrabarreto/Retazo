import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, F, RADIUS, SPACING } from '../theme';
import { formatFileSize } from '../utils/files';

// Zona para adjuntar un archivo: estado vacío, archivo seleccionado y error.
export default function FileUploadBox({ file, error, hint, onPick, onRemove, disabled = false }) {
  return (
    <View>
      {file ? (
        <View style={styles.box}>
          <View style={styles.fileRow}>
            <View style={styles.fileIcon}>
              <Feather name="file-text" size={18} color={C.amber} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
              {file.size != null && <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>}
            </View>
            <TouchableOpacity
              onPress={onRemove}
              disabled={disabled}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={`Quitar ${file.name}`}
            >
              <Feather name="x" size={20} color={C.brown} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.box, styles.emptyBox, !!error && styles.boxError]}
          onPress={onPick}
          disabled={disabled}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Adjuntar documento"
        >
          <View style={styles.pickRow}>
            <Feather name="paperclip" size={20} color={C.amber} />
            <Text style={styles.pickText}>Adjuntar documento</Text>
          </View>
          <Text style={styles.hint}>{hint}</Text>
        </TouchableOpacity>
      )}

      {!!error && (
        <View style={styles.error} accessibilityLiveRegion="polite">
          <Feather name="alert-circle" size={12} color={C.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  box: {
    backgroundColor: C.cream, borderWidth: 1.5, borderColor: C.border, borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xl,
  },
  emptyBox: { alignItems: 'center', gap: SPACING.sm, minHeight: 88, justifyContent: 'center' },
  boxError: { borderColor: C.error, backgroundColor: C.errorSoft },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  pickText: { fontSize: 16, color: C.amber, fontFamily: F.sansSemi },
  hint: { fontSize: 11.5, color: C.brown, fontFamily: F.mono, textAlign: 'center' },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  fileIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: C.sepia,
    alignItems: 'center', justifyContent: 'center',
  },
  fileName: { fontSize: 14, color: C.ink, fontFamily: F.sansSemi },
  fileSize: { fontSize: 11.5, color: C.brown, fontFamily: F.mono, marginTop: 2 },
  error: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, marginLeft: 4 },
  errorText: { flex: 1, fontSize: 12, color: C.error, fontFamily: F.sans },
});