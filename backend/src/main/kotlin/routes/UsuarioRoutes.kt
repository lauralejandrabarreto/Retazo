package routes

import controllers.UsuarioController
import io.ktor.http.HttpStatusCode
import io.ktor.http.content.PartData
import io.ktor.http.content.forEachPart
import io.ktor.http.content.streamProvider
import io.ktor.server.application.Application
import io.ktor.server.auth.authenticate
import io.ktor.server.request.receive
import io.ktor.server.request.receiveMultipart
import io.ktor.server.response.respond
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.put
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import kotlinx.serialization.Serializable
import models.DocumentoAdjunto
import models.LoginRequest
import models.Usuario
import models.UsuarioPerfil
import security.AUTH_JWT
import security.TokenService
import security.usuarioAutenticado
import service.UsuarioService

@Serializable
data class SesionResponse(
    val token: String,
    val usuario: UsuarioPerfil,
)

@Serializable
data class ActualizarNombreRequest(
    val nombre: String,
)

const val MAX_MB_DOCUMENTO = 10
const val MAX_BYTES_DOCUMENTO = MAX_MB_DOCUMENTO * 1024 * 1024

// Endpoints:
//   POST   /api/auth/registro   -> crea la cuenta y devuelve { token, usuario }   (público)
//   POST   /api/auth/login      -> inicia sesión y devuelve { token, usuario }    (público)
//   GET    /api/usuarios/me     -> perfil del usuario autenticado                 (requiere token)
//   PUT    /api/usuarios/me     -> cambia el nombre { "nombre": "..." }           (requiere token)
//   DELETE /api/usuarios/me     -> elimina la cuenta y sus favoritos              (requiere token)
//
// Rutas protegidas: enviar el encabezado  Authorization: Bearer <token>.
// No hay ids en la URL: el usuario sale del token, así nadie puede tocar la cuenta de otro.
fun Application.configureUsuarioRoutes(tokens: TokenService) {

    val controller = UsuarioController()

    routing {

        route("/api/auth") {

            post("registro") {
                val perfil = controller.registrar(call.receive<Usuario>())
                call.respond(HttpStatusCode.Created, SesionResponse(tokens.generar(perfil), perfil))
            }

            post("register-org") {
                var nombre = ""
                var correo = ""
                var contrasenia = ""
                var documento: DocumentoAdjunto? = null

                call.receiveMultipart().forEachPart { part ->
                    try {
                        when (part) {
                            is PartData.FormItem -> when (part.name) {
                                "nombre" -> nombre = part.value
                                "correo" -> correo = part.value
                                "contrasenia" -> contrasenia = part.value
                            }
                            is PartData.FileItem -> if (part.name == "documento") {
                                // Se lee como máximo límite + 1 bytes para no cargar archivos enormes en memoria.
                                val bytes = part.streamProvider().use { it.readNBytes(MAX_BYTES_DOCUMENTO + 1) }
                                documento = DocumentoAdjunto(part.originalFileName ?: "documento", bytes)
                            }
                            else -> Unit
                        }
                    } finally {
                        part.dispose()
                    }
                }

                val perfil = controller.registrarOrganizacion(nombre, correo, contrasenia, documento)
                // Cuenta pendiente de verificación, pero se entrega token (el MVP no distingue estados).
                call.respond(HttpStatusCode.Created, SesionResponse(tokens.generar(perfil), perfil))
            }

            post("login") {
                val credenciales = call.receive<LoginRequest>()
                val perfil = controller.iniciarSesion(credenciales.correo, credenciales.contrasenia)
                call.respond(SesionResponse(tokens.generar(perfil), perfil))
            }
        }

        authenticate(AUTH_JWT) {
            route("/api/usuarios/me") {

                get {
                    call.respond(controller.obtener(call.usuarioAutenticado()))
                }

                put {
                    val cuerpo = call.receive<ActualizarNombreRequest>()
                    call.respond(controller.actualizarNombre(call.usuarioAutenticado(), cuerpo.nombre))
                }

                delete {
                    controller.eliminar(call.usuarioAutenticado())
                    call.respond(HttpStatusCode.NoContent)
                }
            }
        }
    }
}