# Base de datos de Retazo (Cloud Firestore)

Retazo guarda su información en **Cloud Firestore**, la base de datos de Firebase. Es una base de datos **no relacional (documental)**: no tiene tablas ni `CREATE TABLE`. Guarda **colecciones** de **documentos**, que son registros tipo JSON identificados por un id. Las colecciones se crean solas cuando se escribe el primer documento.

Por eso, los "scripts de creación y configuración" de esta base son:

| Archivo | Qué hace | Equivalente en SQL |
|---|---|---|
| `firestore.rules` | Reglas de seguridad: bloquean el acceso directo desde clientes; solo entra el backend. | `GRANT` / `REVOKE` |
| `firestore.indexes.json` | Configuración de índices. | `CREATE INDEX` |
| `../src/main/kotlin/database/Seed.kt` + `seed/lugares.json` (se ejecuta con `gradlew seed`) | Crea las colecciones y carga los datos iniciales. | `CREATE TABLE` + `INSERT` (seed) |
| `firebase.json` y `.firebaserc` | Proyecto de Firebase, despliegue de reglas e índices, y configuración del emulador local. | Configuración del servidor |
| `generarLugares.mjs` | Regenera `seed/lugares.json` a partir de `frontend/data/places.js` y de las fuentes del RAG. | — |
| `gradlew descargarImagenes` | Descarga las fotos de los lugares a `seed/imagenes/` y cambia sus URL por `/imagenes/...`, que sirve el backend. | — |

## Modelo de datos

```
usuarios/{correo}                       ← id = correo en minúsculas
 ├─ nombre: string
 ├─ correo: string
 ├─ contraseniaHash: string             ← BCrypt (costo 12); nunca se guarda la contraseña
 ├─ rol: "usuario" | "organizacion"
 ├─ createdAt: timestamp
 ├─ documentoTipo, documentoNombre,     ← solo organizaciones: metadatos del documento oficial
 │  documentoTamanio, documentoRuta     ← el archivo está en el servidor: uploads/<documentoRuta>
 ├─ estadoVerificacion: "pendiente" | "aprobada"   ← solo organizaciones
 └─ favoritos/{lugarId}                 ← subcolección; id = id del lugar (no se repite)
     └─ createdAt: timestamp

lugares/{slug}                          ← id = slug, p. ej. "plaza-bolivar"
 ├─ nombre, sector, ciudad, pais, descripcion: string
 ├─ siglo: "prehispanico" | "XVI" … "XX"   ← referencia a periodos/{id}
 ├─ epoca: string                       ← etiqueta legible, p. ej. "Siglo XVI"
 ├─ coords: { lat: number, lng: number }
 ├─ imagen, imagenActual: string | null ← URL (externa o /uploads/imagenes/… del backend)
 ├─ fotosHistoricas: [{ anio: string, uri: string | null }]
 ├─ historia: [{ titulo: string, texto: string }]
 └─ fuentes: [{ titulo, detalle, tipo: WEB|ARTICULO|LIBRO|ARCHIVO|ENTIDAD, url, verificada: bool }]

periodos/{id}                           ← id = "prehispanico", "XVI" …
 ├─ etiqueta: string                    ← "Siglo XVI"
 └─ orden: number                       ← orden en el filtro de Buscar
```

### Relaciones

En una base relacional estas relaciones serían llaves foráneas. Aquí las mantiene el backend:

| Relación | Cómo se representa | Quién la hace cumplir |
|---|---|---|
| Usuario 1 — N Favoritos | Subcolección `usuarios/{correo}/favoritos` | Al borrar la cuenta, `UsuarioRepository.delete` borra también la subcolección (Firestore no lo hace solo), y `UsuarioService.eliminar` borra el documento de la organización en `uploads/`. |
| Favorito N — 1 Lugar | El id del documento de favorito = id del lugar | `FavoritoRepository.add` verifica que el lugar exista. |
| Lugar N — 1 Periodo | Campo `siglo` = id del periodo | `LugarHistoricoService` valida el siglo, y `PeriodoService` impide borrar un periodo que usen lugares. |

