package routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.BadRequestException
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.response.respond
import kotlinx.serialization.Serializable
import service.ConflictoException
import service.NoEncontradoException
import service.ValidacionException
import service.NoAutenticadoException

@Serializable
data class RespuestaError(
    val mensaje: String,
    val errores: List<String> = emptyList(),
)

// Convierte las excepciones del servicio en respuestas HTTP. Se instala una sola vez.
fun Application.configureManejoErrores() {
    install(StatusPages) {
        exception<ValidacionException> { call, e ->
            call.respond(HttpStatusCode.BadRequest, RespuestaError("Datos no válidos.", e.errores))
        }
        exception<NoEncontradoException> { call, e ->
            call.respond(HttpStatusCode.NotFound, RespuestaError(e.message ?: "No encontrado."))
        }
        exception<ConflictoException> { call, e ->
            call.respond(HttpStatusCode.Conflict, RespuestaError(e.message ?: "Conflicto."))
        }
        // JSON mal formado o con campos faltantes en POST/PUT.
        exception<BadRequestException> { call, _ ->
            call.respond(HttpStatusCode.BadRequest, RespuestaError("Solicitud mal formada: revisa el JSON enviado."))
        }
        // Cualquier otro fallo (Firestore caído, etc.): se registra y no se expone el detalle.
        exception<Throwable> { call, cause ->
            call.application.environment.log.error("Error no controlado", cause)
            call.respond(HttpStatusCode.InternalServerError, RespuestaError("Error interno del servidor."))
        }
        exception<NoAutenticadoException> { call, e ->
            call.respond(HttpStatusCode.Unauthorized, RespuestaError(e.message ?: "No autenticado."))
        }
    }
}