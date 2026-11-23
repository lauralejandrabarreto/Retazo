package rag

import config.Env
import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.content.TextContent
import io.ktor.http.isSuccess
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

// Configuración del modelo de lenguaje, leída de variables de entorno.
// Funciona con cualquier API compatible con OpenAI (Groq por defecto).
data class LlmConfig(
    val apiKey: String?,
    val baseUrl: String = "https://api.groq.com/openai/v1",
    val model: String = "openai/gpt-oss-120b",
) {
    val enabled get() = !apiKey.isNullOrBlank()

    companion object {
        fun fromEnv() = LlmConfig(
            apiKey = Env["LLM_API_KEY"] ?: Env["GROQ_API_KEY"],
            baseUrl = Env["LLM_BASE_URL"] ?: "https://api.groq.com/openai/v1",
            model = Env["LLM_MODEL"] ?: "openai/gpt-oss-120b",
        )
    }
}

@Serializable
private data class ChatMessage(val role: String, val content: String)

@Serializable
private data class ChatRequest(
    val model: String,
    val messages: List<ChatMessage>,
    val temperature: Double = 0.2,
    // Incluye el razonamiento interno de los modelos gpt-oss, por eso es holgado.
    val max_tokens: Int = 1200,
    // Solo para modelos de razonamiento (gpt-oss): "low" responde más rápido.
    val reasoning_effort: String? = null,
)

@Serializable
private data class ResponseMessage(val content: String? = null)

@Serializable
private data class ChatChoice(val message: ResponseMessage)

@Serializable
private data class ChatResponse(val choices: List<ChatChoice>)

class LlmException(message: String) : Exception(message)

class LlmClient(
    val config: LlmConfig,
    private val http: HttpClient = defaultClient(),
) {
    private val json = Json { ignoreUnknownKeys = true; encodeDefaults = true; explicitNulls = false }

    suspend fun complete(system: String, user: String): String {
        if (!config.enabled) throw LlmException("No hay API key configurada")
        val response = http.post("${config.baseUrl.trimEnd('/')}/chat/completions") {
            header(HttpHeaders.Authorization, "Bearer ${config.apiKey}")
            // El cuerpo se serializa aquí mismo para no depender de plugins del cliente.
            setBody(
                TextContent(
                    json.encodeToString(
                        ChatRequest(
                            model = config.model,
                            messages = listOf(ChatMessage("system", system), ChatMessage("user", user)),
                            reasoning_effort = if (config.model.contains("gpt-oss")) "low" else null,
                        ),
                    ),
                    ContentType.Application.Json,
                ),
            )
        }
        val text = response.bodyAsText()
        if (!response.status.isSuccess()) {
            throw LlmException("El modelo respondió ${response.status.value}: ${text.take(300)}")
        }
        return json.decodeFromString<ChatResponse>(text).choices.firstOrNull()?.message?.content?.trim()?.takeIf { it.isNotEmpty() }
            ?: throw LlmException("Respuesta vacía del modelo")
    }

    companion object {
        fun defaultClient() = HttpClient(CIO) {
            install(HttpTimeout) { requestTimeoutMillis = 30_000 }
        }
    }
}
