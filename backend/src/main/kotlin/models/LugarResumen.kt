package models

import kotlinx.serialization.Serializable

@Serializable
data class LugarResumen(
    val id: String,
    val nombre: String,
    val sector: String,
    val ciudad: String,
    val pais: String,
    val siglo: String,
    val epoca: String,
    val coords: Coordenadas,
    val imagen: String? = null,
)