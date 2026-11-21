package repository

import com.google.cloud.firestore.DocumentSnapshot
import com.google.cloud.firestore.Firestore
import com.google.firebase.cloud.FirestoreClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import models.Coordenadas
import models.FotoHistorica
import models.Fuente
import models.LugarCercano
import models.LugarHistorico
import models.SeccionHistoria
import models.enums.TipoFuente
import models.mapping.toResumen
import java.text.Normalizer
import kotlin.math.asin
import kotlin.math.cos
import kotlin.math.pow
import kotlin.math.sin
import kotlin.math.sqrt

// Cada lugar es UN documento en la colección "lugares"; su id es el slug ("plaza-bolivar").
// Las fotos, la historia y las fuentes van anidadas dentro del documento, igual que en el JSON
// que consume el frontend. `contenidoVerificado` NO se guarda: se deriva de las fuentes.
class LugarRepository {

    private val db: Firestore = FirestoreClient.getFirestore()
    private val collection = db.collection("lugares")

    // -------------------------------------------------------------------
    // Lecturas
    // -------------------------------------------------------------------

    suspend fun getAll(): List<LugarHistorico> = withContext(Dispatchers.IO) {
        collection.get().get().documents.mapNotNull { it.toLugar() }
    }

    suspend fun getById(id: String): LugarHistorico? = withContext(Dispatchers.IO) {
        val doc = collection.document(id).get().get()
        if (doc.exists()) doc.toLugar() else null
    }

    /** Filtro por periodo en el servidor (siglo = "prehispanico", "XVI", ... "XX"). */
    suspend fun getBySiglo(siglo: String): List<LugarHistorico> = withContext(Dispatchers.IO) {
        collection.whereEqualTo("siglo", siglo).get().get().documents.mapNotNull { it.toLugar() }
    }

    /**
     * Búsqueda por nombre, sector o ciudad, sin distinguir tildes ni mayúsculas,
     * combinable con el filtro de periodo (RF-04 y RF-05).
     * Firestore no soporta "contiene" ni ignorar tildes, así que se filtra en memoria.
     */
    suspend fun search(query: String = "", siglo: String = "todos"): List<LugarHistorico> {
        val base = if (siglo == "todos") getAll() else getBySiglo(siglo)
        val q = query.normalizar()
        if (q.isEmpty()) return base
        return base.filter { l ->
            listOf(l.nombre, l.sector, l.ciudad).any { it.normalizar().contains(q) }
        }
    }

    /** Lugares a menos de [maxMeters] de (lat, lng), ordenados por distancia (RF-01). */
    suspend fun getNearby(
        lat: Double,
        lng: Double,
        maxMeters: Double = 3000.0,
        limit: Int = 3,
    ): List<LugarCercano> =
        getAll()
            .map { LugarCercano(it.toResumen(), distanciaEnMetros(lat, lng, it.coords.lat, it.coords.lng)) }
            .filter { it.distancia <= maxMeters }
            .sortedBy { it.distancia }
            .take(limit)

    // -------------------------------------------------------------------
    // Escrituras (todas esperan el resultado con .get() para detectar errores)
    // -------------------------------------------------------------------

    /** Crea un lugar con el id que trae (slug). Devuelve false si ya existe. */
    suspend fun save(lugar: LugarHistorico): Boolean = withContext(Dispatchers.IO) {
        val ref = collection.document(lugar.id)
        if (ref.get().get().exists()) {
            false
        } else {
            ref.set(lugar.toMap()).get()
            true
        }
    }

