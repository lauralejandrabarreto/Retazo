package database

import com.google.cloud.firestore.Firestore
import com.google.firebase.cloud.FirestoreClient
import config.initFirebase
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.Json
import models.LugarHistorico
import models.Usuario
import models.enums.RolUsuario
import repository.LugarRepository
import repository.PeriodoRepository
import repository.UsuarioRepository
import java.io.File

// Script de creación y carga inicial de la base de datos (Firestore).
//
//   gradlew seed               crea lo que falte: periodos, los 10 lugares y 2 usuarios de prueba
//   gradlew seed -Preset=true  BORRA lugares, periodos y usuarios, y vuelve a cargar todo
//
// Firestore crea las colecciones automáticamente al escribir el primer documento, por eso
// "crear la base" = escribir los documentos iniciales con la estructura del modelo de datos
// (ver database/README.md). Usa las mismas credenciales que el servidor.

private val json = Json { ignoreUnknownKeys = true }

private val USUARIOS_DEMO = listOf(
    Usuario("Usuario demo", "demo@retazo.com", "Retazo123", RolUsuario.USUARIO),
    Usuario("Archivo Histórico Demo", "ente@retazo.org", "Retazo123", RolUsuario.ORGANIZACION),
)

fun main(args: Array<String>) {
    runBlocking { sembrar(args) }
    // Los clientes de Firestore dejan hilos abiertos; se termina el proceso explícitamente.
    kotlin.system.exitProcess(0)
}

private suspend fun sembrar(args: Array<String>) {
    val reset = "--reset" in args
    val archivoLugares = File(args.firstOrNull { !it.startsWith("--") } ?: "database/seed/lugares.json")
    require(archivoLugares.isFile) { "No se encontró ${archivoLugares.absolutePath}" }

    initFirebase()
    val db: Firestore = FirestoreClient.getFirestore()

    if (reset) {
        println("ATENCION: borrando colecciones lugares, periodos y usuarios…")
        borrarColeccion(db, "lugares")
        borrarColeccion(db, "periodos")
        db.collection("usuarios").listDocuments().forEach { u ->
            u.collection("favoritos").listDocuments().forEach { it.delete().get() }
            u.delete().get()
        }
    }

    // 1. Periodos del filtro de Buscar (solo si la colección está vacía).
    val periodosCreados = PeriodoRepository().sembrarSiVacio()
    println("Periodos: ${if (periodosCreados) "6 creados" else "ya existían"}")

    // 2. Lugares históricos: crea los que falten y actualiza los existentes (idempotente).
    val lugares = json.decodeFromString<List<LugarHistorico>>(archivoLugares.readText(Charsets.UTF_8))
    val repoLugares = LugarRepository()
    var creados = 0
    var actualizados = 0
    for (lugar in lugares) {
        if (repoLugares.save(lugar)) creados++ else if (repoLugares.update(lugar.id, lugar)) actualizados++
    }
    println("Lugares: $creados creados, $actualizados actualizados")

    // 3. Usuarios de prueba (contraseña Retazo123). Si ya existen no se modifican.
    val repoUsuarios = UsuarioRepository()
    for (u in USUARIOS_DEMO) {
        val perfil = repoUsuarios.registrar(u)
        if (perfil != null && u.rol == RolUsuario.ORGANIZACION) {
            // La organización de prueba queda aprobada para poder agregar lugares en la demo.
            db.collection("usuarios").document(perfil.id).update("estadoVerificacion", "aprobada").get()
        }
        println("Usuario ${u.correo}: ${if (perfil != null) "creado" else "ya existía"}")
    }

    println("Base de datos lista.")
}

private fun borrarColeccion(db: Firestore, nombre: String) {
    val docs = db.collection(nombre).listDocuments().toList()
    docs.chunked(400).forEach { grupo ->
        val batch = db.batch()
        grupo.forEach { batch.delete(it) }
        batch.commit().get()
    }
    println("  $nombre: ${docs.size} documentos borrados")
}
