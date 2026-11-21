package models

import kotlinx.serialization.Serializable

@Serializable
data class RegistroRequest(
    val nombre: String,
    val email: String,
    val password: String,
)