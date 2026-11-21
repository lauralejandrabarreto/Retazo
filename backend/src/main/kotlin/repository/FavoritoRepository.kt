package repository

import com.google.cloud.Timestamp
import com.google.cloud.firestore.CollectionReference
import com.google.cloud.firestore.Firestore
import com.google.cloud.firestore.Query
import com.google.firebase.cloud.FirestoreClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

// Favoritos de cada usuario: subcolección usuarios/{usuarioId}/favoritos/{lugarId}.
// El id del documento es el id del lugar (así no se puede guardar dos veces el mismo)
// y el campo `createdAt` permite mostrar primero el más reciente, como en el frontend.
// El repositorio devuelve solo ids; la ruta los combina con LugarRepository para
// armar las tarjetas.
class FavoritoRepository {

    private val db: Firestore = FirestoreClient.getFirestore()
    private val lugares = db.collection("lugares")

    private fun favoritos(usuarioId: String): CollectionReference =
        db.collection("usuarios").document(usuarioId).collection("favoritos")

    // -------------------------------------------------------------------
    // Lecturas
    // -------------------------------------------------------------------

    /** Ids de los lugares favoritos, el más reciente primero. */
    suspend fun getLugarIds(usuarioId: String): List<String> = withContext(Dispatchers.IO) {
        favoritos(usuarioId)
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .get().get()
            .documents.map { it.id }
    }

    suspend fun isFavorito(usuarioId: String, lugarId: String): Boolean = withContext(Dispatchers.IO) {
        favoritos(usuarioId).document(lugarId).get().get().exists()
    }

    // -------------------------------------------------------------------
    // Escrituras
    // -------------------------------------------------------------------

    /**
     * Guarda el lugar como favorito. Devuelve false si el lugar no existe.
     * Si ya era favorito no hace nada (conserva su fecha original) y devuelve true.
     */
    suspend fun add(usuarioId: String, lugarId: String): Boolean = withContext(Dispatchers.IO) {
        if (!lugares.document(lugarId).get().get().exists()) return@withContext false

        val ref = favoritos(usuarioId).document(lugarId)
        if (!ref.get().get().exists()) {
            ref.set(mapOf("createdAt" to Timestamp.now())).get()
        }
        true
    }

    /** Quita el favorito. Devuelve false si no estaba guardado. */
    suspend fun remove(usuarioId: String, lugarId: String): Boolean = withContext(Dispatchers.IO) {
        val ref = favoritos(usuarioId).document(lugarId)
        if (ref.get().get().exists()) {
            ref.delete().get()
            true
        } else {
            false
        }
    }
}