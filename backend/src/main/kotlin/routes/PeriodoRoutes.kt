package routes

import controllers.PeriodoController
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
import models.Periodo
import models.enums.RolUsuario
import security.AUTH_JWT
import security.exigirRol
import service.ValidacionException

// Endpoints:
//   GET    /api/periods         -> periodos ordenados (alimenta el filtro de Buscar)   (pública)
//   GET    /api/periods/{id}    -> un periodo                                          (pública)
//   POST   /api/periods         -> crear                                               (organización)
//   PUT    /api/periods/{id}    -> reemplazar                                          (organización)
//   DELETE /api/periods/{id}    -> eliminar                                            (organización)
//
// La opción "Todos" del filtro NO viene de aquí: el frontend la agrega delante de la lista.
// Los errores (400, 401, 403, 404, 409) los convierte StatusPages (ManejoErrores.kt).
//
// IMPORTANTE: configureSeguridad(tokens) debe ejecutarse ANTES que esta función.
fun Application.configurePeriodoRoutes() {

    val controller = PeriodoController()

    routing {
        route("/api/periods") {

            // --- Públicas (lectura): el filtro de Buscar funciona sin iniciar sesión ---

            get {
                call.respond(controller.listar())
            }

            get("{id}") {
                call.respond(controller.obtener(call.idDeLaRuta()))
            }

            // --- Protegidas (administración) -----------------------------------------
            // 401 sin token válido; 403 si el rol no es ORGANIZACION.
            authenticate(AUTH_JWT) {

                post {
                    call.exigirRol(RolUsuario.ORGANIZACION)
                    val periodo = call.receive<Periodo>()
                    call.respond(HttpStatusCode.Created, controller.crear(periodo))
                }

                put("{id}") {
                    call.exigirRol(RolUsuario.ORGANIZACION)
                    val periodo = call.receive<Periodo>()
                    call.respond(controller.actualizar(call.idDeLaRuta(), periodo))
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

private fun ApplicationCall.idDeLaRuta(): String =
    parameters["id"]?.takeIf { it.isNotBlank() }
        ?: throw ValidacionException(listOf("Falta el id del periodo en la ruta."))