package routes

import controllers.LugarHistoricoController
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCall
import io.ktor.server.auth.authenticate
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.put
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import models.LugarHistorico
import models.enums.RolUsuario
import security.AUTH_JWT
import security.exigirRol
import service.ValidacionException

// Endpoints que espera el frontend (services/apiConfig.js, API_BASE_URL = http://host:8080):
//   GET    /api/places?query=&period=          -> lista filtrada            (pública)
//   GET    /api/places/nearby?lat=&lng=        -> lugares cercanos          (pública)
//   GET    /api/places/{id}                    -> detalle completo          (pública)
//   POST   /api/places                         -> crear                     (organización)
//   PUT    /api/places/{id}                    -> reemplazar                (organización)
//   DELETE /api/places/{id}                    -> eliminar                  (organización)
//
// Las rutas solo traducen HTTP <-> servicio. Los errores (400, 401, 403, 404, 409) los
// convierte StatusPages (ManejoErrores.kt), por eso aquí no hay try/catch.
//
// IMPORTANTE: configureSeguridad(tokens) debe ejecutarse ANTES que esta función.
fun Application.configureLugarHistoricoRoutes() {

    val controller = LugarHistoricoController()

    routing {
        route("/api/places") {

            // --- Públicas (lectura) -------------------------------------------

            // Buscar (RF-04, RF-05): ambos parámetros son opcionales.
            get {
                val query = call.request.queryParameters["query"]
                val periodo = call.request.queryParameters["period"]
                call.respond(controller.buscar(query, periodo))
            }

            // Cercanos (RF-01).
            get("nearby") {
                val params = call.request.queryParameters
                val lat = params["lat"]?.toDoubleOrNull()
                val lng = params["lng"]?.toDoubleOrNull()
                val maxMeters = params["maxMeters"]?.toDoubleOrNull()
                val limit = params["limit"]?.toIntOrNull()

                val errores = buildList {
                    if (lat == null) add("El parámetro lat es obligatorio y debe ser numérico.")
                    if (lng == null) add("El parámetro lng es obligatorio y debe ser numérico.")
                    if (params["maxMeters"] != null && maxMeters == null) add("maxMeters debe ser numérico.")
                    if (params["limit"] != null && limit == null) add("limit debe ser un entero.")
                }
                if (errores.isNotEmpty()) throw ValidacionException(errores)

                call.respond(
                    controller.cercanos(
                        lat = lat!!,
                        lng = lng!!,
                        maxMeters = maxMeters ?: DISTANCIA_POR_DEFECTO,
                        limit = limit ?: LIMITE_POR_DEFECTO,
                    ),
                )
            }

            get("{id}") {
                call.respond(controller.obtener(call.idDeLaRuta()))
            }

            // --- Protegidas (administración) ----------------------------------
            // 401 sin token válido; 403 si el rol no es ORGANIZACION.
            authenticate(AUTH_JWT) {

                post {
                    call.exigirRol(RolUsuario.ORGANIZACION)
                    val lugar = call.receive<LugarHistorico>()
                    call.respond(HttpStatusCode.Created, controller.crear(lugar))
                }

                put("{id}") {
                    call.exigirRol(RolUsuario.ORGANIZACION)
                    val lugar = call.receive<LugarHistorico>()
                    call.respond(controller.actualizar(call.idDeLaRuta(), lugar))
                }

                delete("{id}") {
                    call.exigirRol(RolUsuario.ORGANIZACION)
                    controller.eliminar(call.idDeLaRuta())
                    call.respond(HttpStatusCode.NoContent)
                }
            }
        }
    }
}

private const val DISTANCIA_POR_DEFECTO = 3000.0 // 3 km, como RF-01
private const val LIMITE_POR_DEFECTO = 3

private fun ApplicationCall.idDeLaRuta(): String =
    parameters["id"]?.takeIf { it.isNotBlank() }
        ?: throw ValidacionException(listOf("Falta el id del lugar en la ruta."))