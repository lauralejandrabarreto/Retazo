package routes

import io.ktor.server.application.Application
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.routing
import models.LugarHistorico
import rag.Corpus
import rag.LlmClient
import rag.LlmConfig
import rag.RagService
import rag.dto.AskRequest
import rag.dto.EstadoRag
import service.LugarHistoricoService
import service.ValidacionException

// Asistente histórico (RAG) — pantalla P-05 "Historia del lugar".
//
//   POST /api/places/{id}/ask   { "pregunta": "..." }  -> respuesta con citas   (pública)
//   GET  /api/rag/estado                               -> documentos y modelo   (pública)
//
// Las fuentes están en src/main/resources/corpus (un .md por fuente). El lugar se busca
// en Firestore con LugarHistoricoService, así que un id inexistente responde 404.
const val PREGUNTA_MIN = 3
const val PREGUNTA_MAX = 300

fun Application.configureRagRoutes(
    corpus: Corpus = Corpus.load(),
    llm: LlmClient = LlmClient(LlmConfig.fromEnv()),
    buscarLugar: suspend (String) -> LugarHistorico = { LugarHistoricoService().obtener(it) },
) {
    val rag = RagService(corpus, llm)

    environment.log.info(
        "RAG listo: {} documentos, {} fragmentos. Modelo: {}",
        corpus.docs.size, corpus.chunks.size,
        if (llm.config.enabled) llm.config.model else "no configurado (modo extractivo)",
    )

    routing {
        post("/api/places/{id}/ask") {
            val id = call.parameters["id"]?.trim()?.lowercase()
                ?.takeIf { it.isNotEmpty() && '/' !in it }
                ?: throw ValidacionException(listOf("Falta el id del lugar en la ruta."))
            val pregunta = call.receive<AskRequest>().pregunta.trim()
            if (pregunta.length !in PREGUNTA_MIN..PREGUNTA_MAX) {
                throw ValidacionException(listOf("La pregunta debe tener entre $PREGUNTA_MIN y $PREGUNTA_MAX caracteres."))
            }
            val lugar = buscarLugar(id) // NoEncontradoException -> 404 (ManejoErrores.kt)
            call.respond(rag.ask(lugar, pregunta))
        }

        get("/api/rag/estado") {
            call.respond(
                EstadoRag(
                    documentos = corpus.docs.size,
                    fragmentos = corpus.chunks.size,
                    lugaresConFuentes = corpus.docs.map { it.placeId }.toSet().size,
                    modeloConfigurado = llm.config.enabled,
                    modelo = llm.config.model.takeIf { llm.config.enabled },
                ),
            )
        }
    }
}
