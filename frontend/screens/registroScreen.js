import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C, F, SPACING, RADIUS } from '../theme';
import OptionCard from '../components/OptionCard';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';

// Registro, paso 1: el usuario elige qué hará en Retazo. La elección se pasará
// al siguiente paso del registro (datos de la cuenta) como parámetro `perfil`.

const PROFILES = [
  { id: 'usuario', icon: 'compass', title: 'Quiero explorar lugares históricos' },
  { id: 'organizacion', icon: 'edit-3', title: 'Quiero aportar a Retazo' },
];

export default function RegistroScreen({ navigation }) {
  const [profile, setProfile] = useState(PROFILES[0].id);
  const goBack = () => navigation.goBack();

  const goToLogin = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.replace('Login');
  };

  // "Explorar" crea una cuenta personal; "Aportar" registra un ente organizacional.
  const onContinue = () => {
    if (profile === 'organizacion') navigation.navigate('RegistroOrganizacion');
    else navigation.navigate('RegistroUsuario', { perfil: profile });
  };

  return (
    <SafeAreaView style={styles.container}>
      <FocusAwareStatusBar style="dark" />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={goBack}
            hitSlop={12}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Volver"
          >
            <Feather name="arrow-left" size={24} color={C.ink} />
          </TouchableOpacity>
          <Text style={styles.kicker}>Registro</Text>
        </View>

        <Text style={styles.title}>Únete a Retazo</Text>
        <Text style={styles.subtitle}>Explora la historia y guarda tus lugares favoritos.</Text>

        <Text style={styles.question}>¿Qué harás en Retazo?</Text>
        <View style={styles.options} accessibilityRole="radiogroup">
          {PROFILES.map((item) => (
            <OptionCard
              key={item.id}
              icon={item.icon}
              title={item.title}
              selected={profile === item.id}
              onPress={() => setProfile(item.id)}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={onContinue} activeOpacity={0.85} accessibilityRole="button">
          <Text style={styles.primaryBtnText}>Continuar</Text>
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={goToLogin} accessibilityRole="button">
            <Text style={styles.link}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: C.parchment },
  content: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: SPACING.xxl },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg },
  backBtn: { padding: 2 },
  kicker: { fontSize: 15, color: C.brown, fontFamily: F.sansMed },
  title: { fontSize: 32, color: C.ink, fontFamily: F.serifSemi, marginTop: SPACING.xxl },
  subtitle: { fontSize: 14, color: C.brown, fontFamily: F.sans, lineHeight: 22, marginTop: SPACING.sm },
  question: { fontSize: 14, color: C.brown, fontFamily: F.sansMed, marginTop: SPACING.xxl, marginBottom: SPACING.md },
  options: { gap: SPACING.md },
  primaryBtn: {
    backgroundColor: C.ink, borderRadius: RADIUS.xl, minHeight: 56,
    alignItems: 'center', justifyContent: 'center', marginTop: SPACING.xxl,
  },
  primaryBtnText: { fontSize: 16, color: C.cream, fontFamily: F.sansMed },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', paddingTop: SPACING.xl },
  loginText: { fontSize: 14, color: C.brown, fontFamily: F.sans },
  link: { fontSize: 14, color: C.amber, fontFamily: F.sansSemi, textDecorationLine: 'underline' },
});