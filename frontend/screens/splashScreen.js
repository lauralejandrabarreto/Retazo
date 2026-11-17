import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { C, F, SPACING, RADIUS } from '../theme';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';

// Pantalla de carga inicial. Se muestra al abrir la app y avisa con `onFinish`
// cuando termina la animación, para que App.js pase a la navegación principal.

const BAR_WIDTH = 128;
const MIN_DURATION_MS = 2200;

export default function SplashScreen({ onFinish, duration = MIN_DURATION_MS }) {
  const progress = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false, // se anima el ancho, que no admite el driver nativo
    });
    animation.start(({ finished }) => {
      if (finished) onFinish?.();
    });

    return () => animation.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: [0, BAR_WIDTH] });

  return (
    <SafeAreaView style={styles.container} accessibilityLabel="Retazo, cargando">
      <FocusAwareStatusBar style="dark" />

      <Animated.View style={[styles.center, { opacity: fade }]}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="bank-outline" size={44} color={C.amber} />
        </View>
        <Text style={styles.title}>Retazo</Text>
        <Text style={styles.tagline}>Descubre la historia de cada lugar.</Text>
      </Animated.View>

      <View style={styles.footer} accessibilityLiveRegion="polite">
        <View style={styles.track}>
          <Animated.View style={[styles.fill, { width: barWidth }]} />
        </View>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.parchment, justifyContent: 'center', alignItems: 'center' },
  center: { alignItems: 'center', paddingHorizontal: SPACING.xl },
  iconBox: {
    width: 72, height: 72, borderRadius: RADIUS.xl + 2,
    backgroundColor: C.sepia, borderWidth: 1.5, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },
  title: { fontSize: 52, color: C.ink, fontFamily: F.serifItalic, marginBottom: SPACING.md },
  tagline: { fontSize: 14, color: C.brown, fontFamily: F.sans, textAlign: 'center' },
  footer: { position: 'absolute', bottom: SPACING.xxl * 2, alignItems: 'center', gap: SPACING.md },
  track: { width: BAR_WIDTH, height: 4, borderRadius: 2, backgroundColor: C.sepia, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2, backgroundColor: C.amber },
  loadingText: { fontSize: 11, color: C.brown, fontFamily: F.mono, letterSpacing: 0.5 },
});