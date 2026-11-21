package security

import com.auth0.jwt.JWT
import com.auth0.jwt.JWTVerifier
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.jwt.jwt
import io.ktor.server.auth.principal
import io.ktor.server.response.respond
import models.UsuarioPerfil
import models.enums.RolUsuario
import routes.RespuestaError
import service.NoAutenticadoException
import java.util.Date
import kotlin.time.Duration
import kotlin.time.Duration.Companion.days

const val AUTH_JWT = "auth-jwt"

/** Se lanza cuando el usuario tiene sesión válida pero su rol no permite la acción (403). */
class AccesoDenegadoException(mensaje: String = "No tienes permiso para esta acción.") :
    RuntimeException(mensaje)

/** Emite y verifica los tokens de sesión. El id del usuario (su correo) va en el campo `sub`. */
class TokenService(
    secret: String,
    private val emisor: String = "retazo",
    private val audiencia: String = "retazo-app",
    private val validez: Duration = 7.days,
) {
    init {
        require(secret.length >= 32) { "El secreto JWT debe tener al menos 32 caracteres." }
    }

    private val algoritmo = Algorithm.HMAC256(secret)

    val verificador: JWTVerifier = JWT.require(algoritmo)
        .withIssuer(emisor)
        .withAudience(audiencia)
        .build()

    fun generar(usuario: UsuarioPerfil): String =
        JWT.create()
            .withIssuer(emisor)
            .withAudience(audiencia)
            .withSubject(usuario.id)
            .withClaim("rol", usuario.rol.name.lowercase())
            .withExpiresAt(Date(System.currentTimeMillis() + validez.inWholeMilliseconds))
            .sign(algoritmo)
}

// Instala la autenticación JWT. Debe llamarse ANTES de registrar las rutas protegidas.
fun Application.configureSeguridad(tokens: TokenService) {
    install(Authentication) {
        jwt(AUTH_JWT) {
            realm = "Retazo"
            verifier(tokens.verificador)
            validate { credencial ->
                if (!credencial.payload.subject.isNullOrBlank()) JWTPrincipal(credencial.payload) else null
            }
            challenge { _, _ ->
                call.respond(HttpStatusCode.Unauthorized, RespuestaError("Token ausente, inválido o vencido."))
            }
        }
    }
}

/** Id del usuario autenticado, leído del token. Solo se usa dentro de authenticate(AUTH_JWT) { }. */
fun ApplicationCall.usuarioAutenticado(): String =
    principal<JWTPrincipal>()?.payload?.subject
        ?: throw NoAutenticadoException("Sesión no válida.")

fun ApplicationCall.rolAutenticado(): RolUsuario {
    val rol = principal<JWTPrincipal>()
        ?.payload
        ?.getClaim("rol")
        ?.asString()

    return when (rol) {
        "usuario" -> RolUsuario.USUARIO
        "organizacion" -> RolUsuario.ORGANIZACION
        else -> throw NoAutenticadoException("Rol de usuario no válido.")
    }
}

/** Lanza 403 si el rol del token no está entre los permitidos. */
fun ApplicationCall.exigirRol(vararg permitidos: RolUsuario) {
    if (rolAutenticado() !in permitidos) throw AccesoDenegadoException()
}