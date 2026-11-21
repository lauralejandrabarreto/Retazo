package service

// Errores de negocio que lanzan los servicios. Las rutas no necesitan try/catch:
// un único StatusPages los convierte en respuestas HTTP.
sealed class ServicioException(mensaje: String) : RuntimeException(mensaje)

/** Datos de entrada incorrectos -> 400 Bad Request. */
class ValidacionException(val errores: List<String>) : ServicioException(errores.joinToString(" "))

/** El recurso pedido no existe -> 404 Not Found. */
class NoEncontradoException(mensaje: String) : ServicioException(mensaje)

/** El recurso ya existe -> 409 Conflict. */
class ConflictoException(mensaje: String) : ServicioException(mensaje)