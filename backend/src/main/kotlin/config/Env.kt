package config

import java.io.File

/**
 * Lee variables de configuración. Primero busca la variable de entorno del sistema y, si no
 * existe, la busca en el archivo `.env` de la carpeta backend (formato CLAVE=valor).
 * Así basta con tener el .env, sin configurar variables en Windows ni en IntelliJ.
 * El archivo .env está en .gitignore: nunca se sube a GitHub.
 */
object Env {
    private val archivo: Map<String, String> by lazy {
        val f = File(".env")
        if (!f.isFile) emptyMap()
        else f.readLines(Charsets.UTF_8)
            .map { it.trim() }
            .filter { it.isNotEmpty() && !it.startsWith("#") && '=' in it }
            .associate { linea ->
                linea.substringBefore('=').trim() to linea.substringAfter('=').trim().removeSurrounding("\"")
            }
    }

    operator fun get(nombre: String): String? =
        System.getenv(nombre)?.takeIf { it.isNotBlank() } ?: archivo[nombre]?.takeIf { it.isNotBlank() }
}
