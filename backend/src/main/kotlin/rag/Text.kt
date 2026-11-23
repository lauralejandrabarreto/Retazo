package rag

import java.text.Normalizer

// Utilidades de texto para la búsqueda en español.
object Text {
    private val accents = "\\p{Mn}+".toRegex()
    private val nonWord = "[^a-z0-9ñ]+".toRegex()

    // Palabras muy frecuentes que no ayudan a distinguir un fragmento de otro.
    private val stopwords = setOf(
        "a", "al", "algo", "algun", "alguna", "algunos", "ante", "antes", "asi", "aun", "cada", "como", "con",
        "contra", "cual", "cuales", "cuando", "de", "del", "desde", "donde", "durante", "e", "el", "ella",
        "ellos", "en", "entre", "era", "eran", "es", "esa", "ese", "eso", "esta", "estaba", "estan", "este",
        "esto", "fue", "fueron", "ha", "han", "hasta", "hay", "la", "las", "le", "les", "lo", "los", "mas",
        "me", "mi", "muy", "ni", "no", "o", "otra", "otro", "para", "pero", "por", "porque", "que", "quien",
        "se", "segun", "ser", "si", "sin", "sobre", "son", "su", "sus", "tambien", "te", "tiene", "tienen",
        "tu", "un", "una", "uno", "unos", "unas", "y", "ya", "yo", "cuanto", "cuantos", "cuantas",
        "que", "lugar", "sabes", "dime", "cuentame", "puedes", "podrias", "saber", "quiero",
    )

    fun normalize(text: String): String =
        Normalizer.normalize(text.lowercase(), Normalizer.Form.NFD)
            .replace(accents, "")

    // Convierte un texto en "términos": minúsculas, sin tildes, sin palabras vacías
    // y recortados a una raíz aproximada de 6 letras, para que "construcción",
    // "construyó" y "construida" coincidan ("constr").
    fun terms(text: String): List<String> =
        normalize(text).split(nonWord)
            .filter { it.length >= 2 && it !in stopwords }
            .map { if (it.all(Char::isDigit)) it else it.take(6) }

    // Divide un texto en oraciones (para el modo extractivo).
    fun sentences(text: String): List<String> =
        text.replace("\n", " ")
            .split("(?<=[.!?])\\s+(?=[A-ZÁÉÍÓÚÑ0-9«(])".toRegex())
            .map { it.trim() }
            .filter { it.length > 25 }
}
