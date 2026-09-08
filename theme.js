// theme.js
// Design tokens for "Retazo" — memoria urbana app
// Fonts assume you've loaded Playfair Display, DM Mono and Inter via
// @expo-google-fonts (see App.js for the useFonts() setup + install notes
// at the bottom of this file).

export const C = {
  parchment: '#F3EDE0',
  cream: '#FDFAF3',
  ink: '#1C1208',
  inkMid: '#3D2C18',
  brown: '#7A6650',
  amber: '#9B6D28',
  amberLt: '#C8A256',
  border: '#DDD0B8',
  sepia: '#E6D9C2',
  white: '#FFFFFF',
  amberSoft: 'rgba(155,109,40,0.12)',
  amberBorder: 'rgba(155,109,40,0.3)',
  overlay: 'rgba(28,18,8,0.55)',
  overlayHeavy: 'rgba(28,18,8,0.72)',
};

export const F = {
  serif: 'PlayfairDisplay_700Bold',
  serifItalic: 'PlayfairDisplay_700Bold_Italic',
  serifSemi: 'PlayfairDisplay_600SemiBold',
  mono: 'DMMono_500Medium',
  sans: 'Inter_400Regular',
  sansMed: 'Inter_500Medium',
  sansSemi: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const RADIUS = {
  sm: 4,
  md: 10,
  lg: 12,
  xl: 16,
  pill: 20,
};

/*
─────────────────────────────────────────────────────────────────────────────
SETUP NOTES

1) Install:
   npx expo install expo-linear-gradient @expo/vector-icons expo-font
   npx expo install @expo-google-fonts/playfair-display @expo-google-fonts/dm-mono @expo-google-fonts/inter
   npx expo install expo-splash-screen react-native-safe-area-context

2) In App.js, load the fonts with useFonts() before rendering the
   NavigationContainer (see the updated app.js in this delivery — it already
   wires this up and keeps the splash screen visible until fonts are ready).

3) If you'd rather not deal with custom fonts right now, just replace the
   fontFamily values above with undefined / delete them — everything else
   (colors, spacing, layout) still works with system fonts.
─────────────────────────────────────────────────────────────────────────────
*/
