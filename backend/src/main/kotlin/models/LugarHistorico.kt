package models

import kotlinx.serialization.Serializable

@Serializable
data class LugarHistorico(
    val id: String,
    val nombre: String,
    val sector: String,
    val ciudad: String,
    val pais: String,
    val siglo: String,
    val epoca: String,
    val coords: Coordenadas,
    val imagen: String? = null,
    val imagenActual: String? = null,
    val descripcion: String,
    val fotosHistoricas: List<FotoHistorica> = emptyList(),
    val historia: List<SeccionHistoria> = emptyList(),
    val fuentes: List<Fuente> = emptyList(),
    // Derivado: true solo si el lugar tiene al menos una fuente verificada.
    val contenidoVerificado: Boolean = false,
)