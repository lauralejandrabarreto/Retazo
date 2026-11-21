package repository

import com.google.cloud.firestore.DocumentSnapshot
import com.google.cloud.firestore.Firestore
import com.google.firebase.cloud.FirestoreClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import models.Periodo

// Catálogo de periodos del filtro de Buscar. Cada periodo es un documento en la
// colección "periodos"; su id es el mismo que guarda cada lugar en el campo `siglo`
// ("prehispanico", "XVI", ... "XX"). La opción "Todos" NO se guarda: la agrega el frontend.
class PeriodoRepository {

    private val db: Firestore = FirestoreClient.getFirestore()
    private val collection = db.collection("periodos")

    // -------------------------------------------------------------------
    // Lecturas
    // -------------------------------------------------------------------

    /** Todos los periodos, ordenados por el campo `orden`. */
    suspend fun getAll(): List<Periodo> = withContext(Dispatchers.IO) {
        collection.orderBy("orden").get().get().documents.mapNotNull { it.toPeriodo() }
    }

    suspend fun getById(id: String): Periodo? = withContext(Dispatchers.IO) {
        val doc = collection.document(id).get().get()
        if (doc.exists()) doc.toPeriodo() else null
    }

    // -------------------------------------------------------------------
    // Escrituras
    // -------------------------------------------------------------------

    /** Crea un periodo con el id que trae. Devuelve false si ya existe. */
    suspend fun save(periodo: Periodo): Boolean = withContext(Dispatchers.IO) {
        val ref = collection.document(periodo.id)
        if (ref.get().get().exists()) {
            false
        } else {
            ref.set(periodo.toMap()).get()
            true
        }
    }

    /** Reemplaza un periodo existente. Devuelve false si no existe. */
    suspend fun update(id: String, periodo: Periodo): Boolean = withContext(Dispatchers.IO) {
        val ref = collection.document(id)
        if (ref.get().get().exists()) {
            ref.set(periodo.copy(id = id).toMap()).get()
            true
        } else {
            false
        }
    }

    suspend fun delete(id: String): Boolean = withContext(Dispatchers.IO) {
        val ref = collection.document(id)
        if (ref.get().get().exists()) {
            ref.delete().get()
            true
        } else {
            false
        }
    }

    /**
     * Carga inicial: inserta los periodos por defecto solo si la colección está vacía.
     * Llámalo una vez al arrancar la aplicación (después de inicializar Firebase).
     */
    suspend fun sembrarSiVacio(): Boolean = withContext(Dispatchers.IO) {
        if (collection.limit(1).get().get().isEmpty.not()) return@withContext false
        val batch = db.batch()
        PERIODOS_POR_DEFECTO.forEach { batch.set(collection.document(it.id), it.toMap()) }
        batch.commit().get()
        true
    }

    // -------------------------------------------------------------------
    // Mapeo Documento <-> Periodo
    // -------------------------------------------------------------------

    private fun Periodo.toMap(): Map<String, Any> = mapOf(
        "etiqueta" to etiqueta,
        "orden" to orden,
    )

    private fun DocumentSnapshot.toPeriodo(): Periodo? {
        val data = data ?: return null
        return Periodo(
            id = id,
            etiqueta = data["etiqueta"] as? String ?: return null,
            orden = (data["orden"] as? Number)?.toInt() ?: return null,
        )
    }

    private companion object {
        // Los mismos periodos que PERIODS en data/places.js (sin "Todos").
        val PERIODOS_POR_DEFECTO = listOf(
            Periodo("prehispanico", "Prehispánico", 1),
            Periodo("XVI", "Siglo XVI", 2),
            Periodo("XVII", "Siglo XVII", 3),
            Periodo("XVIII", "Siglo XVIII", 4),
            Periodo("XIX", "Siglo XIX", 5),
            Periodo("XX", "Siglo XX", 6),
        )
    }
}