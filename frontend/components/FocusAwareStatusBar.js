import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';

// Cambia el color de la barra de estado solo en la pantalla visible
// (las pestañas permanecen montadas aunque no estén activas).
export default function FocusAwareStatusBar({ style = 'dark' }) {
  const isFocused = useIsFocused();
  return isFocused ? <StatusBar style={style} /> : null;
}
