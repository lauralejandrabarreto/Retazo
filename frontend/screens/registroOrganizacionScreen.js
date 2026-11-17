import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { C, F, SPACING, RADIUS } from '../theme';
import PasswordRequirements from '../components/PasswordRequirements';
import FileUploadBox from '../components/FileUploadBox';
import { EmptyState } from '../components/StateMessage';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { registerOrganization, AUTH_ERRORS } from '../services/authService';
import { pickDocument } from '../services/documentPicker';
import {
  validateOrganizationName, validateEmail, validateConfirmPassword, isPasswordStrong,
  ORG_NAME_MAX_LENGTH, EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH,
} from '../utils/validation';
import { validateDocument, DOCUMENT_MAX_MB } from '../utils/files';

// Registro de ente organizacional. "Enviar registro" se habilita solo cuando:
// nombre y correo son válidos, la contraseña cumple los requisitos (en vivo),
// la confirmación coincide y hay un documento PDF/JPG/PNG de máximo 10 MB.
// La cuenta queda pendiente de validación: no se inicia sesión automáticamente.
export default function RegistroOrganizacionScreen({ navigation }) {
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [document, setDocument] = useState(null);
  const [documentError, setDocumentError] = useState(null);
  const [touched, setTouched] = useState({ orgName: false, email: false, password: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);
  const [formError, setFormError] = useState(null);
  const [sent, setSent] = useState(false);

  const emailRef = React.useRef(null);
  const passwordRef = React.useRef(null);
  const confirmRef = React.useRef(null);

  const touch = (field) => setTouched((t) => ({ ...t, [field]: true }));

  const orgNameError = touched.orgName ? validateOrganizationName(orgName) : null;
  const emailFormatError = touched.email ? validateEmail(email) : null;
  const emailError = emailFormatError || (emailTaken ? 'Este correo ya está registrado. Inicia sesión.' : null);
  const confirmError = touched.confirm || confirm.length > 0 ? validateConfirmPassword(password, confirm) : null;

  const formValid =
    !validateOrganizationName(orgName) &&
    !validateEmail(email) &&
    isPasswordStrong(password) &&
    !validateConfirmPassword(password, confirm) &&
    !!document &&
    !validateDocument(document);
  const canSubmit = formValid && !submitting;

  const goToLogin = () => {
    if (navigation.canGoBack()) navigation.popToTop();
    else navigation.replace('Login');
  };

  const onPickDocument = async () => {
    try {
      const file = await pickDocument();
      if (!file) return; // el usuario canceló
      const error = validateDocument(file);
      setDocumentError(error);
      setDocument(error ? null : file);
    } catch {
      setDocument(null);
      setDocumentError('No se pudo leer el archivo. Inténtalo de nuevo.');
    }
  };

  const onRemoveDocument = () => {
    setDocument(null);
    setDocumentError(null);
  };

  const onSubmit = async () => {
    if (!canSubmit) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await registerOrganization({ nombre: orgName.trim(), email, password, documento: document });
      setSent(true);
    } catch (error) {
      if (error?.code === AUTH_ERRORS.EMAIL_IN_USE) {
        setEmailTaken(true);
        touch('email');
        emailRef.current?.focus();
      } else {
        setFormError('No fue posible enviar el registro por un problema de conexión. Inténtalo de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={[styles.container, styles.sentWrap]}>
        <FocusAwareStatusBar style="dark" />
        <EmptyState
          icon="check-circle"
          title="Solicitud enviada"
          message="Revisaremos el documento de tu organización y te avisaremos al correo registrado cuando tu cuenta esté validada."
          actionLabel="Volver al inicio de sesión"
          onAction={goToLogin}
        />
      </SafeAreaView>
    );
  }

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

          <Text style={styles.title}>Regístrate como ente organizacional</Text>
          <Text style={styles.subtitle}>
            Llena los siguientes datos para validar tu organización y formar parte de Retazo.
          </Text>

          {!!formError && (
            <View style={styles.errorBox} accessibilityLiveRegion="assertive">
              <Feather name="wifi-off" size={14} color={C.error} style={styles.errorIcon} />
              <Text style={styles.errorBoxText}>{formError}</Text>
            </View>
          )}

          <Text style={styles.label}>Nombre de la organización</Text>
          <TextInput
            value={orgName}
            onChangeText={setOrgName}
            onBlur={() => touch('orgName')}
            onSubmitEditing={() => emailRef.current?.focus()}
            placeholder="Nombre oficial de la organización"
            placeholderTextColor={C.brown}
            style={[styles.input, !!orgNameError && styles.inputError]}
            autoCapitalize="words"
            returnKeyType="next"
            maxLength={ORG_NAME_MAX_LENGTH}
            editable={!submitting}
            accessibilityLabel="Nombre de la organización"
          />
          {!!orgNameError && <FieldError text={orgNameError} />}

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
            placeholder="contacto@organizacion.org"
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
              placeholder="Mínimo 8 caracteres"
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

          <Text style={[styles.label, styles.labelSpaced, styles.labelTight]}>Documento oficial</Text>
          <Text style={styles.help}>Adjunta un archivo oficial que confirme su estatus como ente organizacional.</Text>
          <FileUploadBox
            file={document}
            error={documentError}
            hint={`PDF, JPG o PNG · Máx. ${DOCUMENT_MAX_MB} MB`}
            onPick={onPickDocument}
            onRemove={onRemoveDocument}
            disabled={submitting}
          />

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
              <Text style={styles.primaryBtnText}>Enviar registro</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  sentWrap: { justifyContent: 'center' },
  content: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: SPACING.xxl },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg },
  backBtn: { padding: 2 },
  kicker: { fontSize: 15, color: C.brown, fontFamily: F.sansMed },
  title: { fontSize: 32, color: C.ink, fontFamily: F.serifSemi, lineHeight: 40, marginTop: SPACING.xxl },
  subtitle: { fontSize: 14, color: C.brown, fontFamily: F.sans, lineHeight: 22, marginTop: SPACING.sm, marginBottom: SPACING.xl },
  label: { fontSize: 14, color: C.brown, fontFamily: F.sansMed, marginBottom: SPACING.sm },
  labelSpaced: { marginTop: SPACING.lg },
  labelTight: { marginBottom: SPACING.xs },
  help: { fontSize: 14, color: C.brown, fontFamily: F.sans, lineHeight: 22, marginBottom: SPACING.md },
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
  primaryBtn: {
    backgroundColor: C.ink, borderRadius: RADIUS.xl, minHeight: 56,
    alignItems: 'center', justifyContent: 'center', marginTop: SPACING.xl,
  },
  primaryBtnDisabled: { opacity: 0.35 },
  primaryBtnText: { fontSize: 16, color: C.cream, fontFamily: F.sansMed },
});