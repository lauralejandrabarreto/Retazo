# Retazo — Backend (Ktor + Firestore + RAG)

API REST de Retazo en **Kotlin con Ktor 3**. Persiste en **Cloud Firestore** (Firebase Admin SDK), autentica con **JWT** y BCrypt, guarda archivos en el servidor e incluye el **asistente histórico con RAG**.

## Requisitos

- **JDK 21.** Compruébalo con `java -version`. Si no lo tienes, instala [Eclipse Temurin 21](https://adoptium.net/).
- No hace falta instalar Gradle: `gradlew` / `gradlew.bat` lo descarga la primera vez.
- Una base de datos Firestore: el proyecto real de Firebase o el emulador local. Ver [`database/README.md`](database/README.md).

## Configuración: archivo `backend/.env`

Crea `backend/.env`, que **no se sube a GitHub**, con:

```
# Obligatorio: secreto para firmar los tokens (mínimo 32 caracteres)
JWT_SECRET=pon-aqui-un-texto-largo-y-aleatorio-de-al-menos-32-caracteres

# Base de datos: elige UNA opción
# a) Proyecto real: deja serviceAccountKey.json en src/main/resources/ o indica su ruta:
# FIREBASE_CREDENTIALS=C:/claves/serviceAccountKey.json
# b) Emulador local (no necesita clave):
# FIRESTORE_EMULATOR_HOST=127.0.0.1:8081

# Opcional: IA del asistente histórico (clave gratuita en https://console.groq.com/keys)
# GROQ_API_KEY=gsk_...
```

Las variables también se pueden definir como variables de entorno del sistema, y esas tienen prioridad sobre el `.env`.

## Ejecutar

```powershell
cd backend
.\gradlew.bat descargarImagenes   # solo si cambian las fotos: las baja a database/seed/imagenes
.\gradlew.bat seed     # solo la primera vez: crea y carga la base de datos
.\gradlew.bat run      # inicia el servidor en http://0.0.0.0:8080
```

Queda listo cuando aparece `Responding at http://0.0.0.0:8080`. Para comprobarlo, abre <http://localhost:8080/api/places>. Si Windows pregunta por el Firewall, permite el acceso en **redes privadas**: si no, el celular no podrá conectarse.

## Endpoints

| Método | Ruta | Acceso | Uso |
|---|---|---|---|
| POST | `/api/auth/registro` | público | Registro de persona → `{ token, usuario }` |
| POST | `/api/auth/register-org` | público | Registro de organización (multipart: `nombre`, `correo`, `contrasenia`, `documento` PDF/JPG/PNG ≤ 10 MB) |
| POST | `/api/auth/login` | público | Inicio de sesión → `{ token, usuario }` |
| GET / PUT / DELETE | `/api/usuarios/me` | token | Ver perfil / cambiar nombre / eliminar cuenta (con sus favoritos y su documento) |
| GET | `/api/places?query=&period=` | público | Buscar lugares |
| GET | `/api/places/nearby?lat=&lng=&maxMeters=&limit=` | público | Lugares cercanos → `[{ lugar, distancia }]` |
| GET | `/api/places/{id}` | público | Ficha completa |
| POST / PUT / DELETE | `/api/places[/{id}]` | organización | Crear / reemplazar / eliminar lugar |
| GET | `/api/periods` | público | Periodos del filtro |
| GET / POST / DELETE | `/api/favoritos[/{lugarId}]` | token | Favoritos del usuario |
| POST | `/api/uploads/imagenes` | organización | Subir foto (multipart `imagen`, JPG/PNG ≤ 5 MB) → `{ url }` |
| GET | `/uploads/imagenes/{archivo}` | público | Ver una foto subida |
| GET | `/imagenes/{archivo}` | público | Fotos de los lugares de prueba (`database/seed/imagenes`) |
| POST | `/api/places/{id}/ask` | público | Asistente histórico (RAG) `{ "pregunta": "..." }` |
| GET | `/api/rag/estado` | público | Documentos del RAG y si la IA está configurada |

Errores: `400` datos inválidos, `401` sin sesión, `403` rol sin permiso, `404` no existe, `409` ya existe. Todos responden `{ mensaje, errores }`.

## Arquitectura

```
src/main/kotlin/
├── main.kt                 # arranque: Firebase, CORS, JSON, errores, JWT y rutas
├── config/                 # FirebaseConfig (clave o emulador), Env (lee .env)
├── security/Seguridad.kt   # emisión y validación de JWT, control de roles
├── routes/                 # HTTP ↔ controladores (Usuario, LugarHistorico, Periodo, Favorito, Archivo, Rag)
├── controllers/            # puente entre rutas y servicios
├── service/                # reglas de negocio y validación; AlmacenArchivos (uploads/)
├── repository/             # acceso a Firestore (colecciones usuarios, lugares, periodos)
├── models/                 # modelos serializables (kotlinx.serialization)
├── rag/                    # asistente histórico: Corpus, BM25, cliente LLM, RagService
└── database/Seed.kt        # script de carga inicial (gradlew seed)
src/main/resources/
├── application.yaml        # puerto y módulo de Ktor
├── corpus/*.md             # 16 fuentes históricas del RAG
└── serviceAccountKey.json  # (NO incluido: credencial privada, ver database/README.md)
database/                   # reglas, índices, configuración de Firebase y datos iniciales
```

## Asistente histórico (RAG)

`POST /api/places/{id}/ask` responde preguntas sobre un lugar **usando solo sus fuentes** y citándolas `[n]`:

1. **Recuperar.** BM25 busca, entre las fuentes de ese lugar (`resources/corpus`, un `.md` por fuente dividido por secciones `##`), los 4 fragmentos más relacionados con la pregunta. Antes de comparar, quita tildes y palabras vacías y reduce cada palabra a su raíz.
2. **Aumentar.** Esos fragmentos, numerados, se insertan en las instrucciones del modelo.
3. **Generar.** El modelo (Groq, `openai/gpt-oss-120b`) responde solo con esa información y cita cada dato. Si no hay `GROQ_API_KEY`, o si el modelo falla, responde en **modo extractivo** con las frases más relevantes. Si las fuentes no hablan del tema, lo dice (`sin_resultados`).

Las fuentes son resúmenes en español elaborados a partir de Wikipedia, sitios oficiales y prensa. Cada archivo indica su URL, su licencia y su fecha de consulta. Para agregar una fuente, se crea un `.md` con el mismo encabezado y se reinicia el servidor.

## Pruebas

```powershell
.\gradlew.bat test
```

Son 7 pruebas del asistente (corpus, BM25, validaciones, modo generativo con un modelo simulado y respaldo si el modelo falla). No necesitan Firebase.
