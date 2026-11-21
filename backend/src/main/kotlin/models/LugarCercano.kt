package models

import kotlinx.serialization.Serializable

@Serializable
data class LugarCercano(
    val lugar: LugarResumen,
    val distancia: Double,
)