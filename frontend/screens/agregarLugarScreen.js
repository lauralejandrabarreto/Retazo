import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

import LocationPickerMap from '../components/LocationPickerMap';
import { C, F, SPACING } from '../theme';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';

const COLORS = {
  parchment: '#F4EDDF',
  paper: '#FFFCF6',
  ink: '#25190F',
  muted: '#988873',
  border: '#E8DCC7',
  gold: '#AC7933',
  map: '#E6DAC1',
};

// Se usa cuando no se puede obtener la ubicación del dispositivo (Tegucigalpa).
const INITIAL_REGION = {
  latitude: 14.0723,
  longitude: -87.1921,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const SIGLOS = [
  'Siglo XV',
  'Siglo XVI',
  'Siglo XVII',
  'Siglo XVIII',
  'Siglo XIX',
  'Siglo XX',
  'Siglo XXI',
  'Anterior al siglo XV',
];

// ---------------------------------------------------------------------------
// Componentes visuales. Están FUERA de AgregarLugarScreen a propósito: si se
// definen dentro, React crea un componente nuevo en cada render y los
// TextInput se desmontan (se pierde el foco) con cada letra escrita.
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

function Campo({ label, value, onChangeText, placeholder, multiline = false, height, keyboardType }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        multiline={multiline}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.multilineInput, height ? { height } : null]}
        accessibilityLabel={label}
      />
    </View>
  );
}

