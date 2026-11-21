package controllers

import models.Periodo
import service.PeriodoService

class PeriodoController {

    private val service = PeriodoService()

    suspend fun listar() = service.listar()

    suspend fun obtener(id: String) = service.obtener(id)

    suspend fun crear(periodo: Periodo) = service.crear(periodo)

    suspend fun actualizar(id: String, periodo: Periodo) = service.actualizar(id, periodo)

    suspend fun eliminar(id: String) = service.eliminar(id)

    /** Carga los periodos por defecto si la colección está vacía. Llamar al arrancar el servidor. */
    suspend fun sembrarSiVacio() = service.sembrarSiVacio()
}