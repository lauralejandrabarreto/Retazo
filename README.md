# Retazo

Aplicación móvil de memoria urbana para explorar lugares históricos, ver cómo han cambiado con el tiempo y preguntar por su historia. Proyecto final de **Desarrollo de Aplicaciones Móviles** (Ingeniería de Sistemas, Fundación Universitaria Konrad Lorenz).

**Integrantes:** Laura Alejandra Barreto Niño (506222707) · Aída Aracely Gálvez Sánchez (506262027)

| Parte | Carpeta | Tecnología |
|---|---|---|
| App móvil | [`frontend/`](frontend/README.md) | React Native 0.86 + Expo SDK 57 |
| API REST | [`backend/`](backend/README.md) | Kotlin + Ktor 3, JWT, Firebase Admin SDK |
| Base de datos | [`backend/database/`](backend/database/README.md) | Cloud Firestore (reglas, índices y script de carga) |
| Asistente histórico | `backend/src/main/kotlin/rag/` | RAG: BM25 + modelo de lenguaje (Groq) |

```
App (Expo) ──HTTP/JSON + JWT──► Ktor :8080 ──Admin SDK──► Cloud Firestore
                                   ├── uploads/ (fotos y documentos)
                                   └── RAG ──► fuentes (corpus) + Groq (opcional)
```

## Puesta en marcha (Windows)

Requisitos: **Node.js 20+**, **JDK 21** y la app **Expo Go**, o un emulador Android.

> Si PowerShell dice "la ejecución de scripts está deshabilitada", usa `npm.cmd` / `npx.cmd`, o ejecuta una vez `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

1. **Base de datos.** Elige una opción (detalles en [`backend/database/README.md`](backend/database/README.md)):
   - Proyecto real: coloca `serviceAccountKey.json` en `backend/src/main/resources/`.
   - Emulador sin clave: en otra terminal ejecuta `cd backend\database` y luego `npx firebase-tools emulators:start --only firestore --project retazo-local`.
2. **Backend.** Crea `backend/.env` (plantilla en [`backend/README.md`](backend/README.md)) y luego:
   ```powershell
   cd backend
   .\gradlew.bat seed   # primera vez: crea y carga la base
   .\gradlew.bat run
   ```
3. **App.**
   ```powershell
   cd frontend
   npm install
   npx expo start
   ```
   Escanea el QR con Expo Go, con el celular en la misma red Wi‑Fi. La app encuentra el backend usando la IP del computador.

Usuarios de prueba (los crea `gradlew seed`), con la contraseña `Retazo123`: `demo@retazo.com` (usuario) y `ente@retazo.org` (organización).
