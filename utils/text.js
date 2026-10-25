// Normaliza un texto para comparar sin tildes ni mayúsculas.
// Ejemplo: normalize('Bolívar') === normalize('bolivar')
export function normalize(value = '') {
  return value
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}
