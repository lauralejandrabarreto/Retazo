import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C, F, SPACING, RADIUS } from '../theme';
import Divider from '../components/Divider';
import NoticeBox from '../components/NoticeBox';
import Toast, { useToast } from '../components/Toast';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { login, AUTH_ERRORS } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import {
  validateEmail, validatePassword, EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH,
} from '../utils/validation';

// Inicio de sesión. Valida el formato del correo y la contraseña antes de
// consultar el servicio, y traduce los errores del servicio a mensajes claros:
// - errores de campo (formato) se muestran bajo cada campo;
// - credenciales inválidas o fallas de conexión se muestran en un aviso superior.
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const passwordRef = useRef(null);
  const toast = useToast();
  const { signIn } = useAuth();

  const emailError = touched.email ? validateEmail(email) : null;
  const passwordError = touched.password ? validatePassword(password) : null;

  const goToApp = () => navigation.replace('TabsPrincipales');

  const onChangeEmail = (text) => {
    setEmail(text);
    if (formError) setFormError(null);
  };

  const onChangePassword = (text) => {
    setPassword(text);
    if (formError) setFormError(null);
  };

  const onSubmit = async () => {
    if (submitting) return;
    setTouched({ email: true, password: true });
    setFormError(null);

    const invalidEmail = validateEmail(email);
    const invalidPassword = validatePassword(password);
    if (invalidEmail || invalidPassword) {
      if (invalidEmail) return;
      passwordRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const user = await login({ email, password });
      signIn(user);
      goToApp();
    } catch (error) {
      if (error?.code === AUTH_ERRORS.INVALID_CREDENTIALS) {
        setFormError({
          icon: 'alert-circle',
          text: 'El correo o la contraseña no son correctos. Revisa tus datos e inténtalo de nuevo.',
        });
        setPassword('');
      } else {
        setFormError({
          icon: 'wifi-off',
          text: 'No fue posible iniciar sesión por un problema de conexión. Inténtalo de nuevo en unos minutos.',
        });
      }
    } finally {
      setSubmitting(false);
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
          <View>
            <Text style={styles.kicker}>Inicio de sesión</Text>
            <Text style={styles.title}>Vuelve a explorar</Text>
            <Text style={styles.subtitle}>
              Inicia sesión en Retazo y redescubre tus lugares históricos favoritos.
            </Text>

            {!!formError && (
              <View accessibilityLiveRegion="assertive" style={styles.formError}>
                <View style={styles.errorBox}>
                  <Feather name={formError.icon} size={14} color={C.error} style={styles.errorIcon} />
                  <Text style={styles.errorBoxText}>{formError.text}</Text>
                </View>
              </View>
            )}

            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              value={email}
              onChangeText={onChangeEmail}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
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
            <View style={[styles.input, styles.passwordWrap, !!passwordError && styles.inputError]}>
              <TextInput
                ref={passwordRef}
                value={password}
                onChangeText={onChangePassword}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                onSubmitEditing={onSubmit}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor={C.brown}
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                maxLength={PASSWORD_MAX_LENGTH}
                editable={!submitting}
                accessibilityLabel="Contraseña"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={C.brown} />
              </TouchableOpacity>
            </View>
            {!!passwordError && <FieldError text={passwordError} />}

            <TouchableOpacity
              style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled]}
              onPress={onSubmit}
              disabled={submitting}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityState={{ disabled: submitting, busy: submitting }}
            >
              {submitting ? (
                <ActivityIndicator color={C.cream} />
              ) : (
                <Text style={styles.primaryBtnText}>Iniciar sesión</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => comingSoon('Recuperar contraseña')}
              accessibilityRole="button"
            >
              <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <Divider />

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>¿No tienes una cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Registro')} accessibilityRole="button">
                <Text style={[styles.link, styles.linkBold]}>Regístrate</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={goToApp}
            disabled={submitting}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryBtnText}>Continuar sin cuenta</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast message={toast.message} />
    </SafeAreaView>
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
  content: {
    flexGrow: 1, justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: SPACING.xl, gap: SPACING.xxl,
  },
  kicker: { fontSize: 15, color: C.brown, fontFamily: F.sansMed },
  title: { fontSize: 32, color: C.ink, fontFamily: F.serifSemi, marginTop: SPACING.xxl },
  subtitle: { fontSize: 14, color: C.brown, fontFamily: F.sans, lineHeight: 22, marginTop: SPACING.sm, marginBottom: SPACING.xxl },
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
  formError: { marginBottom: SPACING.lg },
  errorBox: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: C.errorSoft, borderWidth: 1, borderColor: C.errorBorder,
    borderRadius: RADIUS.md, padding: SPACING.md,
  },
  errorIcon: { marginTop: 1 },
  errorBoxText: { flex: 1, fontSize: 12.5, color: C.error, lineHeight: 18, fontFamily: F.sansMed },
  primaryBtn: {
    backgroundColor: C.ink, borderRadius: RADIUS.xl, minHeight: 56,
    alignItems: 'center', justifyContent: 'center', marginTop: SPACING.xl,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { fontSize: 16, color: C.cream, fontFamily: F.sansMed },
  forgotBtn: { alignSelf: 'center', paddingVertical: SPACING.lg },
  link: { fontSize: 14, color: C.amber, fontFamily: F.sans, textDecorationLine: 'underline' },
  linkBold: { fontFamily: F.sansSemi },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', paddingTop: SPACING.lg },
  registerText: { fontSize: 14, color: C.brown, fontFamily: F.sans },
  secondaryBtn: {
    borderWidth: 1.5, borderColor: C.border, backgroundColor: C.parchment, borderRadius: RADIUS.xl,
    minHeight: 56, alignItems: 'center', justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 16, color: C.ink, fontFamily: F.sansMed },
});