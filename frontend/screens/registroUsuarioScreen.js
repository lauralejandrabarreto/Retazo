import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C, F, SPACING, RADIUS } from '../theme';
import PasswordRequirements from '../components/PasswordRequirements';
import Toast, { useToast } from '../components/Toast';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { register, AUTH_ERRORS } from '../services/authService';
import {
  validateFullName, validateEmail, validateNewPassword, validateConfirmPassword,
  isPasswordStrong, NAME_MAX_LENGTH, EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH,
} from '../utils/validation';

// Registro, paso 2: datos de la cuenta. El botón "Crear cuenta" solo se habilita
// cuando todos los campos son válidos (nombre, correo con formato correcto,
// contraseña que cumple los requisitos, confirmación igual y términos aceptados).
// Los requisitos de la contraseña se evalúan en vivo con PasswordRequirements.
export default function RegistroUsuarioScreen({ navigation, route }) {
  const perfil = route?.params?.perfil ?? 'explorador';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);
  const [formError, setFormError] = useState(null);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);
  const redirectTimer = useRef(null);
  const toast = useToast();

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  const touch = (field) => setTouched((t) => ({ ...t, [field]: true }));

  const nameError = touched.name ? validateFullName(name) : null;
  const emailFormatError = touched.email ? validateEmail(email) : null;
  const emailError = emailFormatError || (emailTaken ? 'Este correo ya está registrado. Inicia sesión.' : null);
  const confirmError = touched.confirm || confirm.length > 0 ? validateConfirmPassword(password, confirm) : null;

  const formValid =
    !validateFullName(name) &&
    !validateEmail(email) &&
    isPasswordStrong(password) &&
    !validateConfirmPassword(password, confirm) &&
    accepted;
  const canSubmit = formValid && !submitting;

  const goToLogin = () => {
    if (navigation.canGoBack()) navigation.popToTop();
    else navigation.replace('Login');
  };

  const onSubmit = async () => {
    if (!canSubmit) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await register({ nombre: name.trim(), email, password, perfil });
      toast.show('¡Cuenta creada! Bienvenido a Retazo', 'check-circle');
      redirectTimer.current = setTimeout(() => {
        navigation.reset({ index: 0, routes: [{ name: 'TabsPrincipales' }] });
      }, 1100);
    } catch (error) {
      setSubmitting(false);
      if (error?.code === AUTH_ERRORS.EMAIL_IN_USE) {
        setEmailTaken(true);
        touch('email');
        emailRef.current?.focus();
      } else {
        setFormError('No fue posible crear la cuenta por un problema de conexión. Inténtalo de nuevo.');
      }
    }
  };

  const comingSoon = (what) => toast.show(`${what} estará disponible próximamente`, 'info');

  return (
    <SafeAreaView style={styles.container}>
      <FocusAwareStatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
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

          {!!formError && (
            <View style={styles.errorBox} accessibilityLiveRegion="assertive">
              <Feather name="wifi-off" size={14} color={C.error} style={styles.errorIcon} />
              <Text style={styles.errorBoxText}>{formError}</Text>
            </View>
          )}

          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            onBlur={() => touch('name')}
            onSubmitEditing={() => emailRef.current?.focus()}
            placeholder="Tu nombre y apellido"
            placeholderTextColor={C.brown}
            style={[styles.input, !!nameError && styles.inputError]}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            maxLength={NAME_MAX_LENGTH}
            editable={!submitting}
            accessibilityLabel="Nombre completo"
          />
          {!!nameError && <FieldError text={nameError} />}

          <Text style={[styles.label, styles.labelSpaced]}>Correo electrónico</Text>
          <TextInput
            ref={emailRef}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailTaken) setEmailTaken(false);
            }}
            onBlur={() => touch('email')}
            onSubmitEditing={() => passwordRef.current?.focus()}
            placeholder="nombre@correo.com"
            placeholderTextColor={C.brown}
            style={[styles.input, !!emailError && styles.inputError]}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            maxLength={EMAIL_MAX_LENGTH}
            editable={!submitting}
            accessibilityLabel="Correo electrónico"
          />
          {!!emailError && <FieldError text={emailError} />}

          <Text style={[styles.label, styles.labelSpaced]}>Contraseña</Text>
          <View style={[styles.input, styles.passwordWrap]}>
            <TextInput
              ref={passwordRef}
              value={password}
              onChangeText={setPassword}
              onBlur={() => touch('password')}
              onSubmitEditing={() => confirmRef.current?.focus()}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor={C.brown}
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              maxLength={PASSWORD_MAX_LENGTH}
              editable={!submitting}
              accessibilityLabel="Contraseña"
            />
            <EyeButton visible={showPassword} onPress={() => setShowPassword((v) => !v)} />
          </View>
          <PasswordRequirements password={password} showErrors={touched.password} />

          <Text style={[styles.label, styles.labelSpaced]}>Confirmar contraseña</Text>
          <View style={[styles.input, styles.passwordWrap, !!confirmError && styles.inputError]}>
            <TextInput
              ref={confirmRef}
              value={confirm}
              onChangeText={setConfirm}
              onBlur={() => touch('confirm')}
              onSubmitEditing={onSubmit}
              placeholder="Repite tu contraseña"
              placeholderTextColor={C.brown}
              style={styles.passwordInput}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              maxLength={PASSWORD_MAX_LENGTH}
              editable={!submitting}
              accessibilityLabel="Confirmar contraseña"
            />
            <EyeButton visible={showConfirm} onPress={() => setShowConfirm((v) => !v)} />
          </View>
          {!!confirmError && <FieldError text={confirmError} />}

          <View style={styles.termsRow}>
            <TouchableOpacity
              onPress={() => setAccepted((v) => !v)}
              hitSlop={10}
              disabled={submitting}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: accepted }}
              accessibilityLabel="Acepto los Términos de uso y la Política de privacidad"
              style={[styles.checkbox, accepted && styles.checkboxChecked]}
            >
              {accepted && <Feather name="check" size={16} color={C.cream} />}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              Acepto los{' '}
              <Text style={styles.link} onPress={() => comingSoon('Los Términos de uso')}>Términos de uso</Text>
              {' '}y la{' '}
              <Text style={styles.link} onPress={() => comingSoon('La Política de privacidad')}>Política de privacidad</Text>.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}
            onPress={onSubmit}
            disabled={!canSubmit}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit, busy: submitting }}
          >
            {submitting ? (
              <ActivityIndicator color={C.cream} />
            ) : (
              <Text style={styles.primaryBtnText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={goToLogin} accessibilityRole="button">
              <Text style={[styles.link, styles.linkBold]}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast message={toast.message} />
    </SafeAreaView>
  );
}

function EyeButton({ visible, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      <Feather name={visible ? 'eye-off' : 'eye'} size={18} color={C.brown} />
    </TouchableOpacity>
  );
}

function FieldError({ text }) {
  return (
    <View style={styles.fieldError} accessibilityLiveRegion="polite">
      <Feather name="alert-circle" size={12} color={C.error} />
      <Text style={styles.fieldErrorText}>{text}</Text>
    </View>
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
  subtitle: { fontSize: 14, color: C.brown, fontFamily: F.sans, lineHeight: 22, marginTop: SPACING.sm, marginBottom: SPACING.xl },
  label: { fontSize: 14, color: C.brown, fontFamily: F.sansMed, marginBottom: SPACING.sm },
  labelSpaced: { marginTop: SPACING.lg },
  input: {
    backgroundColor: C.cream, borderWidth: 1.5, borderColor: C.border, borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.xl, paddingVertical: 16,
    fontSize: 15, color: C.ink, fontFamily: F.sans, outlineStyle: 'none',
  },
  inputError: { borderColor: C.error, backgroundColor: C.errorSoft },
  passwordWrap: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: 0 },
  passwordInput: { flex: 1, paddingVertical: 16, fontSize: 15, color: C.ink, fontFamily: F.sans, outlineStyle: 'none' },
  fieldError: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, marginLeft: 4 },
  fieldErrorText: { flex: 1, fontSize: 12, color: C.error, fontFamily: F.sans },
  errorBox: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: SPACING.lg,
    backgroundColor: C.errorSoft, borderWidth: 1, borderColor: C.errorBorder,
    borderRadius: RADIUS.md, padding: SPACING.md,
  },
  errorIcon: { marginTop: 1 },
  errorBoxText: { flex: 1, fontSize: 12.5, color: C.error, lineHeight: 18, fontFamily: F.sansMed },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, marginTop: SPACING.xl },
  checkbox: {
    width: 26, height: 26, borderRadius: 6, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.cream, alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  checkboxChecked: { backgroundColor: C.amber, borderColor: C.amber },
  termsText: { flex: 1, fontSize: 14, color: C.brown, fontFamily: F.sans, lineHeight: 22 },
  link: { fontSize: 14, color: C.amber, fontFamily: F.sans, textDecorationLine: 'underline' },
  linkBold: { fontFamily: F.sansSemi },
  primaryBtn: {
    backgroundColor: C.ink, borderRadius: RADIUS.xl, minHeight: 56,
    alignItems: 'center', justifyContent: 'center', marginTop: SPACING.xl,
  },
  primaryBtnDisabled: { opacity: 0.35 },
  primaryBtnText: { fontSize: 16, color: C.cream, fontFamily: F.sansMed },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', paddingTop: SPACING.xl },
  loginText: { fontSize: 14, color: C.brown, fontFamily: F.sans },
});