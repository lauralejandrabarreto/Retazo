import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, F } from '../theme';

// Recuadro informativo con ícono (avisos sobre el contenido, instrucciones).
export default function NoticeBox({ icon = 'info', children, tone = 'amber', style }) {
  const neutral = tone === 'neutral';
  return (
    <View style={[styles.box, neutral && styles.boxNeutral, style]}>
      <Feather name={icon} size={14} color={neutral ? C.brown : C.amber} style={styles.icon} />
      <Text style={[styles.text, neutral && styles.textNeutral]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: C.amberSoft, borderWidth: 1, borderColor: C.amberBorder,
    borderRadius: 10, padding: 12,
  },
  boxNeutral: { backgroundColor: C.cream, borderColor: C.border },
  icon: { marginTop: 1 },
  text: { flex: 1, fontSize: 11.5, color: C.amber, lineHeight: 17, fontFamily: F.sansMed },
  textNeutral: { color: C.brown, fontFamily: F.sans },
});
