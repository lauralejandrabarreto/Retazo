package rag.dto

import kotlinx.serialization.Serializable

// Datos que viajan entre la app y el asistente histórico (RAG).

@Serializable
data class AskRequest(val pregunta: String = "")

@Serializable
data class Cita(
    val n: Int,
    val titulo: String,
    val seccion: String,
    val fuente: String,
    val url: String? = null,
    val fragmento: String,
)

@Serializable
data class AskResponse(
    val placeId: String,
    val pregunta: String,
    val respuesta: String,
    // "generativo": respuesta redactada por el modelo de lenguaje a partir de los fragmentos.
    // "extractivo": sin modelo configurado (o si falló); se devuelven las frases más relevantes.
    // "sin_resultados": las fuentes no contienen información sobre la pregunta.
    val modo: String,
    val citas: List<Cita>,
    val aviso: String? = null,
)

@Serializable
data class EstadoRag(
    val documentos: Int,
    val fragmentos: Int,
    val lugaresConFuentes: Int,
    val modeloConfigurado: Boolean,
    val modelo: String? = null,
)
