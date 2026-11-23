import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.respond
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.http.headersOf
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.testing.testApplication
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import models.Coordenadas
import models.LugarHistorico
import rag.Bm25Retriever
import rag.Corpus
import rag.LlmClient
import rag.LlmConfig
import routes.configureManejoErrores
import routes.configureRagRoutes
import service.NoEncontradoException
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

// Pruebas del asistente histórico (RAG). No necesitan Firebase: el lugar se
// busca con una función falsa en lugar de Firestore.
class RagTest {
    private val corpus = Corpus.load(dir = null)

    private fun lugar(id: String, nombre: String) = LugarHistorico(
        id = id, nombre = nombre, sector = "Centro", ciudad = "Ciudad", pais = "País",
        siglo = "XIX", epoca = "Siglo XIX", coords = Coordenadas(0.0, 0.0), descripcion = "Prueba",
    )

    private val lugares = mapOf(
        "teatro-colon" to lugar("teatro-colon", "Teatro Colón"),
        "museo-oro" to lugar("museo-oro", "Museo del Oro"),
        "catedral-comayagua" to lugar("catedral-comayagua", "Catedral de Comayagua"),
    )

    private fun Application.modulo(llm: LlmClient = LlmClient(LlmConfig(apiKey = null))) {
        install(ContentNegotiation) { json() }
        configureManejoErrores()
        configureRagRoutes(corpus, llm) { id -> lugares[id] ?: throw NoEncontradoException("El lugar '$id' no existe.") }
    }

    private fun json(text: String) = Json.parseToJsonElement(text).jsonObject

    @Test
    fun `el corpus carga fuentes de los diez lugares`() {
        assertEquals(10, corpus.docs.map { it.placeId }.toSet().size)
        assertTrue(corpus.chunks.size > 40)
    }

    @Test
    fun `BM25 encuentra la seccion del reloj de Comayagua`() {
        val top = Bm25Retriever(corpus.chunks).search("¿Qué tiene de especial el reloj?", "catedral-comayagua").first()
        assertEquals("El reloj", top.chunk.seccion)
    }

    @Test
    fun `responde en modo extractivo con citas`() = testApplication {
        application { modulo() }
        val r = client.post("/api/places/teatro-colon/ask") {
            contentType(ContentType.Application.Json); setBody("""{"pregunta":"¿Quién diseñó el teatro?"}""")
        }
        val body = json(r.bodyAsText())
        assertEquals("extractivo", body["modo"]!!.jsonPrimitive.content)
        assertTrue(body["respuesta"]!!.jsonPrimitive.content.contains("Cantini"))
        assertTrue(body["citas"]!!.jsonArray.isNotEmpty())
    }

    @Test
    fun `valida la pregunta, el lugar y no inventa`() = testApplication {
        application { modulo() }
        val corta = client.post("/api/places/teatro-colon/ask") {
            contentType(ContentType.Application.Json); setBody("""{"pregunta":"a"}""")
        }
        assertEquals(HttpStatusCode.BadRequest, corta.status)
        val noExiste = client.post("/api/places/no-existe/ask") {
            contentType(ContentType.Application.Json); setBody("""{"pregunta":"¿Cuándo se construyó?"}""")
        }
        assertEquals(HttpStatusCode.NotFound, noExiste.status)
        val sinInfo = json(
            client.post("/api/places/museo-oro/ask") {
                contentType(ContentType.Application.Json); setBody("""{"pregunta":"¿Cuál es el precio del parqueadero?"}""")
            }.bodyAsText(),
        )
        assertEquals("sin_resultados", sinInfo["modo"]!!.jsonPrimitive.content)
    }

    @Test
    fun `modo generativo usa el modelo y conserva solo las citas usadas`() = testApplication {
        var prompt = ""
        val falso = HttpClient(MockEngine { request ->
            prompt = String((request.body as io.ktor.http.content.TextContent).text.toByteArray())
            respond(
                """{"choices":[{"message":{"role":"assistant","content":"Lo diseñó Pietro Cantini [1]."}}]}""",
                HttpStatusCode.OK, headersOf(HttpHeaders.ContentType, "application/json"),
            )
        })
        application { modulo(LlmClient(LlmConfig(apiKey = "prueba"), falso)) }
        val body = json(
            client.post("/api/places/teatro-colon/ask") {
                contentType(ContentType.Application.Json); setBody("""{"pregunta":"¿Quién diseñó el teatro?"}""")
            }.bodyAsText(),
        )
        assertEquals("generativo", body["modo"]!!.jsonPrimitive.content)
        assertEquals(1, body["citas"]!!.jsonArray.size)
        assertTrue("ÚNICAMENTE" in prompt && "[1]" in prompt)
    }

    @Test
    fun `si el modelo falla responde en modo extractivo`() = testApplication {
        val falla = HttpClient(MockEngine { respond("error", HttpStatusCode.InternalServerError) })
        application { modulo(LlmClient(LlmConfig(apiKey = "prueba"), falla)) }
        val body = json(
            client.post("/api/places/catedral-comayagua/ask") {
                contentType(ContentType.Application.Json); setBody("""{"pregunta":"¿De qué época es el reloj?"}""")
            }.bodyAsText(),
        )
        assertEquals("extractivo", body["modo"]!!.jsonPrimitive.content)
    }

    @Test
    fun `estado del RAG`() = testApplication {
        application { modulo() }
        val body = json(client.get("/api/rag/estado").bodyAsText())
        assertEquals("16", body["documentos"]!!.jsonPrimitive.content)
    }
}
