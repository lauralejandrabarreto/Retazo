# Retazo

Aplicación móvil de memoria urbana para explorar lugares históricos y ver cómo han cambiado con el tiempo. Proyecto de la asignatura **Desarrollo de Aplicaciones Móviles** (Ingeniería de Sistemas, Fundación Universitaria Konrad Lorenz).

**Integrantes:** Laura Alejandra Barreto Niño (506222707) · Aída Aracely Gálvez Sánchez (506262027)

Esta versión corresponde a la **segunda entrega**: frontend en React Native con datos locales de prueba. El backend en Ktor todavía no está implementado.

## Tecnologías

| Elemento | Versión |
|---|---|
| Expo SDK | 57 (`expo@57`) |
| React Native | 0.86.3 |
| React | 19.2.3 |
| Navegación | React Navigation 7 (`native-stack` + `bottom-tabs`) |
| Persistencia local | `@react-native-async-storage/async-storage` 2.2.0 |
| UI | `expo-linear-gradient`, `@expo/vector-icons` (Feather, Ionicons), fuentes Playfair Display, Inter y DM Mono (`@expo-google-fonts`) |

El proyecto usa **Expo (flujo administrado)**. No contiene carpetas `android/` ni `ios/`, que Expo genera solo si se hace una compilación nativa.

## Requisitos previos

- **Node.js 20 LTS o superior** y npm.
- Para probar en un celular: la app **Expo Go** compatible con el SDK 57 (Android o iOS), con el celular y el computador en la misma red Wi‑Fi.
- Para el emulador: **Android Studio** con un dispositivo virtual (AVD) creado y encendido.

## Instalación

```bash
git clone https://github.com/lauralejandrabarreto/Retazo.git
cd Retazo
npm install
```

> Si se agregan dependencias nuevas, se recomienda `npx expo install <paquete>` para que Expo elija la versión compatible con el SDK 57.

## Ejecución

```bash
npm start            # equivale a: npx expo start
```

En la terminal aparece un código QR y un menú:

| Entorno | Cómo abrir la app |
|---|---|
| **Celular Android/iOS (Expo Go)** | Escanear el QR con Expo Go (Android) o con la cámara (iOS). |
| **Emulador Android** | Con el emulador encendido, presionar `a` en la terminal, o ejecutar `npm run android`. |
| **Navegador web** | Presionar `w`, o ejecutar `npm run web`. Sirve para revisar rápido; la plataforma objetivo es móvil. |

Si el celular no se conecta por la red local, ejecutar `npx expo start --tunnel`.

## Estructura del proyecto

```
retazo/
├── App.js                 # punto de entrada: fuentes, SafeAreaProvider, FavoritesProvider, NavigationContainer
├── index.js               # registro del componente raíz (Expo)
├── theme.js               # paleta, tipografía y espaciados
├── navigation/
│   └── AppNavigator.js    # Native Stack + Bottom Tabs
├── screens/               # P-01 a P-06
│   ├── inicioScreen.js
│   ├── buscarScreen.js
│   ├── lugarHistoricoScreen.js
│   ├── comparacionScreen.js
│   ├── historiaLugarScreen.js
│   └── favoritosScreen.js
├── components/            # PlaceCard, PlaceImage, Chip, Divider, BeforeAfterSlider,
│                          # NoticeBox, Toast, StateMessage, FocusAwareStatusBar
├── context/
│   └── FavoritesContext.js  # estado global de favoritos + AsyncStorage
├── hooks/
│   ├── useAsync.js        # estados de carga / error / datos
│   └── usePlace.js
├── services/
│   ├── placesService.js   # única puerta de acceso a los datos
│   └── apiConfig.js       # configuración prevista para la API en Ktor
├── data/
│   └── places.js          # datos locales de prueba
├── utils/
│   ├── text.js            # normalización de texto (búsqueda sin tildes)
│   └── geo.js             # distancia (Haversine) y formato
└── assets/                # íconos y splash
```

## Funcionalidades implementadas

| Pantalla | Funcionalidad |
|---|---|
| P-01 Inicio | Mapa **esquemático**: los pines se ubican según las coordenadas de cada lugar respecto a una **ubicación simulada** en el centro de Bogotá. Lista de lugares a menos de 3 km, con su distancia calculada. Acceso a Buscar. |
| P-02 Buscar | Búsqueda por nombre, sector o ciudad (sin distinguir tildes ni mayúsculas) combinada con un filtro por periodo. Contador de resultados, estado vacío y botón "Limpiar filtros". |
| P-03 Lugar histórico | Ficha del lugar seleccionado. Botón ♥ para agregar o quitar de favoritos, con mensaje de confirmación. Accesos a Comparación e Historia. |
| P-04 Comparación | Divisor deslizable antes/después y selección de fotografías por año. Los años sin imagen se marcan como "pendiente". |
| P-05 Historia | Secciones narrativas y fuentes. Si el contenido no está verificado, la pantalla lo indica y no muestra fuentes inventadas. |
| P-06 Favoritos | Lista de lugares guardados, persistente entre sesiones (AsyncStorage). Opción para quitar un lugar y estado vacío con acceso a Buscar. |
| Transversal | Estados de carga, vacío y error; imágenes con respaldo cuando no cargan; etiquetas de accesibilidad en los botones. |

### Cómo conectar la API en Ktor (siguiente etapa)

1. Implementar en Ktor los endpoints `GET /places`, `GET /places/{id}` y `GET /places/nearby?lat=&lng=` con la misma forma de objeto de `data/places.js`.
2. En `services/apiConfig.js`, cambiar `USE_MOCK_DATA` a `false` y ajustar `API_BASE_URL` (en el emulador Android, `10.0.2.2` apunta al `localhost` del computador).
3. Las pantallas no requieren cambios, porque solo consumen `services/placesService.js`.

## Pruebas realizadas

- Compilación del bundle de JavaScript para Android (`npx expo export --platform android`) y para web, sin errores.
- 29 pruebas automatizadas de extremo a extremo con Playwright sobre la versión web: navegación entre las 6 pantallas, botones de regreso, búsqueda y filtros, slider, favoritos (incluida la persistencia al recargar) y estados vacíos.
- **Pendiente:** verificación manual en Expo Go o en un emulador Android.

## Limitaciones conocidas y trabajo pendiente

- **Mapa real y geolocalización:** no implementados. La ubicación es simulada y el mapa es esquemático.
- **Imágenes:** son fotografías ilustrativas de Unsplash que **no corresponden** a los lugares ni a las épocas indicadas. Se cargan desde internet; sin conexión se muestra un marcador "No se pudo cargar la imagen".
- **Contenido histórico:** las descripciones son preliminares (`contenidoVerificado: false`) y todavía no tienen fuentes asociadas.
- **Backend Ktor y pipeline RAG:** pendientes. La capa `services/` está preparada para conectarlos.
- Los datos mezclan lugares de Bogotá y de Honduras. Los "lugares cercanos" se calculan solo respecto a la ubicación simulada en Bogotá.