**¿Por qué documental?** Una ficha de lugar se lee siempre completa: fotos, historia y fuentes juntas. Con documentos anidados esa ficha sale en **una sola lectura**, sin *joins*. A cambio, la integridad entre colecciones la garantiza el código del backend, como explica la tabla anterior.

### Índices

Firestore crea automáticamente un índice por cada campo. Las consultas del backend usan un solo campo cada una (`siglo` en lugares, `orden` en periodos y `createdAt` en favoritos), así que **no se necesitan índices compuestos**. `firestore.indexes.json` excluye de la indexación los textos largos (`descripcion` e `historia`): nunca se filtra por ellos y así se ahorra espacio.

### Fotos de los lugares de prueba

Las fotos de los 10 lugares se guardan **dentro del proyecto**, en `seed/imagenes/`, y el backend las sirve en `http://<servidor>:8080/imagenes/<archivo>`. En Firestore quedan como rutas relativas (`/imagenes/plaza-bolivar-imagen.jpg`) y la app les antepone la dirección del servidor. Así no dependen de que otros sitios mantengan sus enlaces: los de Facebook, por ejemplo, **vencen a los pocos días**. `seed/imagenes/CREDITOS.md` dice de dónde salió cada foto.

Para actualizarlas: cambia las URL en `frontend/data/places.js`, ejecuta `node backend/database/generarLugares.mjs`, luego `gradlew descargarImagenes` y luego `gradlew seed`. Las fotos históricas que tienen `uri: null` aparecen en la app como "pendiente".

### Archivos subidos por los usuarios (documentos e imágenes)

Firebase Storage exige el plan de pago **Blaze** desde febrero de 2026. Por eso los archivos se guardan **en el servidor Ktor**:

- `backend/uploads/documentos/`: documentos oficiales de las organizaciones. Son **privados**: no se publican.
- `backend/uploads/imagenes/`: fotos de lugares que suben las organizaciones. Son públicas en `http://<servidor>:8080/uploads/imagenes/<archivo>`.

En Firestore solo se guarda la ruta o la URL. La carpeta `uploads/` está en `.gitignore`.

## Cómo crear y configurar la base

### Opción A — Proyecto real de Firebase

1. En <https://console.firebase.google.com> crea un proyecto (o usa `retazo-d93fb`) → **Firestore Database** → **Crear base de datos** (modo producción). Es gratis con el plan Spark.
2. **Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada.** Guarda el JSON como `backend/src/main/resources/serviceAccountKey.json`, o fuera del proyecto, indicando su ruta en `FIREBASE_CREDENTIALS` dentro de `backend/.env`. **Nunca lo subas a GitHub.**
3. Publica las reglas y los índices. Desde `backend/database`, con Node instalado:
   ```powershell
   npx firebase-tools login
   npx firebase-tools deploy --only firestore --project retazo-d93fb
   ```
   También se puede hacer a mano: Firestore → **Reglas** → pegar `firestore.rules` → Publicar.
4. Carga los datos iniciales. Desde `backend`:
   ```powershell
   .\gradlew.bat seed
   ```
   Crea los 6 periodos, los 10 lugares (con sus fuentes) y dos usuarios de prueba:
   `demo@retazo.com` (usuario) y `ente@retazo.org` (organización), los dos con la contraseña `Retazo123`.
   Es seguro repetirlo: crea lo que falta y actualiza los lugares.
   Para **borrar todo y cargar de nuevo**: `.\gradlew.bat seed -Preset=true` (⚠ borra lugares, periodos y usuarios).

### Opción B — Emulador local (sin clave ni cuenta de Google)

Necesita Node y Java 21.

```powershell
cd backend\database
npx firebase-tools emulators:start --only firestore --project retazo-local
```

Deja esa terminal abierta. El emulador queda en `127.0.0.1:8081`, con un panel en <http://127.0.0.1:4000/firestore>. Luego, en `backend/.env`:

```
FIRESTORE_EMULATOR_HOST=127.0.0.1:8081
```

y en otra terminal, desde `backend`: `.\gradlew.bat seed` y `.\gradlew.bat run`. Los datos del emulador se borran al cerrarlo.
