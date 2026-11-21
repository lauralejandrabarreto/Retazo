package models

import kotlinx.serialization.Serializable
import models.enums.RolUsuario

@Serializable
data class Usuario(
    val nombre: String,
    val correo: String,
    val contrasenia: String,
    val rol: RolUsuario = RolUsuario.USUARIO
)