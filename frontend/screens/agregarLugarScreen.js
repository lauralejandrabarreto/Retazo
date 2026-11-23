import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';

import LocationPickerMap from '../components/LocationPickerMap';
import { F, SPACING } from '../theme';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import { createPlace } from '../services/placesService';
import { pickImage, uploadImage } from '../services/uploadService';
import { SIMULATED_LOCATION } from '../data/constants';

const COLORS = {
  parchment: '#F4EDDF',
  paper: '#FFFCF6',
  ink: '#25190F',
  muted: '#988873',
  border: '#E8DCC7',
  gold: '#AC7933',
  map: '#E6DAC1',
  error: '#A33B2E',
};

// Región inicial del mapa cuando no se obtiene la ubicación del dispositivo. Es la misma
// ubicación de respaldo del resto de la app; la pantalla avisa que no es la real.
const INITIAL_REGION = {
  latitude: SIMULATED_LOCATION.coords.lat,
  longitude: SIMULATED_LOCATION.coords.lng,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

// Mismos valores que acepta el backend (LugarHistoricoService.ETIQUETAS_SIGLO).
const SIGLOS = [
  { value: 'prehispanico', label: 'Prehispánico' },
  { value: 'XVI', label: 'Siglo XVI' },
  { value: 'XVII', label: 'Siglo XVII' },
  { value: 'XVIII', label: 'Siglo XVIII' },
  { value: 'XIX', label: 'Siglo XIX' },
  { value: 'XX', label: 'Siglo XX' },
];

const esUrlHttp = (texto) => /^https?:\/\/\S+$/i.test(texto.trim());

// "Plaza de Bolívar" + "Bogotá" -> "plaza-de-bolivar-bogota"
function crearSlug(...partes) {
  return partes
    .join(' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

// ---------------------------------------------------------------------------
// Componentes visuales (fuera de la pantalla para no perder el foco al escribir).
// ---------------------------------------------------------------------------

function Seccion({ titulo, descripcion, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{titulo}</Text>
      {descripcion ? <Text style={styles.sectionDescription}>{descripcion}</Text> : null}
      {children}
    </View>
  );
}

function Campo({ label, value, onChangeText, placeholder, multiline = false, height, keyboardType, url = false }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        multiline={multiline}
        keyboardType={url ? 'url' : keyboardType}
        autoCapitalize={url ? 'none' : undefined}
        autoCorrect={url ? false : undefined}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.multilineInput, height ? { height } : null]}
        accessibilityLabel={label}
      />
    </View>
  );
}

