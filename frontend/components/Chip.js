import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, F } from '../theme';

export default function Chip({ label, amber = false, style }) {
  return (
    <View style={[styles.chip, amber && styles.chipAmber, style]}>
      <Text style={[styles.text, amber && styles.textAmber]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: C.sepia,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipAmber: {
    backgroundColor: C.amberSoft,
    borderColor: C.amberBorder,
  },
  text: {
    fontSize: 10,
    fontFamily: F.mono,
    color: C.brown,
  },
  textAmber: {
    color: C.amber,
  },
});
