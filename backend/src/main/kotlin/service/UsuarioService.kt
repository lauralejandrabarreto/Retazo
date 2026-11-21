package service

import models.DocumentoAdjunto
import models.Usuario
import models.UsuarioPerfil
import models.enums.RolUsuario
import repository.UsuarioRepository

/** Credenciales incorrectas o token ausente/inválido -> 401 Unauthorized. */
class NoAutenticadoException(mensaje: String = "Credenciales incorrectas.") : ServicioException(mensaje)

const val MAX_MB_DOCUMENTO = 10
const val MAX_BYTES_DOCUMENTO = MAX_MB_DOCUMENTO * 1024 * 1024
// Capa de negocio de cuentas de usuario: registro, inicio de sesión y gestión del perfil.
//  - Valida y normaliza los datos antes de llegar al repositorio.
//  - Nunca devuelve la contraseña: siempre responde con UsuarioPerfil.
class UsuarioService(
    private val repository: UsuarioRepository = UsuarioRepository(),
) {


    // -------------------------------------------------------------------
    // Registro e inicio de sesión
    // -------------------------------------------------------------------

    /** Crea la cuenta. Lanza ConflictoException si el correo ya está registrado. */
    suspend fun registrar(usuario: Usuario): UsuarioPerfil {

        val limpio = usuario.copy(
            nombre = usuario.nombre.trim(),
            correo = usuario.correo.trim().lowercase()
        )

        val errores = buildList {
            if (limpio.nombre.isEmpty() || limpio.nombre.length > MAX_NOMBRE) {
                add("El nombre es obligatorio (máximo $MAX_NOMBRE caracteres).")
            }

            if (limpio.correo.length > MAX_CORREO || !CORREO.matches(limpio.correo)) {
                add("El correo no tiene un formato válido.")
            }

            if (limpio.contrasenia.length < MIN_CONTRASENIA) {
                add("La contraseña debe tener al menos $MIN_CONTRASENIA caracteres.")
            }

            if (limpio.contrasenia.excedeLimiteBcrypt()) {
                add("La contraseña es demasiado larga (máximo $MAX_BYTES_CONTRASENIA bytes).")
            }
        }

        if (errores.isNotEmpty()) {
            throw ValidacionException(errores)
        }

        return repository.registrar(limpio) ?: throw ConflictoException("Ya existe una cuenta con ese correo.")
    }

    /**
     * Registra un ente organizacional: valida datos y documento, crea la cuenta con rol
     * ORGANIZACION, sube el documento y la deja en estado "pendiente".
     */
    suspend fun registrarOrganizacion(
        nombre: String,
        correo: String,
        contrasenia: String,
        documento: DocumentoAdjunto?,
    ): UsuarioPerfil {
        val limpio = Usuario(
            nombre = nombre.trim(),
            correo = correo.trim().lowercase(),
            contrasenia = contrasenia,
            rol = RolUsuario.ORGANIZACION,
        )
        validarDatos(limpio)

        // El tipo se deduce de los bytes (firma del archivo), no del Content-Type del cliente.
        val tipo = documento?.let { tipoDocumento(it.bytes) }
        val errorDoc = when {
            documento == null || documento.bytes.isEmpty() -> "El documento oficial es obligatorio."
            documento.bytes.size > MAX_BYTES_DOCUMENTO -> "El documento no puede superar los $MAX_MB_DOCUMENTO MB."
            tipo == null -> "El documento debe ser PDF, JPG o PNG."
            else -> null
        }
        if (errorDoc != null) throw ValidacionException(listOf(errorDoc))

        val perfil = repository.registrar(limpio)
            ?: throw ConflictoException("Ya existe una cuenta con ese correo.")

        // El archivo se descarta: solo se registran sus metadatos.
        try {
            repository.guardarDocumento(
                id = perfil.id,
                tipo = tipo!!.second,
                nombreOriginal = documento!!.nombreOriginal.take(200),
                tamanioBytes = documento.bytes.size,
            )
        } catch (e: Exception) {
            runCatching { repository.delete(perfil.id) } // rollback para no dejar la cuenta sin estado
            throw e
        }
        return perfil
    }

    private fun tipoDocumento(b: ByteArray): Pair<String, String>? = when {
        b.size >= 4 && b[0] == 0x25.toByte() && b[1] == 0x50.toByte() &&
                b[2] == 0x44.toByte() && b[3] == 0x46.toByte() -> "pdf" to "application/pdf"
        b.size >= 8 && b[0] == 0x89.toByte() && b[1] == 0x50.toByte() &&
                b[2] == 0x4E.toByte() && b[3] == 0x47.toByte() -> "png" to "image/png"
        b.size >= 3 && b[0] == 0xFF.toByte() && b[1] == 0xD8.toByte() &&
                b[2] == 0xFF.toByte() -> "jpg" to "image/jpeg"
        else -> null
    }

    /**
     * Verifica las credenciales. Siempre lanza el mismo NoAutenticadoException, exista o
     * no el correo, para no revelar qué correos están registrados.
     */
    suspend fun iniciarSesion(correo: String, contrasenia: String): UsuarioPerfil {
        val correoLimpio = correo.trim().lowercase()

        // Entradas que el repositorio no puede procesar (lanzarían una excepción -> 500).
        if (correoLimpio.isEmpty() || '/' in correoLimpio || contrasenia.isEmpty() || contrasenia.excedeLimiteBcrypt()) {
            throw NoAutenticadoException()
        }
        return repository.autenticar(correoLimpio, contrasenia) ?: throw NoAutenticadoException()
    }

    // -------------------------------------------------------------------
    // Perfil
    // -------------------------------------------------------------------

    suspend fun obtener(id: String): UsuarioPerfil =
        repository.getById(id) ?: throw NoEncontradoException("El usuario no existe.")

    suspend fun actualizarNombre(id: String, nombre: String): UsuarioPerfil {
        val limpio = nombre.trim()
        if (limpio.isEmpty() || limpio.length > MAX_NOMBRE) {
            throw ValidacionException(listOf("El nombre es obligatorio (máximo $MAX_NOMBRE caracteres)."))
        }
        if (!repository.actualizarNombre(id, limpio)) {
            throw NoEncontradoException("El usuario no existe.")
        }
        return obtener(id)
    }

    /** Elimina la cuenta y sus favoritos. */
    suspend fun eliminar(id: String) {
        if (!repository.delete(id)) throw NoEncontradoException("El usuario no existe.")
    }

    // -------------------------------------------------------------------

    // BCrypt solo usa los primeros 72 bytes y la librería rechaza contraseñas más largas.
    private fun String.excedeLimiteBcrypt(): Boolean =
        toByteArray(Charsets.UTF_8).size > MAX_BYTES_CONTRASENIA

    private companion object {
        const val MAX_NOMBRE = 100
        const val MAX_CORREO = 200
        const val MIN_CONTRASENIA = 8
        const val MAX_BYTES_CONTRASENIA = 72
        val CORREO = Regex("^[^\\s@/]+@[^\\s@/]+\\.[^\\s@/]+$")
    }

    private fun validarDatos(limpio: Usuario) {
        val errores = buildList {
            if (limpio.nombre.isEmpty() || limpio.nombre.length > MAX_NOMBRE) {
                add("El nombre es obligatorio (máximo $MAX_NOMBRE caracteres).")
            }
            if (limpio.correo.length > MAX_CORREO || !CORREO.matches(limpio.correo)) {
                add("El correo no tiene un formato válido.")
            }
            if (limpio.contrasenia.length < MIN_CONTRASENIA) {
                add("La contraseña debe tener al menos $MIN_CONTRASENIA caracteres.")
            }
            if (limpio.contrasenia.excedeLimiteBcrypt()) {
                add("La contraseña es demasiado larga (máximo $MAX_BYTES_CONTRASENIA bytes).")
            }
        }
        if (errores.isNotEmpty()) throw ValidacionException(errores)
    }
}