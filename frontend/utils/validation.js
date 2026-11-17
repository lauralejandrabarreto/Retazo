// Validaciones de formularios. Cada función `validate...` devuelve un mensaje de
// error (string) o null cuando el valor es válido.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'.\- ]+$/;

export const EMAIL_MAX_LENGTH = 80;
export const NAME_MAX_LENGTH = 60;
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 64;

export function validateEmail(value = '') {
  const email = value.trim();
  if (!email) return 'Ingresa tu correo electrónico.';
  if (email.length > 254 || email.includes('..') || !EMAIL_REGEX.test(email)) {
    return 'Escribe un correo válido, por ejemplo nombre@correo.com.';
  }
  return null;
}

// En el inicio de sesión solo se exige que exista y tenga una longitud mínima:
// las reglas de complejidad se aplican al crear la cuenta (ver PASSWORD_RULES).
export function validatePassword(value = '') {
  if (!value) return 'Ingresa tu contraseña.';
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  return null;
}

export const ORG_NAME_MAX_LENGTH = 80;

export function validateOrganizationName(value = '') {
  const name = value.trim().replace(/\s+/g, ' ');
  if (!name) return 'Ingresa el nombre oficial de la organización.';
  if (name.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
  return null;
}

// Nombre y apellido: al menos dos palabras, solo letras, espacios y ' . -
export function validateFullName(value = '') {
  const name = value.trim().replace(/\s+/g, ' ');
  if (!name) return 'Ingresa tu nombre completo.';
  const words = name.split(' ');
  if (words.length < 2 || words.some((w) => w.length < 2)) {
    return 'Escribe tu nombre y apellido.';
  }
  if (!NAME_REGEX.test(name)) return 'El nombre solo puede tener letras y espacios.';
  return null;
}

// ---- Contraseña nueva (registro) -------------------------------------------

// Caracteres especiales permitidos: ! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \ ] ^ _ ` { | } ~
const SPECIAL_CHAR_REGEX = /[!-/:-@[-`{-~]/;

export const PASSWORD_RULES = [
  { id: 'length', label: 'Mínimo 8 caracteres', test: (v) => v.length >= 8 },
  { id: 'upper', label: 'Una letra mayúscula', test: (v) => /[A-ZÁÉÍÓÚÜÑ]/.test(v) },
  { id: 'number', label: 'Un número', test: (v) => /\d/.test(v) },
  { id: 'special', label: 'Un carácter especial (! @ # $ % & * ...)', test: (v) => SPECIAL_CHAR_REGEX.test(v) },
];

// Devuelve cada requisito con su estado actual: [{ id, label, met }]
export function getPasswordChecks(value = '') {
  return PASSWORD_RULES.map(({ id, label, test }) => ({ id, label, met: test(value) }));
}

export function isPasswordStrong(value = '') {
  return PASSWORD_RULES.every((rule) => rule.test(value));
}

export function validateNewPassword(value = '') {
  if (!value) return 'Crea una contraseña.';
  if (!isPasswordStrong(value)) return 'La contraseña no cumple todos los requisitos.';
  return null;
}

export function validateConfirmPassword(password = '', confirm = '') {
  if (!confirm) return 'Repite tu contraseña.';
  if (confirm !== password) return 'Las contraseñas no coinciden.';
  return null;
}