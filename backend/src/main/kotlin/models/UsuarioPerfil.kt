package models

import kotlinx.serialization.Serializable
import models.enums.RolUsuario

@Serializable
data class UsuarioPerfil(
    val id: String,
    val nombre: String,
    val correo: String,
    val rol: RolUsuario
)