package models

import kotlinx.serialization.Serializable

@Serializable
data class Periodo(
    val id: String,
    val etiqueta: String,
    val orden: Int,
)