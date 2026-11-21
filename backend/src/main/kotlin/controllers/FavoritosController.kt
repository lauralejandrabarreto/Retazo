package controllers

import service.FavoritoService

class FavoritosController {

    private val service = FavoritoService()

    suspend fun listar(usuarioId: String) = service.listar(usuarioId)

    suspend fun esFavorito(usuarioId: String, lugarId: String) = service.esFavorito(usuarioId, lugarId)

    suspend fun agregar(usuarioId: String, lugarId: String) = service.agregar(usuarioId, lugarId)

    suspend fun quitar(usuarioId: String, lugarId: String) = service.quitar(usuarioId, lugarId)
}