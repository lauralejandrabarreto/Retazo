import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C, F, SPACING, RADIUS } from '../theme';
import Chip from '../components/Chip';
import Divider from '../components/Divider';
import ConfirmModal from '../components/ConfirmModal';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { useAuth } from '../context/AuthContext';

// Perfil: muestra el correo de la sesión y permite cerrar sesión. Al cerrar,
// primero se pide confirmación en un modal; si el usuario acepta, se limpia la
// sesión y se reinicia la navegación en Login (sin posibilidad de volver atrás).
// Sin sesión (invitado) se ofrece iniciar sesión.

const ROLE_LABELS = { usuario: 'Usuario', organizacion: 'Ente organizacional' };

export default function PerfilScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const goToLogin = () => {
    // El navegador padre es la pila principal (las pestañas viven dentro de ella).
    const root = navigation.getParent() ?? navigation;
    root.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const onConfirmSignOut = () => {
    setConfirmVisible(false);
    goToLogin();
    signOut();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FocusAwareStatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Feather name="user" size={26} color={C.amber} />
          </View>

          {user ? (
            <View style={styles.cardInfo}>
              {!!user.nombre && <Text style={styles.name} numberOfLines={2}>{user.nombre}</Text>}
              <Text style={styles.sectionLabel}>CORREO ELECTRÓNICO</Text>
              <Text style={styles.email} numberOfLines={1} selectable>{user.email}</Text>
              <Chip label={ROLE_LABELS[user.rol] ?? 'Usuario'} amber style={styles.roleChip} />
            </View>
          ) : (
            <View style={styles.cardInfo}>
              <Text style={styles.name}>Invitado</Text>
              <Text style={styles.guestText}>
                Estás navegando sin cuenta. Inicia sesión para ver tu información aquí.
              </Text>
            </View>
          )}
        </View>

        <Divider />

        {user ? (
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => setConfirmVisible(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <Feather name="log-out" size={18} color={C.amber} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryBtn} onPress={goToLogin} activeOpacity={0.85} accessibilityRole="button">
            <Text style={styles.primaryBtnText}>Iniciar sesión</Text>
          </TouchableOpacity>
        )}
      </View>

      <ConfirmModal
        visible={confirmVisible}
        title="¿Estás seguro que quieres cerrar sesión?"
        confirmLabel="Sí"
        cancelLabel="No"
        onConfirm={onConfirmSignOut}
        onCancel={() => setConfirmVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.parchment },
  header: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.sm, paddingBottom: SPACING.lg },
  title: { fontSize: 24, color: C.ink, fontFamily: F.serif },
  body: { paddingHorizontal: SPACING.xl, gap: SPACING.lg },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.lg,
    backgroundColor: C.cream, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.xl,
    padding: SPACING.xl,
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: C.sepia,
    alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 4 },
  name: { fontSize: 17, color: C.ink, fontFamily: F.serifSemi },
  sectionLabel: { fontSize: 10, color: C.brown, letterSpacing: 1.2, fontFamily: F.mono, marginTop: 4 },
  email: { fontSize: 14, color: C.inkMid, fontFamily: F.sans },
  roleChip: { marginTop: 6 },
  guestText: { fontSize: 13, color: C.brown, fontFamily: F.sans, lineHeight: 20 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    borderWidth: 1.5, borderColor: C.border, borderRadius: RADIUS.xl, minHeight: 56,
    backgroundColor: C.cream,
  },
  logoutText: { fontSize: 15, color: C.amber, fontFamily: F.sansSemi },
  primaryBtn: {
    backgroundColor: C.ink, borderRadius: RADIUS.xl, minHeight: 56,
    alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnText: { fontSize: 16, color: C.cream, fontFamily: F.sansMed },
});