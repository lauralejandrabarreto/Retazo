package models

import kotlinx.serialization.Serializable

@Serializable
data class SeccionHistoria(
    val titulo: String,
    val texto: String,
)