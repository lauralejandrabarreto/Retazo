package models

import kotlinx.serialization.Serializable
import models.enums.Licencia

@Serializable
data class FotoHistorica(
    val anio: String,
    val uri: String? = null,
    val credito: String? = null,
    val institucion: String? = null,
    val licencia: Licencia = Licencia.DESCONOCIDA,
    val esIlustrativa: Boolean = false,
)