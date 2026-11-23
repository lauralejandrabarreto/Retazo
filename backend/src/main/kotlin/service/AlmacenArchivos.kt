package service

import config.Env
import java.io.File
import java.util.UUID

/**
 * Guarda archivos en una carpeta del servidor (no en Firebase Storage, que exige el
 * plan de pago Blaze). En Firestore solo se guarda la ruta del archivo.
 *
 *   uploads/documentos/  -> documentos oficiales de las organizaciones (privados, no se publican)
 *   uploads/imagenes/    -> fotografías de lugares (públicas en /uploads/imagenes/...)
 *
 * La carpeta base se puede cambiar con la variable de entorno UPLOADS_DIR.
 */
class AlmacenArchivos(
    val base: File = File(Env["UPLOADS_DIR"] ?: "uploads"),
) {
    val documentos: File get() = File(base, "documentos")
    val imagenes: File get() = File(base, "imagenes")

    /** Guarda [bytes] con un nombre aleatorio y devuelve el nombre del archivo creado. */
    fun guardar(carpeta: File, bytes: ByteArray, extension: String, prefijo: String = ""): String {
        carpeta.mkdirs()
        val seguro = prefijo.lowercase().replace(Regex("[^a-z0-9]+"), "-").trim('-').take(40)
        val nombre = listOf(seguro, UUID.randomUUID().toString()).filter { it.isNotEmpty() }
            .joinToString("-") + ".$extension"
        File(carpeta, nombre).writeBytes(bytes)
        return nombre
    }

    companion object {
        /**
         * Tipo real del archivo según sus primeros bytes ("firma"), no según el nombre o el
         * Content-Type que manda el cliente. Devuelve (extensión, tipo MIME) o null.
         */
        fun detectarTipo(b: ByteArray): Pair<String, String>? = when {
            b.size >= 4 && b[0] == 0x25.toByte() && b[1] == 0x50.toByte() &&
                b[2] == 0x44.toByte() && b[3] == 0x46.toByte() -> "pdf" to "application/pdf"
            b.size >= 8 && b[0] == 0x89.toByte() && b[1] == 0x50.toByte() &&
                b[2] == 0x4E.toByte() && b[3] == 0x47.toByte() -> "png" to "image/png"
            b.size >= 3 && b[0] == 0xFF.toByte() && b[1] == 0xD8.toByte() &&
                b[2] == 0xFF.toByte() -> "jpg" to "image/jpeg"
            else -> null
        }
    }
}