function SelectorSiglo({ siglo, onSelect }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>Siglo al que pertenece</Text>

      <View style={styles.selectContainer}>
        <Text style={styles.selectValue}>{siglo || 'Selecciona el siglo'}</Text>
        <Text style={styles.selectArrow}>⌄</Text>
      </View>

      <View style={styles.centuries}>
        {SIGLOS.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.centuryOption, siglo === item && styles.centurySelected]}
            onPress={() => onSelect(item)}
            accessibilityRole="button"
            accessibilityState={{ selected: siglo === item }}
          >
            <Text style={[styles.centuryText, siglo === item && styles.centurySelectedText]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function TarjetaFotografia({ foto, puedeEliminar, onPickPhoto, onChangeYear, onRemove }) {
  return (
    <View style={styles.photoCard}>
      <View style={styles.photoRow}>
        <TouchableOpacity style={styles.photoPreview} onPress={onPickPhoto} accessibilityRole="button" accessibilityLabel="Elegir fotografía">
          {foto.uri ? (
            <Image source={{ uri: foto.uri }} style={styles.photoImage} />
          ) : (
            <Text style={styles.photoPlaceholder}>＋</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadButton} onPress={onPickPhoto} accessibilityRole="button">
          <Text style={styles.uploadText}>⇧ Subir fotografía</Text>
          <Text style={styles.fileTypes}>JPG o PNG</Text>
        </TouchableOpacity>

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

export default function AgregarLugarScreen() {
  // Información del lugar
  const [nombre, setNombre] = useState('');
  const [siglo, setSiglo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Historia del lugar
  const [origen, setOrigen] = useState('');
  const [transformaciones, setTransformaciones] = useState('');
  const [significado, setSignificado] = useState('');

  // Fotografías
  const [fotografias, setFotografias] = useState([{ id: 1, uri: null, anio: '' }]);
  const [fotografiaActual, setFotografiaActual] = useState(null);

  // Ubicación
  const [region, setRegion] = useState(null);
  const [coordenadas, setCoordenadas] = useState(null);
  const [cargandoUbicacion, setCargandoUbicacion] = useState(true);

  useEffect(() => {
    obtenerUbicacion();
  }, []);

  // Obtener ubicación actual del dispositivo
  async function obtenerUbicacion() {
    try {
      setCargandoUbicacion(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permiso de ubicación',
          'Necesitamos acceso a tu ubicación para centrar el mapa. También puedes seleccionar una ubicación manualmente.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const nuevaUbicacion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCoordenadas(nuevaUbicacion);
      setRegion({ ...nuevaUbicacion, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      Alert.alert('Ubicación no disponible', 'No pudimos obtener tu ubicación. Intenta nuevamente.');
    } finally {
      setCargandoUbicacion(false);
    }
  }

  // Seleccionar una fotografía
  async function seleccionarFotografia() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para seleccionar fotografías.');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) {
      return null;
    }

    return result.assets[0].uri;
  }

  async function agregarFotografiaHistorica(id) {
    const uri = await seleccionarFotografia();
    if (!uri) return;

    setFotografias((actuales) => actuales.map((foto) => (foto.id === id ? { ...foto, uri } : foto)));
  }

  async function agregarFotografiaActual() {
    const uri = await seleccionarFotografia();
    if (uri) setFotografiaActual(uri);
  }

  function actualizarAnio(id, anio) {
    setFotografias((actuales) => actuales.map((foto) => (foto.id === id ? { ...foto, anio } : foto)));
  }

  function agregarCampoFotografia() {
    setFotografias((actuales) => [...actuales, { id: Date.now(), uri: null, anio: '' }]);
  }

  function eliminarFotografia(id) {
    setFotografias((actuales) => actuales.filter((foto) => foto.id !== id));
  }

  // En esta etapa valida el formulario.
  // La conexión con el endpoint se puede agregar posteriormente.
  function registrarLugar() {
    if (!nombre.trim() || !siglo || !direccion.trim()) {
      Alert.alert('Información incompleta', 'Completa el nombre, el siglo y la ubicación escrita.');
      return;
    }

    if (!coordenadas) {
      Alert.alert('Ubicación pendiente', 'Selecciona una ubicación en el mapa.');
      return;
    }

    const datosLugar = {
      nombre,
      siglo,
      direccion,
      descripcion,
      coordenadas,
      fotografias,
      fotografiaActual,
      historia: { origen, transformaciones, significado },
    };

    console.log('Datos del lugar:', datosLugar);

    Alert.alert('Formulario completado', 'Los datos están listos para conectarse con el backend.');
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
          {/* Encabezado */}
          <View style={styles.header}>
            <View>
              <Text style={styles.logo}>Retazo</Text>
            </View>

            <Text style={styles.userType}>Ente organizacional</Text>
          </View>

          <Text style={styles.title}>Agregar lugar histórico</Text>

          <Text style={styles.subtitle}>
            Completa la información y las fotografías para registrar el lugar en Retazo.
          </Text>

          {/* Datos del lugar */}
          <Seccion titulo="DATOS DEL LUGAR">
            <Campo
              label="Nombre del lugar"
              value={nombre}
              onChangeText={setNombre}
              placeholder="Escribe el nombre del lugar"
            />

            <SelectorSiglo siglo={siglo} onSelect={setSiglo} />

            <Campo
              label="Ubicación escrita"
              value={direccion}
              onChangeText={setDireccion}
              placeholder="Dirección, ciudad y país"
              multiline
              height={60}
            />

            {/* Mapa seleccionable */}
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
                <TouchableOpacity onPress={obtenerUbicacion} accessibilityRole="button">
                  <Text style={styles.retryText}>No se pudo obtener tu ubicación. Usar mi ubicación</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.helperText}>
                Toca el mapa o arrastra el marcador para indicar la ubicación exacta.
              </Text>

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

          {/* Fotografías históricas */}
          <Seccion
            titulo="FOTOGRAFÍAS HISTÓRICAS"
            descripcion="Agrega varias fotografías e indica el año de cada una."
          >
            {fotografias.map((foto) => (
              <TarjetaFotografia
                key={foto.id}
                foto={foto}
                puedeEliminar={fotografias.length > 1}
                onPickPhoto={() => agregarFotografiaHistorica(foto.id)}
                onChangeYear={(value) => actualizarAnio(foto.id, value)}
                onRemove={() => eliminarFotografia(foto.id)}
              />
            ))}

            <TouchableOpacity style={styles.addPhotoButton} onPress={agregarCampoFotografia} accessibilityRole="button">
              <Text style={styles.addPhotoText}>＋ Agregar otra fotografía</Text>
            </TouchableOpacity>
          </Seccion>

          {/* Fotografía actual */}
          <Seccion
            titulo="FOTOGRAFÍA ACTUAL"
            descripcion="Sube una fotografía del estado actual del lugar histórico."
          >
            <TouchableOpacity style={styles.currentPhoto} onPress={agregarFotografiaActual} accessibilityRole="button">
              {fotografiaActual ? (
                <Image source={{ uri: fotografiaActual }} style={styles.currentPhotoImage} />
              ) : (
                <>
                  <Text style={styles.currentPhotoIcon}>⇧</Text>
                  <Text style={styles.currentPhotoText}>Subir fotografía actual</Text>
                  <Text style={styles.fileTypes}>JPG o PNG</Text>
                </>
              )}
            </TouchableOpacity>
          </Seccion>

          {/* Historia */}
          <Seccion
            titulo="HISTORIA DEL LUGAR"
            descripcion="Cuenta la historia del lugar en los siguientes apartados."
          >
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

          {/* Botón de registro */}
          <TouchableOpacity style={styles.submitButton} onPress={registrarLugar} accessibilityRole="button">
            <Text style={styles.submitText}>Agregar lugar histórico</Text>
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
    minHeight: 43,
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  selectValue: {
    color: COLORS.muted,
    fontSize: 12,
  },

  selectArrow: {
    fontSize: 22,
    color: COLORS.muted,
  },

  centuries: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 8,
  },

  centuryOption: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: COLORS.paper,
  },

  centurySelected: {
    backgroundColor: COLORS.ink,
    borderColor: COLORS.ink,
  },

  centuryText: {
    fontSize: 11,
    color: COLORS.muted,
  },

  centurySelectedText: {
    color: COLORS.paper,
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

  photoPreview: {
    width: 55,
    height: 55,
    backgroundColor: COLORS.map,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  photoImage: {
    width: '100%',
    height: '100%',
  },

  photoPlaceholder: {
    fontSize: 30,
    color: '#C8B99E',
  },

  uploadButton: {
    flex: 1,
  },

  uploadText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '600',
  },

  fileTypes: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5,
  },

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

  currentPhoto: {
    height: 130,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.paper,
    overflow: 'hidden',
  },

  currentPhotoIcon: {
    color: COLORS.gold,
    fontSize: 30,
  },

  currentPhotoText: {
    color: COLORS.gold,
    fontSize: 12,
    marginTop: 5,
    fontWeight: '600',
  },

  currentPhotoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
});