package routes

import io.ktor.http.HttpStatusCode
import io.ktor.http.content.PartData
import io.ktor.http.content.forEachPart
import io.ktor.server.application.Application
import io.ktor.server.auth.authenticate
import io.ktor.server.http.content.staticFiles
import io.ktor.server.plugins.origin
import io.ktor.server.request.receiveMultipart
import io.ktor.server.response.respond
import io.ktor.server.routing.post
import io.ktor.server.routing.routing
import io.ktor.utils.io.jvm.javaio.toInputStream
import kotlinx.serialization.Serializable
import models.enums.RolUsuario
import security.AUTH_JWT
import security.exigirRol
import service.AlmacenArchivos
import service.ValidacionException

@Serializable
data class ImagenSubida(val url: String, val nombre: String)

const val MAX_MB_IMAGEN = 5
const val MAX_BYTES_IMAGEN = MAX_MB_IMAGEN * 1024 * 1024

// Subida de fotografías de lugares (pantalla "Agregar lugar histórico").
//
//   POST /api/uploads/imagenes   multipart con el campo "imagen"  (organización)
//        -> { "url": "http://<servidor>/uploads/imagenes/<archivo>.jpg", "nombre": "..." }
//   GET  /uploads/imagenes/<archivo>                               (pública)
//
// La URL devuelta se guarda en el lugar (imagen, imagenActual o fotosHistoricas[].uri).
// Solo se publica la carpeta de imágenes; los documentos de organizaciones no.
fun Application.configureArchivoRoutes(almacen: AlmacenArchivos = AlmacenArchivos()) {
    almacen.imagenes.mkdirs()

    routing {
        staticFiles("/uploads/imagenes", almacen.imagenes)

        authenticate(AUTH_JWT) {
            post("/api/uploads/imagenes") {
                call.exigirRol(RolUsuario.ORGANIZACION)

                var bytes: ByteArray? = null
                call.receiveMultipart().forEachPart { part ->
                    try {
                        if (part is PartData.FileItem && part.name == "imagen") {
                            // Se lee como máximo límite + 1 bytes para detectar archivos demasiado grandes.
                            bytes = part.provider().toInputStream().use { it.readNBytes(MAX_BYTES_IMAGEN + 1) }
                        }
                    } finally {
                        part.dispose()
                    }
                }

                val datos = bytes
                val tipo = datos?.let { AlmacenArchivos.detectarTipo(it) }
                val error = when {
                    datos == null || datos.isEmpty() -> "Falta la imagen (campo \"imagen\")."
                    datos.size > MAX_BYTES_IMAGEN -> "La imagen no puede superar los $MAX_MB_IMAGEN MB."
                    tipo == null || tipo.first == "pdf" -> "La imagen debe ser JPG o PNG."
                    else -> null
                }
                if (error != null) throw ValidacionException(listOf(error))

                val nombre = almacen.guardar(almacen.imagenes, datos!!, tipo!!.first)
                val origen = call.request.origin
                val puerto = if (origen.serverPort in listOf(80, 443)) "" else ":${origen.serverPort}"
                val url = "${origen.scheme}://${origen.serverHost}$puerto/uploads/imagenes/$nombre"
                call.respond(HttpStatusCode.Created, ImagenSubida(url, nombre))
            }
        }
    }
}
