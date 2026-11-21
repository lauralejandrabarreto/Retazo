package service

import models.LugarCercano
import models.LugarHistorico
import models.LugarResumen
import models.mapping.toResumen
import repository.LugarRepository

// Capa de negocio entre las rutas de Ktor y LugarRepository.
//  - Valida y normaliza los datos de entrada (el repositorio asume que ya son correctos).
//  - Devuelve resúmenes para las listas y el detalle completo solo para una ficha.
//  - Lanza ValidacionException / NoEncontradoException / ConflictoException, que las
//    rutas convierten en 400 / 404 / 409 (ver Excepciones.kt).
class LugarHistoricoService(
    private val repository: LugarRepository = LugarRepository(),
) {

    // -------------------------------------------------------------------
    // Consultas
    // -------------------------------------------------------------------

    /**
     * Búsqueda para Buscar (RF-04 y RF-05): texto y periodo combinables.
     * Sin parámetros devuelve todos los lugares.
     */
    suspend fun buscar(query: String? = null, siglo: String? = null): List<LugarResumen> {
        val texto = query.orEmpty().trim()
        val periodo = siglo?.trim().takeUnless { it.isNullOrEmpty() } ?: SIGLO_TODOS

        val errores = buildList {
            if (texto.length > MAX_BUSQUEDA) add("La búsqueda admite máximo $MAX_BUSQUEDA caracteres.")
            if (periodo !in SIGLOS_FILTRO) add("Periodo no válido. Opciones: ${SIGLOS_FILTRO.joinToString()}.")
        }
        if (errores.isNotEmpty()) throw ValidacionException(errores)

        return repository.search(texto, periodo).map { it.toResumen() }
    }

    /** Ficha completa de un lugar (P-03, P-04 y P-05). */
    suspend fun obtener(id: String): LugarHistorico =
        repository.getById(id.trim().lowercase())
            ?: throw NoEncontradoException("El lugar '${id.trim()}' no existe.")

    /** Lugares cercanos a una ubicación, con su distancia en metros (RF-01). */
    suspend fun cercanos(
        lat: Double,
        lng: Double,
        maxMeters: Double = DISTANCIA_POR_DEFECTO,
        limit: Int = LIMITE_POR_DEFECTO,
    ): List<LugarCercano> {
        val errores = buildList {
            if (lat !in -90.0..90.0) add("La latitud debe estar entre -90 y 90.")
            if (lng !in -180.0..180.0) add("La longitud debe estar entre -180 y 180.")
            if (maxMeters !in 1.0..MAX_DISTANCIA) add("La distancia debe estar entre 1 y ${MAX_DISTANCIA.toInt()} metros.")
            if (limit !in 1..MAX_LIMITE) add("El límite debe estar entre 1 y $MAX_LIMITE.")
        }
        if (errores.isNotEmpty()) throw ValidacionException(errores)

        return repository.getNearby(lat, lng, maxMeters, limit)
    }

    /**
     * Resúmenes de varios lugares conservando el orden de [ids]. Pensado para Favoritos:
     * FavoritoRepository devuelve los ids (más reciente primero) y aquí se arman las tarjetas.
     * Los ids que ya no existen se omiten.
     */
    suspend fun resumenesPorIds(ids: List<String>): List<LugarResumen> {
        if (ids.isEmpty()) return emptyList()
        val porId = repository.getAll().associateBy { it.id }
        return ids.mapNotNull { porId[it]?.toResumen() }
    }

    // -------------------------------------------------------------------
    // Administración (crear, actualizar, eliminar)
    // -------------------------------------------------------------------

    /** Crea un lugar. Lanza ConflictoException si ya existe uno con ese id. */
    suspend fun crear(lugar: LugarHistorico): LugarHistorico {
        val limpio = lugar.normalizado()
        limpio.validarOFallar()
        if (!repository.save(limpio)) {
            throw ConflictoException("Ya existe un lugar con el id '${limpio.id}'.")
        }
        return limpio
    }

    /** Reemplaza un lugar existente (el id de la ruta manda sobre el del cuerpo). */
    suspend fun actualizar(id: String, lugar: LugarHistorico): LugarHistorico {
        val limpio = lugar.normalizado(idForzado = id)
        limpio.validarOFallar()
        if (!repository.update(limpio.id, limpio)) {
            throw NoEncontradoException("El lugar '${limpio.id}' no existe.")
        }
        return limpio
    }

    suspend fun eliminar(id: String) {
        val limpio = id.trim().lowercase()
        if (!repository.delete(limpio)) {
            throw NoEncontradoException("El lugar '$limpio' no existe.")
        }
    }

    // -------------------------------------------------------------------
    // Normalización y validación
    // -------------------------------------------------------------------

    /** Recorta espacios, convierte textos vacíos en null y completa lo que se puede derivar. */
    private fun LugarHistorico.normalizado(idForzado: String? = null): LugarHistorico {
        val sigloLimpio = siglo.trim()
        val fuentesLimpias = fuentes.map {
            it.copy(titulo = it.titulo.trim(), detalle = it.detalle.trim(), url = it.url.limpiarONull())
        }
        return copy(
            id = (idForzado ?: id).trim().lowercase(),
            nombre = nombre.trim(),
            sector = sector.trim(),
            ciudad = ciudad.trim(),
            pais = pais.trim(),
            siglo = sigloLimpio,
            // Si no viene la época, se deriva del siglo ("XVI" -> "Siglo XVI").
            epoca = epoca.trim().ifEmpty { ETIQUETAS_SIGLO[sigloLimpio].orEmpty() },
            imagen = imagen.limpiarONull(),
            imagenActual = imagenActual.limpiarONull(),
            descripcion = descripcion.trim(),
            fotosHistoricas = fotosHistoricas.map { it.copy(anio = it.anio.trim(), uri = it.uri.limpiarONull()) },
            historia = historia.map { it.copy(titulo = it.titulo.trim(), texto = it.texto.trim()) },
            fuentes = fuentesLimpias,
            // Derivado: nunca se confía en el valor que manda el cliente.
            contenidoVerificado = fuentesLimpias.any { it.verificada },
        )
    }

    private fun LugarHistorico.validarOFallar() {
        val errores = validar()
        if (errores.isNotEmpty()) throw ValidacionException(errores)
    }

    private fun LugarHistorico.validar(): List<String> = buildList {
        if (id.length > MAX_ID || !SLUG.matches(id)) {
            add("El id debe ser un slug en minúsculas con guiones (ej. plaza-bolivar), máximo $MAX_ID caracteres.")
        }
        if (nombre.isEmpty() || nombre.length > MAX_NOMBRE) add("El nombre es obligatorio (máximo $MAX_NOMBRE caracteres).")
        if (sector.isEmpty()) add("El sector es obligatorio.")
        if (ciudad.isEmpty()) add("La ciudad es obligatoria.")
        if (pais.isEmpty()) add("El país es obligatorio.")
        if (siglo !in ETIQUETAS_SIGLO) add("Siglo no válido. Opciones: ${ETIQUETAS_SIGLO.keys.joinToString()}.")
        if (descripcion.isEmpty()) add("La descripción es obligatoria.")
        if (coords.lat !in -90.0..90.0) add("La latitud debe estar entre -90 y 90.")
        if (coords.lng !in -180.0..180.0) add("La longitud debe estar entre -180 y 180.")

        imagen?.let { if (!it.esUrlHttp()) add("La imagen debe ser una URL http(s).") }
        imagenActual?.let { if (!it.esUrlHttp()) add("La imagen actual debe ser una URL http(s).") }

        fotosHistoricas.forEachIndexed { i, foto ->
            if (foto.anio.isEmpty()) add("La fotografía histórica ${i + 1} necesita un año.")
            foto.uri?.let { if (!it.esUrlHttp()) add("La fotografía histórica ${i + 1} debe tener una URL http(s).") }
        }
        historia.forEachIndexed { i, seccion ->
            if (seccion.titulo.isEmpty()) add("La sección de historia ${i + 1} necesita un título.")
            if (seccion.texto.isEmpty()) add("La sección de historia ${i + 1} necesita texto.")
        }
        fuentes.forEachIndexed { i, fuente ->
            if (fuente.titulo.isEmpty()) add("La fuente ${i + 1} necesita un título.")
            fuente.url?.let { if (!it.esUrlHttp()) add("La fuente ${i + 1} debe tener una URL http(s).") }
        }
    }

    private fun String?.limpiarONull(): String? = this?.trim()?.takeIf { it.isNotEmpty() }

    private fun String.esUrlHttp(): Boolean =
        startsWith("http://", ignoreCase = true) || startsWith("https://", ignoreCase = true)

    private companion object {
        const val SIGLO_TODOS = "todos"
        const val MAX_BUSQUEDA = 60 // el mismo límite que el campo de búsqueda del frontend
        const val MAX_ID = 80
        const val MAX_NOMBRE = 200
        const val DISTANCIA_POR_DEFECTO = 3000.0
        const val MAX_DISTANCIA = 50_000.0
        const val LIMITE_POR_DEFECTO = 3
        const val MAX_LIMITE = 50

        val SLUG = Regex("^[a-z0-9]+(-[a-z0-9]+)*$")

        // Mismos periodos que PERIODS en data/places.js; sirven también para derivar `epoca`.
        val ETIQUETAS_SIGLO = mapOf(
            "prehispanico" to "Prehispánico",
            "XVI" to "Siglo XVI",
            "XVII" to "Siglo XVII",
            "XVIII" to "Siglo XVIII",
            "XIX" to "Siglo XIX",
            "XX" to "Siglo XX",
        )
        val SIGLOS_FILTRO = listOf(SIGLO_TODOS) + ETIQUETAS_SIGLO.keys
    }
}