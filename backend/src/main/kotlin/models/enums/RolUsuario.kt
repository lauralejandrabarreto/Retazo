package models.enums

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class RolUsuario {
    @SerialName("usuario")
    USUARIO,

    @SerialName("organizacion")
    ORGANIZACION
}