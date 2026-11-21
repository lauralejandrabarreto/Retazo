package service

import models.LugarResumen
import repository.FavoritoRepository
import repository.UsuarioRepository

// Capa de negocio de favoritos. Comprueba que el usuario y el lugar existan antes de
// tocar la base de datos (el repositorio no valida al usuario) y arma las tarjetas
// combinando los ids de FavoritoRepository con LugarHistoricoService.
class FavoritoService(
    private val favoritos: FavoritoRepository = FavoritoRepository(),
    private val usuarios: UsuarioRepository = UsuarioRepository(),
    private val lugares: LugarHistoricoService = LugarHistoricoService(),
) {

    /** Lugares favoritos del usuario como resúmenes, el más reciente primero (RF-11). */
    suspend fun listar(usuarioId: String): List<LugarResumen> {
        val usuario = usuarioExistente(usuarioId)
        return lugares.resumenesPorIds(favoritos.getLugarIds(usuario))
    }

    suspend fun esFavorito(usuarioId: String, lugarId: String): Boolean {
        val lugar = idLimpio(lugarId, "lugar")
        return favoritos.isFavorito(usuarioExistente(usuarioId), lugar)
    }

    /** Guarda el favorito (RF-07). Es idempotente: repetirlo no cambia nada. */
    suspend fun agregar(usuarioId: String, lugarId: String) {
        val lugar = idLimpio(lugarId, "lugar")
        val usuario = usuarioExistente(usuarioId)
        if (!favoritos.add(usuario, lugar)) {
            throw NoEncontradoException("El lugar '$lugar' no existe.")
        }
    }

    /** Quita el favorito (RF-11). Lanza NoEncontradoException si no estaba guardado. */
    suspend fun quitar(usuarioId: String, lugarId: String) {
        val lugar = idLimpio(lugarId, "lugar")
        val usuario = usuarioExistente(usuarioId)
        if (!favoritos.remove(usuario, lugar)) {
            throw NoEncontradoException("El lugar '$lugar' no estaba en favoritos.")
        }
    }

    // -------------------------------------------------------------------

    private suspend fun usuarioExistente(usuarioId: String): String {
        val id = idLimpio(usuarioId, "usuario")
        if (usuarios.getById(id) == null) throw NoEncontradoException("El usuario '$id' no existe.")
        return id
    }

    // Un id de documento de Firestore no puede estar vacío ni contener "/"
    // (un %2F en la URL llegaría ya decodificado y rompería la consulta).
    private fun idLimpio(valor: String, nombre: String): String {
        val id = valor.trim().lowercase()
        if (id.isEmpty() || '/' in id) throw ValidacionException(listOf("El id de $nombre no es válido."))
        return id
    }
}