// Dropdown: al tocar se despliega la lista y al elegir una opción se cierra.
function SelectorSiglo({ siglo, onSelect }) {
  const [abierto, setAbierto] = useState(false);
  const actual = SIGLOS.find((s) => s.value === siglo);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>Siglo al que pertenece</Text>

      <TouchableOpacity
        style={[styles.selectContainer, abierto && styles.selectContainerOpen]}
        onPress={() => setAbierto((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel="Siglo al que pertenece"
        accessibilityState={{ expanded: abierto }}
      >
        <Text style={[styles.selectValue, actual && styles.selectValueActive]}>
          {actual?.label ?? 'Selecciona el siglo'}
        </Text>
        <Feather name={abierto ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.muted} />
      </TouchableOpacity>

      {abierto && (
        <View style={styles.dropdownList}>
          {SIGLOS.map((item, i) => {
            const activo = item.value === siglo;
            return (
              <TouchableOpacity
                key={item.value}
                style={[styles.dropdownItem, i > 0 && styles.dropdownItemBorder, activo && styles.dropdownItemActive]}
                onPress={() => {
                  onSelect(item.value);
                  setAbierto(false);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
              >
                <Text style={[styles.dropdownText, activo && styles.dropdownTextActive]}>{item.label}</Text>
                {activo && <Feather name="check" size={14} color={COLORS.gold} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

// Vista previa de la imagen a partir de la URL pegada.
function VistaPrevia({ url, style }) {
  const [fallo, setFallo] = useState(false);
  useEffect(() => setFallo(false), [url]);

  if (!esUrlHttp(url) || fallo) {
    return (
      <View style={[styles.previewEmpty, style]}>
        <Feather name={fallo ? 'alert-triangle' : 'image'} size={18} color="#C8B99E" />
      </View>
    );
  }
  return <Image source={{ uri: url.trim() }} style={style} resizeMode="cover" onError={() => setFallo(true)} />;
}

// Botón para subir una foto desde el dispositivo al servidor. Al terminar entrega la URL.
function BotonSubirFoto({ onUploaded }) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState(null);

  async function subir() {
    setError(null);
    try {
      const asset = await pickImage();
      if (!asset) return;
      setSubiendo(true);
      onUploaded(await uploadImage(asset));
    } catch (e) {
      setError(e?.message || 'No se pudo subir la imagen.');
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <View>
      <TouchableOpacity style={styles.uploadImageButton} onPress={subir} disabled={subiendo} accessibilityRole="button">
        {subiendo ? <ActivityIndicator size="small" color={COLORS.gold} /> : <Feather name="upload" size={14} color={COLORS.gold} />}
        <Text style={styles.uploadImageText}>{subiendo ? 'Subiendo…' : 'Subir desde el dispositivo'}</Text>
      </TouchableOpacity>
      {!!error && <Text style={styles.uploadImageError}>{error}</Text>}
    </View>
  );
}

function TarjetaFotografia({ foto, puedeEliminar, onChangeUrl, onChangeYear, onRemove }) {
  return (
    <View style={styles.photoCard}>
      <View style={styles.photoRow}>
        <VistaPrevia url={foto.url} style={styles.photoPreview} />
        <View style={styles.uploadButton}>
          <Text style={styles.label}>URL de la fotografía</Text>
          <TextInput
            value={foto.url}
            onChangeText={onChangeUrl}
            placeholder="https://..."
            placeholderTextColor={COLORS.muted}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            accessibilityLabel="URL de la fotografía histórica"
          />
          <BotonSubirFoto onUploaded={onChangeUrl} />
        </View>
        {puedeEliminar && (
          <TouchableOpacity onPress={onRemove} hitSlop={10} accessibilityRole="button" accessibilityLabel="Quitar fotografía">
            <Text style={styles.removePhoto}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.label}>Año de la fotografía</Text>
      <TextInput
        value={foto.anio}
        onChangeText={onChangeYear}
        placeholder="Ej. 1910"
        placeholderTextColor={COLORS.muted}
        keyboardType="numeric"
        maxLength={4}
        style={styles.input}
        accessibilityLabel="Año de la fotografía"
      />
    </View>
  );
}

// ---------------------------------------------------------------------------

const nuevaFoto = () => ({ id: Date.now() + Math.random(), url: '', anio: '' });

export default function AgregarLugarScreen() {
  // Información del lugar
  const [nombre, setNombre] = useState('');
  const [siglo, setSiglo] = useState('');
  const [sector, setSector] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [pais, setPais] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Historia del lugar
  const [origen, setOrigen] = useState('');
  const [transformaciones, setTransformaciones] = useState('');
  const [significado, setSignificado] = useState('');

  // Imágenes (URLs)
  const [fotografias, setFotografias] = useState([nuevaFoto()]);
  const [urlActual, setUrlActual] = useState('');

  // Ubicación
  const [region, setRegion] = useState(null);
  const [coordenadas, setCoordenadas] = useState(null);
  const [cargandoUbicacion, setCargandoUbicacion] = useState(true);
  // Aviso visible cuando no se obtiene la ubicación (Alert.alert no se muestra en la web).
  const [avisoUbicacion, setAvisoUbicacion] = useState(null);

  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    obtenerUbicacion();
  }, []);

  async function obtenerUbicacion() {
    try {
      setCargandoUbicacion(true);
      setAvisoUbicacion(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setAvisoUbicacion('No diste permiso de ubicación. Toca el mapa para marcar dónde está el lugar.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const nueva = { latitude: location.coords.latitude, longitude: location.coords.longitude };
      setCoordenadas(nueva);
      setRegion({ ...nueva, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    } catch (error) {
      console.warn('Error obteniendo ubicación:', error);
      setAvisoUbicacion('No pudimos obtener tu ubicación. Toca el mapa para marcar dónde está el lugar.');
    } finally {
      setCargandoUbicacion(false);
    }
  }

  const actualizarFoto = (id, cambios) =>
    setFotografias((fs) => fs.map((f) => (f.id === id ? { ...f, ...cambios } : f)));

  function limpiarFormulario() {
    setNombre(''); setSiglo(''); setSector(''); setCiudad(''); setPais(''); setDescripcion('');
    setOrigen(''); setTransformaciones(''); setSignificado('');
    setFotografias([nuevaFoto()]); setUrlActual('');
  }

  // Devuelve la lista de errores de validación (misma lógica que el backend).
  function validar() {
    const errores = [];
    if (!nombre.trim()) errores.push('El nombre del lugar es obligatorio.');
    if (!siglo) errores.push('Selecciona el siglo.');
    if (!sector.trim()) errores.push('El sector o barrio es obligatorio.');
    if (!ciudad.trim()) errores.push('La ciudad es obligatoria.');
    if (!pais.trim()) errores.push('El país es obligatorio.');
    if (!descripcion.trim()) errores.push('La descripción breve es obligatoria.');
    if (!coordenadas) errores.push('Selecciona la ubicación en el mapa.');
    if (nombre.trim() && ciudad.trim() && !crearSlug(nombre, ciudad)) {
      errores.push('El nombre y la ciudad deben contener letras o números.');
    }

    if (urlActual.trim() && !esUrlHttp(urlActual)) {
      errores.push('La URL de la fotografía actual debe empezar con http:// o https://.');
    }
    fotografias.forEach((f, i) => {
      const url = f.url.trim();
      const anio = f.anio.trim();
      if (!url && !anio) return; // tarjeta vacía: se ignora
      if (url && !esUrlHttp(url)) errores.push(`La URL de la fotografía histórica ${i + 1} no es válida.`);
      if (!anio) errores.push(`La fotografía histórica ${i + 1} necesita un año.`);
    });
    return errores;
  }

  async function registrarLugar() {
    if (enviando) return;

    const errores = validar();
    if (errores.length > 0) {
      Alert.alert('Revisa el formulario', errores.join('\n'));
      return;
    }

    const actual = urlActual.trim();
    const seccionesHistoria = [
      { titulo: 'Origen y construcción', texto: origen.trim() },
      { titulo: 'Transformaciones del lugar', texto: transformaciones.trim() },
      { titulo: 'Significado cultural', texto: significado.trim() },
    ].filter((s) => s.texto);

    const lugar = {
      id: crearSlug(nombre, ciudad),
      nombre: nombre.trim(),
      sector: sector.trim(),
      ciudad: ciudad.trim(),
      pais: pais.trim(),
      siglo,
      epoca: SIGLOS.find((s) => s.value === siglo).label,
      coords: { lat: coordenadas.latitude, lng: coordenadas.longitude },
      imagen: actual || null,
      imagenActual: actual || null,
      descripcion: descripcion.trim(),
      fotosHistoricas: fotografias
        .filter((f) => f.anio.trim())
        .map((f) => ({ anio: f.anio.trim(), uri: f.url.trim() || null })),
      historia: seccionesHistoria,
      fuentes: [],
      contenidoVerificado: false,
    };

    try {
      setEnviando(true);
      await createPlace(lugar);
      limpiarFormulario();
      Alert.alert('Lugar registrado', `"${lugar.nombre}" ya está disponible en Retazo.`);
    } catch (error) {
      let mensaje = error?.message || 'No fue posible registrar el lugar. Inténtalo de nuevo.';
      if (error?.status === 401) mensaje = 'Tu sesión expiró. Inicia sesión de nuevo.';
      else if (error?.status === 403) mensaje = 'Tu cuenta no tiene permiso para agregar lugares.';
      else if (error?.status === 409) mensaje = 'Ya existe un lugar con ese nombre en esa ciudad.';
      Alert.alert('No se pudo registrar', mensaje);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FocusAwareStatusBar style="dark" />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.logo}>Retazo</Text>
            <Text style={styles.userType}>Ente organizacional</Text>
          </View>

          <Text style={styles.title}>Agregar lugar histórico</Text>
          <Text style={styles.subtitle}>
            Completa la información y pega los enlaces de las imágenes para registrar el lugar en Retazo.
          </Text>

          <Seccion titulo="DATOS DEL LUGAR">
            <Campo label="Nombre del lugar" value={nombre} onChangeText={setNombre} placeholder="Escribe el nombre del lugar" />

            <SelectorSiglo siglo={siglo} onSelect={setSiglo} />

            <Campo label="Sector o barrio" value={sector} onChangeText={setSector} placeholder="Ej. Centro Histórico" />
            <Campo label="Ciudad" value={ciudad} onChangeText={setCiudad} placeholder="Ej. Tegucigalpa" />
            <Campo label="País" value={pais} onChangeText={setPais} placeholder="Ej. Honduras" />

            <View style={styles.field}>
              <Text style={styles.label}>Ubicación en el mapa</Text>

              <View style={styles.mapContainer}>
                {cargandoUbicacion ? (
                  <View style={styles.mapLoading}>
                    <ActivityIndicator color={COLORS.gold} />
                    <Text style={styles.mapLoadingText}>Obteniendo tu ubicación...</Text>
                  </View>
                ) : (
                  <LocationPickerMap
                    style={styles.map}
                    region={region ?? INITIAL_REGION}
                    coordinate={coordenadas}
                    onSelect={setCoordenadas}
                    pinColor={COLORS.gold}
                  />
                )}
              </View>

              {!cargandoUbicacion && !region && (
                <View style={styles.locationNotice}>
                  <Feather name="map-pin" size={14} color={COLORS.error} />
                  <Text style={styles.locationNoticeText}>
                    {avisoUbicacion ?? 'No se pudo obtener tu ubicación.'} El mapa muestra una ubicación de ejemplo, no la tuya.
                  </Text>
                </View>
              )}
              {!cargandoUbicacion && !region && (
                <TouchableOpacity onPress={obtenerUbicacion} accessibilityRole="button">
                  <Text style={styles.retryText}>Intentar de nuevo con mi ubicación</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.helperText}>Toca el mapa o arrastra el marcador para indicar la ubicación exacta.</Text>

              {coordenadas && (
                <Text style={styles.coordinates}>
                  Latitud: {coordenadas.latitude.toFixed(6)} · Longitud: {coordenadas.longitude.toFixed(6)}
                </Text>
              )}
            </View>

            <Campo
              label="Descripción breve"
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Resume qué hace especial a este lugar..."
              multiline
              height={100}
            />
          </Seccion>

          <Seccion
            titulo="FOTOGRAFÍAS HISTÓRICAS"
            descripcion="Pega el enlace de cada fotografía e indica su año. Las tarjetas vacías se ignoran."
          >
            {fotografias.map((foto) => (
              <TarjetaFotografia
                key={foto.id}
                foto={foto}
                puedeEliminar={fotografias.length > 1}
                onChangeUrl={(url) => actualizarFoto(foto.id, { url })}
                onChangeYear={(anio) => actualizarFoto(foto.id, { anio })}
                onRemove={() => setFotografias((fs) => fs.filter((f) => f.id !== foto.id))}
              />
            ))}

            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={() => setFotografias((fs) => [...fs, nuevaFoto()])}
              accessibilityRole="button"
            >
              <Text style={styles.addPhotoText}>＋ Agregar otra fotografía</Text>
            </TouchableOpacity>
          </Seccion>

          <Seccion titulo="FOTOGRAFÍA ACTUAL" descripcion="Pega el enlace de una fotografía del estado actual del lugar o súbela desde tu dispositivo.">
            <Campo label="URL de la fotografía actual" value={urlActual} onChangeText={setUrlActual} placeholder="https://..." url />
            <BotonSubirFoto onUploaded={setUrlActual} />
            <VistaPrevia url={urlActual} style={styles.currentPhoto} />
          </Seccion>

          <Seccion titulo="HISTORIA DEL LUGAR" descripcion="Cuenta la historia del lugar en los siguientes apartados (opcional).">
            <Campo
              label="Origen y construcción"
              value={origen}
              onChangeText={setOrigen}
              placeholder="¿Cuándo y cómo se construyó? ¿Quiénes participaron?"
              multiline
              height={95}
            />
            <Campo
              label="Transformaciones del lugar"
              value={transformaciones}
              onChangeText={setTransformaciones}
              placeholder="Describe sus cambios, usos y restauraciones a lo largo del tiempo..."
              multiline
              height={95}
            />
            <Campo
              label="Significado cultural"
              value={significado}
              onChangeText={setSignificado}
              placeholder="¿Qué representa para la comunidad y su patrimonio?"
              multiline
              height={95}
            />
          </Seccion>

          <TouchableOpacity
            style={[styles.submitButton, enviando && styles.submitDisabled]}
            onPress={registrarLugar}
            disabled={enviando}
            accessibilityRole="button"
            accessibilityState={{ disabled: enviando, busy: enviando }}
          >
            {enviando ? <ActivityIndicator color="#FFF9EF" /> : <Text style={styles.submitText}>Agregar lugar histórico</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.parchment,
  },

  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 35,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    marginBottom: 24,
  },

  logo: {
    fontFamily: F.serif,
    fontSize: 25,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: COLORS.ink,
  },

  userType: {
    color: COLORS.muted,
    fontSize: 11,
  },

  title: {
    fontSize: 25,
    color: COLORS.ink,
    fontFamily: F.serif,
    marginBottom: 5,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 30,
  },

  section: {
    marginBottom: 29,
  },

  sectionTitle: {
    color: COLORS.muted,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 10,
  },

  sectionDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 13,
  },

  field: {
    marginBottom: 15,
  },

  label: {
    color: '#806F5A',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 7,
  },

  input: {
    minHeight: 43,
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: COLORS.ink,
    fontSize: 12,
  },

  multilineInput: {
    paddingTop: 12,
    lineHeight: 18,
  },

  selectContainer: {
    minHeight: 43, backgroundColor: COLORS.paper, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 11, paddingHorizontal: 12, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },

  selectValue: { color: COLORS.muted, fontSize: 12 },

  photoPreview: {
    width: 55, height: 55, borderRadius: 8, overflow: 'hidden', backgroundColor: COLORS.map,
  },

  currentPhoto: {
    height: 150, borderRadius: 13, overflow: 'hidden', backgroundColor: COLORS.map, marginTop: 4,
  },

  mapContainer: {
    height: 185,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.map,
  },

  map: {
    flex: 1,
  },

  mapLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  mapLoadingText: {
    color: COLORS.muted,
    fontSize: 12,
  },

  retryText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },

  helperText: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 8,
  },

  coordinates: {
    color: COLORS.gold,
    fontSize: 10,
    marginTop: 5,
  },

  photoCard: {
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    padding: 11,
    marginBottom: 11,
  },

  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },

  uploadButton: {
    flex: 1,
  },

  fileTypes: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5,
  },

  uploadImageButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    marginTop: 8, paddingVertical: 6, paddingHorizontal: 10,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, backgroundColor: COLORS.paper,
  },
  uploadImageText: { fontSize: 12, color: COLORS.gold, fontFamily: F.sansMed },
  uploadImageError: { fontSize: 11, color: COLORS.error, marginTop: 4, fontFamily: F.sans },
  locationNotice: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 8, padding: 10,
    borderRadius: 8, backgroundColor: '#F8E9E5', borderWidth: 1, borderColor: '#EBC9C1',
  },
  locationNoticeText: { flex: 1, fontSize: 12, color: COLORS.error, lineHeight: 17, fontFamily: F.sans },
  removePhoto: {
    color: '#A66B50',
    fontSize: 23,
    paddingHorizontal: 5,
  },

  addPhotoButton: {
    height: 43,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addPhotoText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '600',
  },


  submitButton: {
    height: 48,
    backgroundColor: COLORS.ink,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 15,
  },

  submitText: {
    color: '#FFF9EF',
    fontSize: 13,
    fontWeight: '600',
  },

  selectContainerOpen: { borderColor: COLORS.gold },

  selectValueActive: { color: COLORS.ink },

  dropdownList: {
    marginTop: 6, backgroundColor: COLORS.paper, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 11, overflow: 'hidden',
  },

  dropdownItem: {
    paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },

  dropdownItemBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },

  dropdownItemActive: { backgroundColor: 'rgba(172,121,51,0.1)' },

  dropdownText: { fontSize: 12, color: COLORS.ink },

  dropdownTextActive: { color: COLORS.gold, fontWeight: '600' },

  previewEmpty: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.map },

  submitDisabled: { opacity: 0.6 },
});