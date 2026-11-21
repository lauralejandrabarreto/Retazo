package service

import models.Periodo
import repository.LugarRepository
import repository.PeriodoRepository

// Capa de negocio del catálogo de periodos del filtro de Buscar.
//  - Valida y normaliza los datos de entrada.
//  - Evita periodos con `orden` repetido.
//  - Impide eliminar un periodo que todavía usan lugares.
class PeriodoService(
    private val repository: PeriodoRepository = PeriodoRepository(),
    private val lugares: LugarRepository = LugarRepository(),
) {

    // -------------------------------------------------------------------
    // Consultas
    // -------------------------------------------------------------------

    /** Todos los periodos ordenados por `orden`. La opción "Todos" la agrega el frontend. */
    suspend fun listar(): List<Periodo> = repository.getAll()

    suspend fun obtener(id: String): Periodo =
        repository.getById(id.trim())
            ?: throw NoEncontradoException("El periodo '${id.trim()}' no existe.")

    // -------------------------------------------------------------------
    // Administración
    // -------------------------------------------------------------------

    /** Crea un periodo. Lanza ConflictoException si el id o el orden ya existen. */
    suspend fun crear(periodo: Periodo): Periodo {
        val limpio = periodo.normalizado()
        limpio.validarOFallar()
        verificarOrdenLibre(limpio.orden, exceptoId = null)
        if (!repository.save(limpio)) {
            throw ConflictoException("Ya existe un periodo con el id '${limpio.id}'.")
        }
        return limpio
    }

    /** Reemplaza un periodo existente (el id de la ruta manda sobre el del cuerpo). */
    suspend fun actualizar(id: String, periodo: Periodo): Periodo {
        val limpio = periodo.normalizado(idForzado = id)
        limpio.validarOFallar()
        if (repository.getById(limpio.id) == null) {
            throw NoEncontradoException("El periodo '${limpio.id}' no existe.")
        }
        verificarOrdenLibre(limpio.orden, exceptoId = limpio.id)
        if (!repository.update(limpio.id, limpio)) {
            throw NoEncontradoException("El periodo '${limpio.id}' no existe.")
        }
        return limpio
    }

    /** Elimina un periodo, salvo que algún lugar todavía lo use como `siglo`. */
    suspend fun eliminar(id: String) {
        val limpio = id.trim()
        if (repository.getById(limpio) == null) {
            throw NoEncontradoException("El periodo '$limpio' no existe.")
        }
        val enUso = lugares.getBySiglo(limpio).size
        if (enUso > 0) {
            throw ConflictoException("No se puede eliminar '$limpio': lo usan $enUso lugar(es).")
        }
        repository.delete(limpio)
    }

    /** Carga los seis periodos por defecto si la colección está vacía. Llamar al arrancar. */
    suspend fun sembrarSiVacio(): Boolean = repository.sembrarSiVacio()

    // -------------------------------------------------------------------
    // Normalización y validación
    // -------------------------------------------------------------------

    // El id NO se pasa a minúsculas: los ids son sensibles a mayúsculas ("XVI", no "xvi")
    // porque deben coincidir con el campo `siglo` de los lugares.
    private fun Periodo.normalizado(idForzado: String? = null): Periodo =
        copy(id = (idForzado ?: id).trim(), etiqueta = etiqueta.trim())

    private fun Periodo.validarOFallar() {
        val errores = buildList {
            if (id.length > MAX_ID || !ID_VALIDO.matches(id)) {
                add("El id debe tener letras, números o guiones (ej. XVIII, prehispanico), máximo $MAX_ID caracteres.")
            }
            if (id.equals(ID_RESERVADO, ignoreCase = true)) {
                add("El id '$ID_RESERVADO' está reservado para la opción de mostrar todos los periodos.")
            }
            if (etiqueta.isEmpty() || etiqueta.length > MAX_ETIQUETA) {
                add("La etiqueta es obligatoria (máximo $MAX_ETIQUETA caracteres).")
            }
            if (orden < 1) add("El orden debe ser un entero mayor o igual a 1.")
        }
        if (errores.isNotEmpty()) throw ValidacionException(errores)
    }

    private suspend fun verificarOrdenLibre(orden: Int, exceptoId: String?) {
        val repetido = repository.getAll().any { it.orden == orden && it.id != exceptoId }
        if (repetido) throw ConflictoException("Ya existe otro periodo con el orden $orden.")
    }

    private companion object {
        const val MAX_ID = 20
        const val MAX_ETIQUETA = 40
        const val ID_RESERVADO = "todos"
        val ID_VALIDO = Regex("^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$")
    }
}