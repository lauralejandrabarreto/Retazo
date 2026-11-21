package models

import kotlinx.serialization.Serializable

@Serializable
data class FavoritoRequest(
    val lugarId: String,
)