package routes

import controllers.FavoritosController
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCall
import io.ktor.server.auth.authenticate
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import kotlinx.serialization.Serializable
import models.FavoritoRequest
import security.AUTH_JWT
import security.usuarioAutenticado
import service.ValidacionException

@Serializable
data class EstadoFavorito(
    val lugarId: String,
    val favorito: Boolean,
)

// Todas las rutas requieren el encabezado  Authorization: Bearer <token>.
// El usuario sale del token (no de la URL), así cada persona solo ve sus favoritos.
//
//   GET    /api/favoritos              -> lugares favoritos (resúmenes, el más reciente primero)
//   GET    /api/favoritos/{lugarId}    -> { lugarId, favorito } (para el corazón de la ficha)
//   POST   /api/favoritos              -> guarda { "lugarId": "..." }
//   DELETE /api/favoritos/{lugarId}    -> quita el favorito
//
// Los errores (400, 401, 404) los convierte StatusPages (ver ManejoErrores.kt).
//
// IMPORTANTE: configureSeguridad(tokens) debe ejecutarse ANTES que esta función.
fun Application.configureFavoritoRoutes() {

    val controller = FavoritosController()

    routing {
        authenticate(AUTH_JWT) {
            route("/api/favoritos") {

                get {
                    call.respond(controller.listar(call.usuarioAutenticado()))
                }

                get("{lugarId}") {
                    val lugarId = call.lugarIdDeLaRuta()
                    call.respond(EstadoFavorito(lugarId, controller.esFavorito(call.usuarioAutenticado(), lugarId)))
                }

                // Idempotente: guardar dos veces el mismo lugar no cambia nada, por eso responde 200.
                post {
                    val lugarId = call.receive<FavoritoRequest>().lugarId
                    controller.agregar(call.usuarioAutenticado(), lugarId)
                    call.respond(HttpStatusCode.OK, EstadoFavorito(lugarId.trim().lowercase(), true))
                }

                delete("{lugarId}") {
                    controller.quitar(call.usuarioAutenticado(), call.lugarIdDeLaRuta())
                    call.respond(HttpStatusCode.NoContent)
                }
            }
        }
    }
}

private fun ApplicationCall.lugarIdDeLaRuta(): String =
    parameters["lugarId"]?.takeIf { it.isNotBlank() }
        ?: throw ValidacionException(listOf("Falta el id del lugar en la ruta."))