    /** Reemplaza los datos de un lugar existente. Devuelve false si no existe. */
    suspend fun update(id: String, lugar: LugarHistorico): Boolean = withContext(Dispatchers.IO) {
        val ref = collection.document(id)
        if (ref.get().get().exists()) {
            ref.set(lugar.copy(id = id).toMap()).get() // set reemplaza el documento completo
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

    // -------------------------------------------------------------------
    // Mapeo Documento <-> LugarHistorico
    // -------------------------------------------------------------------

    private fun LugarHistorico.toMap(): Map<String, Any?> = mapOf(
        "nombre" to nombre,
        "sector" to sector,
        "ciudad" to ciudad,
        "pais" to pais,
        "siglo" to siglo,
        "epoca" to epoca,
        "coords" to mapOf("lat" to coords.lat, "lng" to coords.lng),
        "imagen" to imagen,
        "imagenActual" to imagenActual,
        "descripcion" to descripcion,
        "fotosHistoricas" to fotosHistoricas.map {
            mapOf("anio" to it.anio, "uri" to it.uri)
        },
        "historia" to historia.map {
            mapOf("titulo" to it.titulo, "texto" to it.texto)
        },
        "fuentes" to fuentes.map {
            mapOf("titulo" to it.titulo, "detalle" to it.detalle, "url" to it.url, "verificada" to it.verificada)
        },
        // contenidoVerificado no se guarda: se calcula al leer.
    )

    private fun DocumentSnapshot.toLugar(): LugarHistorico? {
        val data = data ?: return null
        val c = data["coords"] as? Map<*, *> ?: return null

        val fuentes = data.lista("fuentes").map {
            Fuente(
                titulo = it.texto("titulo") ?: "",
                detalle = it.texto("detalle") ?: "",
                tipo = runCatching { TipoFuente.valueOf(it.texto("tipo") ?: "") }.getOrDefault(TipoFuente.WEB),
                url = it.texto("url"),
                verificada = it["verificada"] as? Boolean ?: false,
            )
        }

        return LugarHistorico(
            id = id,
            nombre = data["nombre"] as? String ?: return null,
            sector = data["sector"] as? String ?: "",
            ciudad = data["ciudad"] as? String ?: "",
            pais = data["pais"] as? String ?: "",
            siglo = data["siglo"] as? String ?: "",
            epoca = data["epoca"] as? String ?: "",
            coords = Coordenadas(
                lat = (c["lat"] as? Number)?.toDouble() ?: return null,
                lng = (c["lng"] as? Number)?.toDouble() ?: return null,
            ),
            imagen = data["imagen"] as? String,
            imagenActual = data["imagenActual"] as? String,
            descripcion = data["descripcion"] as? String ?: "",
            fotosHistoricas = data.lista("fotosHistoricas").map {
                FotoHistorica(anio = it.texto("anio") ?: "", uri = it.texto("uri"))
            },
            historia = data.lista("historia").map {
                SeccionHistoria(titulo = it.texto("titulo") ?: "", texto = it.texto("texto") ?: "")
            },
            fuentes = fuentes,
            contenidoVerificado = fuentes.any { it.verificada }, // derivado
        )
    }

    // -------------------------------------------------------------------
    // Utilidades
    // -------------------------------------------------------------------

    /** Lee una lista de mapas anidados; si el campo falta o viene mal, devuelve lista vacía. */
    private fun Map<String, Any?>.lista(key: String): List<Map<String, Any?>> =
        (this[key] as? List<*>)
            ?.filterIsInstance<Map<*, *>>()
            ?.map { m -> m.entries.associate { it.key.toString() to it.value } }
            ?: emptyList()

    private fun Map<String, Any?>.texto(key: String): String? = this[key] as? String

    private fun String.normalizar(): String =
        Normalizer.normalize(this, Normalizer.Form.NFD)
            .replace(Regex("\\p{InCombiningDiacriticalMarks}+"), "")
            .lowercase()
            .trim()

    // Fórmula de Haversine (misma que utils/geo.js del frontend).
    private fun distanciaEnMetros(lat1: Double, lng1: Double, lat2: Double, lng2: Double): Double {
        val r = 6_371_000.0
        val dLat = Math.toRadians(lat2 - lat1)
        val dLng = Math.toRadians(lng2 - lng1)
        val h = sin(dLat / 2).pow(2) +
                cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) * sin(dLng / 2).pow(2)
        return 2 * r * asin(sqrt(h))
    }
}