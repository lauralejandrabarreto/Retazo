package database

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import service.AlmacenArchivos
import java.io.File
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration

// Descarga las fotografías de los lugares y las guarda DENTRO del proyecto.
//
//   gradlew descargarImagenes
//
// Lee database/seed/lugares.json; por cada imagen con URL externa (http/https):
//   1. la descarga (con un User-Agent identificable, como pide Wikimedia),
//   2. la guarda en database/seed/imagenes/<lugar>-<campo>.<ext>,
//   3. cambia la URL del JSON por "/imagenes/<archivo>", que sirve el backend.
// Así la app ya no depende de que otros sitios mantengan sus enlaces (p. ej. los de
// Facebook vencen) ni de que permitan mostrar sus imágenes desde otra app.
// Las que no se puedan descargar se dejan igual y se listan al final.
// Después: gradlew seed (para actualizar Firestore) y subir la carpeta imagenes/ a Git.

private const val MAX_BYTES = 8 * 1024 * 1024
private const val USER_AGENT = "RetazoApp/1.0 (proyecto universitario; Konrad Lorenz)"

private val jsonPretty = Json { prettyPrint = true; prettyPrintIndent = "  " }

private val http: HttpClient = HttpClient.newBuilder()
    .followRedirects(HttpClient.Redirect.NORMAL)
    .connectTimeout(Duration.ofSeconds(20))
    .build()

fun main(args: Array<String>) {
    val archivo = File(args.firstOrNull() ?: "database/seed/lugares.json")
    val carpeta = File(archivo.parentFile, "imagenes").apply { mkdirs() }
    val lugares = Json.parseToJsonElement(archivo.readText(Charsets.UTF_8)).jsonArray

    val fallidas = mutableListOf<String>()
    val creditos = mutableListOf<String>()
    var descargadas = 0

    fun procesar(url: String?, nombreBase: String): String? {
        if (url == null || !url.startsWith("http")) return url // ya local o vacía
        return try {
            val bytes = descargar(url)
            val ext = AlmacenArchivos.detectarTipo(bytes)?.first?.takeIf { it != "pdf" }
                ?: detectarWebp(bytes)
                ?: error("no es una imagen JPG, PNG o WebP")
            val nombre = "$nombreBase.$ext"
            File(carpeta, nombre).writeBytes(bytes)
            creditos += "| $nombre | <$url> |"
            descargadas++
            println("  OK   $nombre")
            "/imagenes/$nombre"
        } catch (e: Exception) {
            fallidas += "$nombreBase: ${e.message}\n      $url"
            println("  FALLO $nombreBase: ${e.message}")
            url
        }
    }

    val actualizados = lugares.map { elemento ->
        val lugar = elemento.jsonObject
        val id = lugar["id"]!!.jsonPrimitive.content
        println(id)
        val campos = lugar.toMutableMap()
        for (campo in listOf("imagen", "imagenActual")) {
            campos[campo] = texto(procesar(lugar[campo]?.jsonPrimitive?.contentOrNull, "$id-${campo.lowercase()}"))
        }
        campos["fotosHistoricas"] = JsonArray(
            lugar["fotosHistoricas"]?.jsonArray.orEmpty().mapIndexed { i, foto ->
                val f = foto.jsonObject.toMutableMap()
                val anio = f["anio"]?.jsonPrimitive?.content.orEmpty().filter { it.isLetterOrDigit() }.ifEmpty { "$i" }
                f["uri"] = texto(procesar(f["uri"]?.jsonPrimitive?.contentOrNull, "$id-historica-$anio"))
                JsonObject(f)
            },
        )
        JsonObject(campos)
    }

    archivo.writeText(jsonPretty.encodeToString(JsonElement.serializer(), JsonArray(actualizados)) + "\n", Charsets.UTF_8)
    File(carpeta, "CREDITOS.md").writeText(
        "# Créditos de las imágenes\n\nArchivo local y URL de donde se descargó (fuente a citar).\n\n" +
            "| Archivo | Origen |\n|---|---|\n" + creditos.joinToString("\n") + "\n",
        Charsets.UTF_8,
    )

    println("\nDescargadas: $descargadas. Fallidas: ${fallidas.size}.")
    if (fallidas.isNotEmpty()) {
        println("Estas imágenes conservan su URL original (revisa el enlace o reemplázalo):")
        fallidas.forEach { println("  - $it") }
    }
    println("Siguiente paso: gradlew seed  (actualiza los lugares en Firestore)")
}

private fun descargar(url: String): ByteArray {
    val req = HttpRequest.newBuilder(URI.create(url))
        .header("User-Agent", USER_AGENT)
        .header("Accept", "image/*")
        .timeout(Duration.ofSeconds(40))
        .GET().build()
    val res = http.send(req, HttpResponse.BodyHandlers.ofByteArray())
    check(res.statusCode() in 200..299) { "HTTP ${res.statusCode()}" }
    val bytes = res.body()
    check(bytes.isNotEmpty()) { "respuesta vacía" }
    check(bytes.size <= MAX_BYTES) { "imagen de más de 8 MB" }
    return bytes
}

private fun detectarWebp(b: ByteArray): String? =
    if (b.size > 12 && String(b, 0, 4, Charsets.US_ASCII) == "RIFF" && String(b, 8, 4, Charsets.US_ASCII) == "WEBP") "webp" else null

private fun texto(valor: String?): JsonElement = valor?.let { JsonPrimitive(it) } ?: JsonNull
