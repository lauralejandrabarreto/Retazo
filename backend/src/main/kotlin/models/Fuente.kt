package models

import kotlinx.serialization.Serializable
import models.enums.TipoFuente

@Serializable
data class Fuente(
    val titulo: String,
    val detalle: String,
    val tipo: TipoFuente,
    val url: String? = null,
    val verificada: Boolean = false,
)