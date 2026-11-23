package config

import com.google.auth.oauth2.AccessToken
import com.google.auth.oauth2.GoogleCredentials
import com.google.cloud.firestore.FirestoreOptions
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import org.slf4j.LoggerFactory
import java.io.File
import java.io.InputStream

private val log = LoggerFactory.getLogger("Firebase")

/**
 * Inicializa Firebase Admin una sola vez. Debe llamarse antes de crear cualquier repositorio.
 *
 * De dónde salen las credenciales, en este orden:
 *  1. FIRESTORE_EMULATOR_HOST (p. ej. "localhost:8081"): usa el emulador local de Firestore.
 *     No necesita clave; el id del proyecto sale de FIREBASE_PROJECT_ID (por defecto "retazo-local").
 *  2. FIREBASE_CREDENTIALS o GOOGLE_APPLICATION_CREDENTIALS: ruta a un serviceAccountKey.json
 *     fuera del proyecto (la opción más segura: la clave nunca queda dentro del código).
 *  3. src/main/resources/serviceAccountKey.json (ignorado por Git en .gitignore).
 */
fun initFirebase() {
    if (FirebaseApp.getApps().isNotEmpty()) return // evita doble inicialización

    val emulador = Env["FIRESTORE_EMULATOR_HOST"]
    val options = if (!emulador.isNullOrBlank()) {
        val proyecto = Env["FIREBASE_PROJECT_ID"] ?: "retazo-local"
        log.info("Usando el emulador de Firestore en {} (proyecto {})", emulador, proyecto)
        FirebaseOptions.builder()
            .setProjectId(proyecto)
            // El emulador no valida credenciales; se usa un token ficticio.
            .setCredentials(GoogleCredentials.create(AccessToken("emulador", null)))
            // Se indica explícitamente para que también funcione cuando la variable viene del .env.
            .setFirestoreOptions(FirestoreOptions.newBuilder().setEmulatorHost(emulador).build())
            .build()
    } else {
        FirebaseOptions.builder()
            .setCredentials(GoogleCredentials.fromStream(abrirClave()))
            .build()
    }
    FirebaseApp.initializeApp(options)
}

private fun abrirClave(): InputStream {
    val ruta = Env["FIREBASE_CREDENTIALS"] ?: Env["GOOGLE_APPLICATION_CREDENTIALS"]
    if (!ruta.isNullOrBlank()) {
        val archivo = File(ruta)
        require(archivo.isFile) { "No existe el archivo de credenciales indicado: $ruta" }
        log.info("Credenciales de Firebase desde {}", archivo.absolutePath)
        return archivo.inputStream()
    }
    return object {}.javaClass.getResourceAsStream("/serviceAccountKey.json")
        ?: error(
            "No se encontraron credenciales de Firebase. Coloca serviceAccountKey.json en " +
                "src/main/resources, define FIREBASE_CREDENTIALS con su ruta o usa el emulador " +
                "(FIRESTORE_EMULATOR_HOST). Ver backend/README.md.",
        )
}
