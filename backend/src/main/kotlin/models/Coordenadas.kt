package models

import kotlinx.serialization.Serializable

@Serializable
data class Coordenadas(
    val lat: Double,
    val lng: Double,
)