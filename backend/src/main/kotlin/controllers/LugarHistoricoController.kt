package controllers

import models.LugarHistorico
import service.LugarHistoricoService

class LugarHistoricoController {

    private val service = LugarHistoricoService()

    suspend fun buscar(query: String?, siglo: String?) = service.buscar(query, siglo)

    suspend fun obtener(id: String) = service.obtener(id)

    suspend fun cercanos(lat: Double, lng: Double, maxMeters: Double, limit: Int) = service.cercanos(lat, lng, maxMeters, limit)

    suspend fun resumenesPorIds(ids: List<String>) = service.resumenesPorIds(ids)

    suspend fun crear(lugar: LugarHistorico) = service.crear(lugar)

    suspend fun actualizar(id: String, lugar: LugarHistorico) = service.actualizar(id, lugar)

    suspend fun eliminar(id: String) = service.eliminar(id)
}