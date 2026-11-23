package rag

import rag.dto.AskResponse
import rag.dto.Cita
import models.LugarHistorico
import org.slf4j.LoggerFactory

// Orquesta el RAG (Retrieval-Augmented Generation):
//  1. Recuperar: BM25 busca en las fuentes del lugar los fragmentos más relacionados con la pregunta.
//  2. Aumentar: esos fragmentos, numerados, se insertan en las instrucciones del modelo.
//  3. Generar: el modelo redacta la respuesta usando SOLO esos fragmentos y citándolos [n].
// Si no hay modelo configurado (o falla), responde en modo extractivo con las
// frases más relevantes de las fuentes, también citadas.
class RagService(
    private val corpus: Corpus,
    private val llm: LlmClient,
    private val topK: Int = 4,
) {
    private val log = LoggerFactory.getLogger(RagService::class.java)
    private val retriever = Bm25Retriever(corpus.chunks)
    private val citeRegex = "\\[(\\d+)]".toRegex()

    suspend fun ask(place: LugarHistorico, question: String): AskResponse {
        val results = retriever.search(question, place.id, topK)
        if (results.isEmpty()) {
            return AskResponse(
                placeId = place.id,
                pregunta = question,
                respuesta = "No encontré información sobre eso en las fuentes disponibles de ${place.nombre}. " +
                    "Prueba con otra pregunta, por ejemplo sobre su construcción, su historia o su arquitectura.",
                modo = "sin_resultados",
                citas = emptyList(),
            )
        }
        val citas = results.mapIndexed { i, r ->
            Cita(i + 1, r.chunk.titulo, r.chunk.seccion, r.chunk.fuente, r.chunk.url, r.chunk.text)
        }

        if (llm.config.enabled) {
            try {
                val answer = llm.complete(systemPrompt(place), userPrompt(question, citas))
                val used = citeRegex.findAll(answer).map { it.groupValues[1].toInt() }.toSet()
                return AskResponse(
                    placeId = place.id,
                    pregunta = question,
                    respuesta = answer,
                    modo = "generativo",
                    citas = if (used.isEmpty()) citas else citas.filter { it.n in used },
                )
            } catch (e: Exception) {
                log.warn("Falló el modelo de lenguaje, se usa el modo extractivo: {}", e.message)
                return extractive(place, question, citas, aviso = "El modelo de lenguaje no respondió; se muestran los fragmentos más relevantes de las fuentes.")
            }
        }
        return extractive(place, question, citas, aviso = "Modo sin IA: se muestran las frases más relevantes de las fuentes.")
    }

    // Modo extractivo: puntúa cada oración de los fragmentos según los términos
    // que comparte con la pregunta (pesados por IDF: los términos raros valen más).
    // Devuelve la mejor y, si aporta casi lo mismo y no es repetida, la segunda.
    private fun extractive(place: LugarHistorico, question: String, citas: List<Cita>, aviso: String): AskResponse {
        val qTerms = Text.terms(question).toSet()
        val ranked = citas.flatMap { c -> Text.sentences(c.fragmento).map { s -> c to s } }
            .map { (c, s) ->
                val terms = Text.terms(s).toSet()
                Triple(c, s, terms.intersect(qTerms).sumOf { retriever.idf(it) })
            }
            .filter { it.third > 0 }
            .sortedWith(compareByDescending<Triple<Cita, String, Double>> { it.third }.thenBy { it.first.n })
        val selected = mutableListOf<Triple<Cita, String, Double>>()
        ranked.firstOrNull()?.let { selected += it }
        ranked.drop(1).firstOrNull { cand ->
            cand.third >= 0.75 * selected.first().third && !similar(cand.second, selected.first().second)
        }?.let { selected += it }
        if (selected.isEmpty()) {
            val first = citas.first()
            selected += Triple(first, Text.sentences(first.fragmento).firstOrNull() ?: first.fragmento, 0.0)
        }
        val answer = selected.joinToString(" ") { (c, s) -> "$s [${c.n}]" }
        val used = selected.map { it.first.n }.toSet()
        return AskResponse(place.id, question, answer, "extractivo", citas.filter { it.n in used }, aviso)
    }

    // Dos oraciones son "repetidas" si comparten más del 60 % de sus términos.
    private fun similar(a: String, b: String): Boolean {
        val ta = Text.terms(a).toSet(); val tb = Text.terms(b).toSet()
        if (ta.isEmpty() || tb.isEmpty()) return false
        return ta.intersect(tb).size.toDouble() / ta.union(tb).size > 0.6
    }

    private fun systemPrompt(place: LugarHistorico) = """
        Eres el guía histórico de Retazo, una app de memoria urbana.
        Respondes preguntas sobre ${place.nombre} (${place.ciudad}, ${place.pais}).
        Reglas:
        - Responde en español, en un máximo de 4 oraciones claras.
        - Usa ÚNICAMENTE la información de los fragmentos numerados. No agregues datos de tu conocimiento.
        - Después de cada dato, cita el fragmento de donde sale con su número entre corchetes, por ejemplo [1] o [2].
        - Si los fragmentos no responden la pregunta, dilo con honestidad y no inventes.
        - Si las fuentes dan datos distintos (por ejemplo, dos fechas), menciona ambos.
    """.trimIndent()

    private fun userPrompt(question: String, citas: List<Cita>) = buildString {
        appendLine("Fragmentos de las fuentes:")
        citas.forEach { c -> appendLine("[${c.n}] (${c.fuente} — ${c.seccion}) ${c.fragmento}") }
        appendLine()
        append("Pregunta: ").append(question)
    }
}
