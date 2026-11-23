package repository

import at.favre.lib.crypto.bcrypt.BCrypt
import com.google.cloud.firestore.DocumentSnapshot
import com.google.cloud.firestore.Firestore
import com.google.cloud.firestore.Transaction
import com.google.firebase.cloud.FirestoreClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import models.Usuario
import models.UsuarioPerfil
import models.enums.RolUsuario

// Colección "usuarios". El id del documento es el correo normalizado (minúsculas, sin
// espacios), lo que garantiza un solo usuario por correo. La contraseña se guarda como
// hash BCrypt en `contraseniaHash`; nunca se devuelve ni se guarda en texto plano.
// Los favoritos de cada usuario viven en la subcolección usuarios/{id}/favoritos.
class UsuarioRepository {

    private val db: Firestore = FirestoreClient.getFirestore()
    private val collection = db.collection("usuarios")

    // -------------------------------------------------------------------
    // Registro y autenticación
    // -------------------------------------------------------------------

    /** Crea el usuario. Devuelve null si ya existe uno con ese correo. */
    suspend fun registrar(usuario: Usuario): UsuarioPerfil? = withContext(Dispatchers.IO) {
        val id = usuario.correo.comoId()
        val nombre = usuario.nombre.trim()
        val hash = BCrypt.withDefaults().hashToString(COSTO_BCRYPT, usuario.contrasenia.toCharArray())
        val ref = collection.document(id)

        // La transacción hace atómica la comprobación "no existe" + creación.
        val creado = db.runTransaction(
            Transaction.Function { tx ->
                if (tx.get(ref).get().exists()) {
                    false
                } else {
                    tx.set(
                        ref,
                        mapOf(
                            "nombre" to nombre,
                            "correo" to id,
                            "contraseniaHash" to hash,
                            "rol" to usuario.rol.name.lowercase(),
                            "createdAt" to com.google.cloud.Timestamp.now(),
                        ),
                    )
                    true
                }
            },
        ).get()

        if (creado) UsuarioPerfil(id = id, nombre = nombre, correo = id, rol = usuario.rol) else null
    }

    /**
     * Verifica correo y contraseña. Devuelve el perfil si son correctos y null en
     * cualquier otro caso (correo inexistente o contraseña errónea), para que la ruta
     * responda igual en ambos y no revele qué correos están registrados.
     */
    suspend fun autenticar(correo: String, contrasenia: String): UsuarioPerfil? = withContext(Dispatchers.IO) {
        val doc = collection.document(correo.comoId()).get().get()
        if (!doc.exists()) return@withContext null
        val hash = doc.getString("contraseniaHash") ?: return@withContext null
        val correcta = BCrypt.verifyer().verify(contrasenia.toCharArray(), hash).verified
        if (correcta) doc.toPerfil() else null
    }

    // -------------------------------------------------------------------
    // Lecturas y actualizaciones
    // -------------------------------------------------------------------

    suspend fun getById(id: String): UsuarioPerfil? = withContext(Dispatchers.IO) {
        val doc = collection.document(id).get().get()
        if (doc.exists()) doc.toPerfil() else null
    }

    suspend fun getByCorreo(correo: String): UsuarioPerfil? = getById(correo.comoId())

    /** Cambia el nombre. Devuelve false si el usuario no existe. */
    suspend fun actualizarNombre(id: String, nombre: String): Boolean = withContext(Dispatchers.IO) {
        val ref = collection.document(id)
        if (ref.get().get().exists()) {
            ref.update("nombre", nombre.trim()).get()
            true
        } else {
            false
        }
    }

    /** Elimina al usuario y todos sus favoritos. Devuelve false si no existe. */
    suspend fun delete(id: String): Boolean = withContext(Dispatchers.IO) {
        val ref = collection.document(id)
        if (!ref.get().get().exists()) return@withContext false

        // Firestore no borra las subcolecciones al borrar el documento padre.
        // (Un batch admite hasta 500 operaciones; sobra para favoritos.)
        val favoritos = ref.collection("favoritos").listDocuments().toList()
        if (favoritos.isNotEmpty()) {
            val batch = db.batch()
            favoritos.forEach { batch.delete(it) }
            batch.commit().get()
        }
        ref.delete().get()
        true
    }

    /** Ruta del documento de una organización dentro de uploads/, o null si no tiene. */
    suspend fun rutaDocumento(id: String): String? = withContext(Dispatchers.IO) {
        collection.document(id.comoId()).get().get().getString("documentoRuta")
    }

    /** Guarda los metadatos y la ruta del documento (el archivo está en uploads/) y deja la cuenta pendiente. */
    suspend fun guardarDocumento(id: String, tipo: String, nombreOriginal: String, tamanioBytes: Int, ruta: String) =
        withContext(Dispatchers.IO) {
            collection.document(id).update(
                mapOf(
                    "documentoTipo" to tipo,
                    "documentoNombre" to nombreOriginal,
                    "documentoTamanio" to tamanioBytes,
                    "documentoRuta" to ruta,
                    "estadoVerificacion" to "pendiente",
                ),
            ).get()
            Unit
        }

    // -------------------------------------------------------------------
    // Utilidades
    // -------------------------------------------------------------------

    private fun DocumentSnapshot.toPerfil(): UsuarioPerfil? {
        val rolGuardado = getString("rol")

        val rol = when (rolGuardado) {
            "organizacion" -> RolUsuario.ORGANIZACION
            "usuario" -> RolUsuario.USUARIO
            null -> RolUsuario.USUARIO
            else -> return null
        }

        return UsuarioPerfil(
            id = id,
            nombre = getString("nombre") ?: return null,
            correo = getString("correo") ?: id,
            rol = rol
        )
    }

    // Un id de documento de Firestore no puede contener "/". La ruta debe validar el
    // formato del correo antes de llegar aquí; esto es solo una red de seguridad.
    private fun String.comoId(): String {
        val id = trim().lowercase()
        require(id.isNotEmpty() && '/' !in id) { "Correo no válido" }
        return id
    }

    private companion object {
        const val COSTO_BCRYPT = 12
    }
}