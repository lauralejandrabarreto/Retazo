import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, F, RADIUS } from '../theme';

// Mensaje de confirmación breve que aparece en la parte inferior y se oculta solo.
export function useToast(duration = 2200) {
  const [message, setMessage] = useState(null);
  const timer = useRef(null);

  const show = useCallback(
    (text, icon = 'check') => {
      clearTimeout(timer.current);
      setMessage({ text, icon, key: Date.now() });
      timer.current = setTimeout(() => setMessage(null), duration);
    },
    [duration],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return { message, show };
}

export default function Toast({ message }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: message ? 1 : 0, duration: 180, useNativeDriver: false }).start();
  }, [message, opacity]);

  if (!message) return null;

  return (
    <Animated.View style={[styles.toast, { opacity }]} accessibilityLiveRegion="polite" pointerEvents="none">
      <Feather name={message.icon} size={15} color={C.amberLt} />
      <Text style={styles.text}>{message.text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute', left: 20, right: 20, bottom: 24,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.ink, borderRadius: RADIUS.lg,
    paddingHorizontal: 16, paddingVertical: 12,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  text: { flex: 1, color: C.cream, fontSize: 13, fontFamily: F.sansMed },
});
