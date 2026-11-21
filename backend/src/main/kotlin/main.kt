import com.google.auth.oauth2.GoogleCredentials
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.retazo.configureRouting
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import kotlinx.coroutines.runBlocking
import routes.*
import security.TokenService
import security.configureSeguridad
import service.PeriodoService
import java.io.FileInputStream

fun main() {
    embeddedServer(
        Netty,
        port = 8080,
        host = "0.0.0.0",
    ) {
        module()
    }.start(wait = true)
}

fun Application.module() {

    // 1. Firebase: debe inicializarse antes de crear cualquier repositorio.
    val serviceAccount = object {}.javaClass
        .getResourceAsStream("/serviceAccountKey.json")
        ?: error("No se encontró serviceAccountKey.json en resources")

    val options = FirebaseOptions.builder()
        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
        .build()

    FirebaseApp.initializeApp(options)


    // 2. Plugins generales
    install(CORS) {
        anyHost() // solo para desarrollo: en producción limita los orígenes permitidos
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization) // necesario para enviar el token JWT
    }
    install(ContentNegotiation) { json() }
    configureManejoErrores()

    // 3. Seguridad: antes de las rutas que usan authenticate { }
    val tokens = TokenService(
        System.getenv("JWT_SECRET") ?: error("Define la variable de entorno JWT_SECRET (mínimo 32 caracteres)."),
    )
    configureSeguridad(tokens)

    // 4. Datos iniciales: carga los 6 periodos si la colección está vacía
    runBlocking { PeriodoService().sembrarSiVacio() }

    // 5. Rutas
    configureRouting() // el "Hello, World!" de routing.kt; puedes borrarlo junto con su archivo
    configureLugarHistoricoRoutes()
    configurePeriodoRoutes()
    configureUsuarioRoutes(tokens)
    configureFavoritoRoutes()
}