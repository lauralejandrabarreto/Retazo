package rag

import kotlin.math.ln

data class ScoredChunk(val chunk: Chunk, val score: Double)

// Recuperador BM25: el algoritmo clásico de los buscadores de texto.
//
// Para cada término de la pregunta suma un puntaje mayor cuando:
//  - el término aparece varias veces en el fragmento (frecuencia, con saturación k1),
//  - el término es poco común en el corpus (IDF: "reloj" pesa más que "iglesia"),
//  - el fragmento es corto (normalización por longitud, parámetro b).
// No necesita descargar modelos ni servicios externos y su resultado se puede explicar.
class Bm25Retriever(chunks: List<Chunk>, private val k1: Double = 1.4, private val b: Double = 0.75) {
    private val docs = chunks.map { it to Text.terms("${it.seccion} ${it.text}") }
    private val avgLen = docs.map { it.second.size }.average().coerceAtLeast(1.0)
    private val docFreq: Map<String, Int> =
        docs.flatMap { it.second.toSet() }.groupingBy { it }.eachCount()
    private val n = docs.size

    fun idf(term: String): Double {
        val df = docFreq[term] ?: 0
        return ln(1 + (n - df + 0.5) / (df + 0.5))
    }

    // Devuelve los k fragmentos más relevantes. Si se indica placeId, solo busca
    // en las fuentes de ese lugar.
    fun search(query: String, placeId: String? = null, k: Int = 4): List<ScoredChunk> {
        val qTerms = Text.terms(query).distinct()
        if (qTerms.isEmpty()) return emptyList()
        return docs.asSequence()
            .filter { placeId == null || it.first.placeId == placeId }
            .map { (chunk, terms) ->
                val tf = terms.groupingBy { it }.eachCount()
                val len = terms.size
                val score = qTerms.sumOf { t ->
                    val f = tf[t] ?: 0
                    if (f == 0) 0.0
                    else idf(t) * (f * (k1 + 1)) / (f + k1 * (1 - b + b * len / avgLen))
                }
                ScoredChunk(chunk, score)
            }
            .filter { it.score > 0.0 }
            .sortedByDescending { it.score }
            .take(k)
            .toList()
    }
}
