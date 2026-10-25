import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder } from 'react-native';
import { C, F } from '../theme';
import PlaceImage from './PlaceImage';

// Comparador antes/después con divisor deslizable.
// Todas las capas internas tienen pointerEvents="none" para que el toque siempre
// lo reciba el contenedor; así locationX es relativo al contenedor y el divisor
// no "salta" cuando se arrastra desde la manija.
export default function BeforeAfterSlider({ beforeUri, afterUri, beforeLabel, afterLabel, height = 300, onChange }) {
  const [pct, setPct] = useState(50);
  const width = useRef(1);
  const startX = useRef(0);

  const update = (x) => {
    const next = Math.min(Math.max((x / width.current) * 100, 3), 97);
    setPct(next);
    onChange?.(next);
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        startX.current = evt.nativeEvent.locationX;
        update(startX.current);
      },
      onPanResponderMove: (_evt, gesture) => update(startX.current + gesture.dx),
    }),
  ).current;

  const step = (delta) => update(((pct + delta) / 100) * width.current);

  return (
    <View
      style={[styles.area, { height }]}
      onLayout={(e) => { width.current = e.nativeEvent.layout.width || 1; }}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Divisor de comparación antes y después"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 10 : -10)}
      testID="before-after-slider"
      {...pan.panHandlers}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <PlaceImage uri={afterUri} style={StyleSheet.absoluteFill} label="Fotografía actual no disponible" />
      </View>

      <View style={[styles.beforeClip, { width: `${pct}%` }]} pointerEvents="none">
        <View style={[styles.beforeInner, { width: width.current }]}>
          <PlaceImage uri={beforeUri} style={StyleSheet.absoluteFill} label="Fotografía histórica pendiente de carga">
            {!!beforeUri && <View style={styles.sepiaTint} />}
          </PlaceImage>
        </View>
      </View>

      <View style={[styles.tag, styles.tagLeft]} pointerEvents="none">
        <Text style={styles.tagTextLight}>{beforeLabel}</Text>
      </View>
      <View style={[styles.tag, styles.tagRight]} pointerEvents="none">
        <Text style={styles.tagTextDark}>{afterLabel}</Text>
      </View>

      <View style={[styles.line, { left: `${pct}%` }]} pointerEvents="none" testID="slider-divider">
        <View style={styles.handle}>
          <View style={styles.handleBar} />
          <View style={styles.handleBar} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  area: { position: 'relative', overflow: 'hidden', backgroundColor: C.inkMid },
  beforeClip: { position: 'absolute', top: 0, bottom: 0, left: 0, overflow: 'hidden' },
  beforeInner: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  sepiaTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(90,70,40,0.3)' },
  tag: { position: 'absolute', top: 12, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 4 },
  tagLeft: { left: 14, backgroundColor: C.ink },
  tagRight: { right: 14, backgroundColor: 'rgba(253,250,243,0.92)' },
  tagTextLight: { fontSize: 10, color: C.cream, letterSpacing: 1, fontFamily: F.mono },
  tagTextDark: { fontSize: 10, color: C.ink, letterSpacing: 1, fontFamily: F.mono },
  line: { position: 'absolute', top: 0, bottom: 0, width: 2, marginLeft: -1, backgroundColor: C.white },
  handle: {
    position: 'absolute', top: '50%', left: -15, marginTop: -16,
    width: 32, height: 32, borderRadius: 16, backgroundColor: C.white,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3,
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 4,
  },
  handleBar: { width: 2, height: 12, backgroundColor: C.brown, borderRadius: 1 },
});
