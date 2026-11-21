package models

import kotlinx.serialization.Serializable

@Serializable
class DocumentoAdjunto(
    val nombreOriginal: String,
    val bytes: ByteArray,
)