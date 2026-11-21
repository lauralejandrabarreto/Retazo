package controllers

import models.DocumentoAdjunto
import models.Usuario
import models.UsuarioPerfil
import service.UsuarioService

class UsuarioController {

    private val service = UsuarioService()

    suspend fun registrar(usuario: Usuario) = service.registrar(usuario)

    suspend fun registrarOrganizacion(
        nombre: String, correo: String, contrasenia: String, documento: DocumentoAdjunto?,
    ) = service.registrarOrganizacion(nombre, correo, contrasenia, documento)

    suspend fun iniciarSesion(correo: String, contrasenia: String) = service.iniciarSesion(correo, contrasenia)

    suspend fun obtener(id: String) = service.obtener(id)

    suspend fun actualizarNombre(id: String, nombre: String) = service.actualizarNombre(id, nombre)

    suspend fun eliminar(id: String) = service.eliminar(id)

}