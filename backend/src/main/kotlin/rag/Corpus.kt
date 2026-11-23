package rag

import config.Env
import java.io.File
import java.net.JarURLConnection
import java.nio.file.Path
import kotlin.io.path.isDirectory
import kotlin.io.path.listDirectoryEntries
import kotlin.io.path.name
import kotlin.io.path.readText

// Un documento fuente (un archivo .md de la carpeta corpus/).
data class SourceDoc(
    val file: String,
    val placeId: String,
    val titulo: String,
    val fuente: String,
    val url: String?,
    val body: String,
)

// Un fragmento recuperable: una sección del documento (o parte de ella).
data class Chunk(
    val id: Int,
    val placeId: String,
    val titulo: String,
    val seccion: String,
    val fuente: String,
    val url: String?,
    val text: String,
)

// Carga los documentos del corpus y los divide en fragmentos.
//
// Cada archivo tiene un encabezado con metadatos (placeId, titulo, fuente, url…)
// y un cuerpo dividido en secciones "## ". Cada sección es un fragmento; si una
// sección es muy larga se parte por párrafos. Así cada fragmento trata un solo
// tema y la cita que se muestra al usuario es precisa.
class Corpus(val docs: List<SourceDoc>) {
    val chunks: List<Chunk> = buildChunks(docs)

    fun docsFor(placeId: String) = docs.filter { it.placeId == placeId }

    companion object {
        private const val MAX_CHUNK_CHARS = 900

        // Lee los .md de la carpeta indicada en CORPUS_DIR o, si no existe,
        // de los recursos empaquetados (src/main/resources/corpus).
        fun load(dir: String? = Env["CORPUS_DIR"]): Corpus {
            val files: List<Pair<String, String>> =
                if (dir != null && File(dir).isDirectory) {
                    File(dir).listFiles { f -> f.extension == "md" }!!.sortedBy { it.name }
                        .map { it.name to it.readText(Charsets.UTF_8) }
                } else {
                    readBundled()
                }
            return Corpus(files.map { (name, text) -> parse(name, text) })
        }

        private fun readBundled(): List<Pair<String, String>> {
            val url = Corpus::class.java.classLoader.getResource("corpus")
                ?: error("No se encontró la carpeta de recursos 'corpus'")
            return when (url.protocol) {
                "file" -> Path.of(url.toURI()).listDirectoryEntries("*.md").sortedBy { it.name }
                    .map { it.name to it.readText(Charsets.UTF_8) }
                "jar" -> {
                    val jar = (url.openConnection() as JarURLConnection).jarFile
                    jar.entries().asSequence()
                        .filter { it.name.startsWith("corpus/") && it.name.endsWith(".md") }
                        .sortedBy { it.name }
                        .map { e -> e.name.substringAfter("corpus/") to jar.getInputStream(e).readBytes().toString(Charsets.UTF_8) }
                        .toList()
                }
                else -> error("Protocolo no soportado para el corpus: ${url.protocol}")
            }
        }

        fun parse(file: String, raw: String): SourceDoc {
            val text = raw.replace("\r\n", "\n")
            require(text.startsWith("---\n")) { "$file: falta el encabezado de metadatos" }
            val end = text.indexOf("\n---", 4)
            val meta = text.substring(4, end).lines()
                .filter { ':' in it }
                .associate { it.substringBefore(':').trim() to it.substringAfter(':').trim() }
            val body = text.substring(end + 4).trim()
            return SourceDoc(
                file = file,
                placeId = meta["placeId"] ?: error("$file: falta placeId"),
                titulo = meta["titulo"] ?: file,
                fuente = meta["fuente"] ?: "Fuente sin nombre",
                url = meta["url"]?.takeIf { it.isNotBlank() },
                body = body,
            )
        }

        private fun buildChunks(docs: List<SourceDoc>): List<Chunk> {
            val out = mutableListOf<Chunk>()
            for (doc in docs) {
                val sections = doc.body.split("\n## ").map { it.removePrefix("## ").trim() }.filter { it.isNotBlank() }
                for (section in sections) {
                    val title = section.substringBefore('\n').trim()
                    val content = section.substringAfter('\n', "").trim()
                    if (content.isBlank()) continue
                    for (piece in splitLong(content)) {
                        out += Chunk(out.size, doc.placeId, doc.titulo, title, doc.fuente, doc.url, piece)
                    }
                }
            }
            return out
        }

        private fun splitLong(content: String): List<String> {
            if (content.length <= MAX_CHUNK_CHARS) return listOf(content)
            val parts = mutableListOf<String>()
            var current = StringBuilder()
            for (sentence in content.split("(?<=\\.)\\s+".toRegex())) {
                if (current.length + sentence.length > MAX_CHUNK_CHARS && current.isNotEmpty()) {
                    parts += current.toString().trim(); current = StringBuilder()
                }
                current.append(sentence).append(' ')
            }
            if (current.isNotBlank()) parts += current.toString().trim()
            return parts
        }
    }
}
